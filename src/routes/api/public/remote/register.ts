import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { runRegisterDevice } from "@/lib/remote-logic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const payloadSchema = z.object({
  deviceId: z.string().min(3).max(32),
  pin: z.string().min(4).max(8),
  alias: z.string().max(80).optional().nullable(),
  platform: z.string().max(40).optional().nullable(),
  appVersion: z.string().max(40).optional().nullable(),
});

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

export const Route = createFileRoute("/api/public/remote/register")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { headers: corsHeaders }),
      POST: async ({ request }) => {
        const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Invalid request" }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await runRegisterDevice(supabaseAdmin as any, parsed.data);
        return json(result.body, { status: result.status });
      },
    },
  },
});
