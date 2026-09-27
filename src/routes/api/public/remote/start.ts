import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const payloadSchema = z.object({
  partnerDeviceId: z.string().min(3).max(32),
  pin: z.string().min(4).max(8),
});

function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

function isRecent(value: string | null | undefined) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() <= 2 * 60 * 1000;
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

export const Route = createFileRoute("/api/public/remote/start")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: corsHeaders }),
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, { status: 401 });

        const token = authHeader.slice("Bearer ".length).trim();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as any;
        const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !userResult.user) return json({ error: "Invalid session" }, { status: 401 });

        const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Invalid request" }, { status: 400 });

        const partnerDeviceId = normalizeDeviceId(parsed.data.partnerDeviceId);
        const pin = parsed.data.pin.replace(/\D/g, "");

        const { data: supportClient, error: supportClientError } = await admin
          .from("client_devices")
          .select("device_id,current_pin,last_seen")
          .eq("device_id", partnerDeviceId)
          .maybeSingle();

        if (supportClientError) return json({ error: "Unable to verify partner" }, { status: 500 });
        const { data: accountDevice, error: accountDeviceError } = supportClient
          ? { data: null, error: null }
          : await admin.from("devices").select("device_id,pin,last_seen").eq("device_id", partnerDeviceId).maybeSingle();

        if (accountDeviceError) return json({ error: "Unable to verify partner" }, { status: 500 });
        const target = supportClient ?? accountDevice;
        const targetPin = supportClient?.current_pin ?? accountDevice?.pin;
        if (target && targetPin !== pin) return json({ error: "PIN does not match" }, { status: 403 });

        const partnerOnline = isRecent(target?.last_seen);
        const status = target ? (partnerOnline ? "connected" : "waiting") : "waiting";

        const { data: session, error: sessionError } = await supabaseAdmin
          .from("sessions")
          .insert({
            host_owner_id: userResult.user.id,
            partner_device_id: partnerDeviceId,
            status,
          })
          .select("id,started_at,status")
          .single();

        if (sessionError || !session) return json({ error: "Unable to start session" }, { status: 500 });

        return json({
          sessionId: session.id,
          startedAt: session.started_at,
          status: session.status,
          partnerOnline,
          targetKnown: Boolean(target),
        });
      },
    },
  },
});