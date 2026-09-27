import { createFileRoute } from "@tanstack/react-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

export const Route = createFileRoute("/api/public/remote/stream")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: corsHeaders }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawDevice = url.searchParams.get("deviceId") ?? "";
        const pin = (url.searchParams.get("pin") ?? "").replace(/\D/g, "");
        const deviceId = normalizeDeviceId(rawDevice);
        if (!deviceId || !pin) {
          return new Response("Invalid request", { status: 400, headers: corsHeaders });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as any;

        // verify device + pin once up front
        const { data: client } = await admin
          .from("client_devices")
          .select("current_pin")
          .eq("device_id", deviceId)
          .maybeSingle();
        let authorized = client ? client.current_pin === pin : false;
        let table: "client_devices" | "devices" = "client_devices";
        if (!authorized) {
          const { data: account } = await admin
            .from("devices")
            .select("pin")
            .eq("device_id", deviceId)
            .maybeSingle();
          authorized = !!account && account.pin === pin;
          table = "devices";
        }
        if (!authorized) {
          return new Response("Invalid device or PIN", { status: 403, headers: corsHeaders });
        }

        const encoder = new TextEncoder();
        const seen = new Set<string>();
        let closed = false;

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (event: string, payload: unknown) => {
              if (closed) return;
              try {
                controller.enqueue(
                  encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
                );
              } catch {
                closed = true;
              }
            };

            send("ready", { deviceId });

            const tick = async () => {
              if (closed) return;
              const now = new Date().toISOString();
              // heartbeat this device so the dashboard sees it online
              await admin.from(table).update({ last_seen: now }).eq("device_id", deviceId);

              const { data: sessions } = await admin
                .from("sessions")
                .select("id,host_owner_id,started_at,status")
                .eq("partner_device_id", deviceId)
                .in("status", ["waiting", "connected"])
                .order("started_at", { ascending: false })
                .limit(5);

              for (const s of sessions ?? []) {
                if (!seen.has(s.id)) {
                  seen.add(s.id);
                  send("session", s);
                }
              }
              send("heartbeat", { at: now });
            };

            await tick();
            const interval = setInterval(tick, 3000);
            // Close after ~55s so clients reconnect (EventSource auto-reconnects)
            const timeout = setTimeout(() => {
              closed = true;
              clearInterval(interval);
              try {
                controller.close();
              } catch {}
            }, 55_000);

            (request.signal as AbortSignal | undefined)?.addEventListener("abort", () => {
              closed = true;
              clearInterval(interval);
              clearTimeout(timeout);
              try {
                controller.close();
              } catch {}
            });
          },
          cancel() {
            closed = true;
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            ...corsHeaders,
            "content-type": "text/event-stream",
            "cache-control": "no-cache, no-transform",
            "x-accel-buffering": "no",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
