import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const payloadSchema = z.object({
  deviceId: z.string().min(3).max(32),
  pin: z.string().min(4).max(8),
});

function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, { ...init, headers: { ...corsHeaders, ...(init?.headers ?? {}) } });
}

export const Route = createFileRoute("/api/public/remote/pending")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: corsHeaders }),
      POST: async ({ request }) => {
        const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Invalid request" }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as any;
        const deviceId = normalizeDeviceId(parsed.data.deviceId);
        const pin = parsed.data.pin.replace(/\D/g, "");
        const now = new Date().toISOString();

        // verify device + pin (client_devices first, fall back to account devices)
        const { data: client } = await admin
          .from("client_devices")
          .select("device_id,current_pin")
          .eq("device_id", deviceId)
          .maybeSingle();

        let authorized = false;
        if (client) {
          authorized = client.current_pin === pin;
          if (authorized) {
            await admin
              .from("client_devices")
              .update({ last_seen: now })
              .eq("device_id", deviceId);
          }
        } else {
          const { data: account } = await admin
            .from("devices")
            .select("device_id,pin")
            .eq("device_id", deviceId)
            .maybeSingle();
          authorized = !!account && account.pin === pin;
          if (authorized) {
            await admin.from("devices").update({ last_seen: now }).eq("device_id", deviceId);
          }
        }
        if (!authorized) return json({ error: "Invalid device or PIN" }, { status: 403 });

        const { data: sessions } = await admin
          .from("sessions")
          .select("id,host_owner_id,started_at,status")
          .eq("partner_device_id", deviceId)
          .in("status", ["waiting", "connected"])
          .order("started_at", { ascending: false })
          .limit(5);

        return json({ ok: true, sessions: sessions ?? [] });
      },
    },
  },
});
