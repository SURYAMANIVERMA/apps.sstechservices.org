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
  sessionId: z.string().uuid(),
  action: z.enum(["accept", "decline"]).default("accept"),
});

function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, { ...init, headers: { ...corsHeaders, ...(init?.headers ?? {}) } });
}

export const Route = createFileRoute("/api/public/remote/accept")({
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

        const { data: client } = await admin
          .from("client_devices")
          .select("current_pin")
          .eq("device_id", deviceId)
          .maybeSingle();
        let authorized = client ? client.current_pin === pin : false;
        if (!authorized) {
          const { data: account } = await admin
            .from("devices")
            .select("pin")
            .eq("device_id", deviceId)
            .maybeSingle();
          authorized = !!account && account.pin === pin;
        }
        if (!authorized) return json({ error: "Invalid device or PIN" }, { status: 403 });

        const nextStatus =
          parsed.data.action === "accept" ? "connected" : "declined";
        const patch: Record<string, unknown> = { status: nextStatus };
        if (parsed.data.action === "decline") patch.ended_at = new Date().toISOString();

        const { error } = await admin
          .from("sessions")
          .update(patch)
          .eq("id", parsed.data.sessionId)
          .eq("partner_device_id", deviceId);
        if (error) return json({ error: "Unable to update session" }, { status: 500 });
        return json({ ok: true, status: nextStatus });
      },
    },
  },
});
