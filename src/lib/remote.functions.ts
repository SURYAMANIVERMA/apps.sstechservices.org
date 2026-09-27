import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runPairPartnerDevice } from "@/lib/remote-logic";
import { authorizeAdminAccess, recordAdminAccess, type AuditContext } from "@/lib/admin-logic";

function captureAuditContext(): AuditContext {
  let path: string | null = null;
  let ip: string | null = null;
  let userAgent: string | null = null;
  try {
    path = new URL(getRequest().url).pathname;
  } catch {}
  try {
    ip = getRequestIP({ xForwardedFor: true }) ?? null;
  } catch {}
  try {
    userAgent = getRequestHeader("user-agent") ?? null;
  } catch {}
  return { path, ip, userAgent };
}

const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

function isRecent(value: string | null | undefined) {
  if (!value) return false;
  return Date.now() - new Date(value).getTime() <= ACTIVE_WINDOW_MS;
}

// Public logger for admin page visits that never reach the authenticated
// getAdminStats call (signed-out visitors, non-admins bounced by the client
// gate). Server-side attempts that hit getAdminStats are logged there.
export const logAdminAccessAttempt = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        outcome: z.enum(["unauthenticated", "denied", "error"]),
        reason: z.string().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await recordAdminAccess(supabaseAdmin as any, null, data.outcome, data.reason ?? null, captureAuditContext());
    return { ok: true as const };
  });


export const pairPartnerDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        partnerDeviceId: z.string().min(3).max(32),
        pin: z.string().min(4).max(8),
        alias: z.string().max(80).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await runPairPartnerDevice(supabaseAdmin as any, data);
    return result.ok
      ? { ok: true as const, deviceId: result.deviceId }
      : { ok: false as const, error: result.error };
  });

export const pollSessionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ sessionId: z.string().uuid(), partnerDeviceId: z.string().min(3).max(32) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const partnerDeviceId = normalizeDeviceId(data.partnerDeviceId);

    const { data: client } = await admin
      .from("client_devices")
      .select("last_seen")
      .eq("device_id", partnerDeviceId)
      .maybeSingle();
    const { data: account } = client
      ? { data: null }
      : await admin.from("devices").select("last_seen").eq("device_id", partnerDeviceId).maybeSingle();
    const lastSeen = client?.last_seen ?? account?.last_seen ?? null;
    const online = isRecent(lastSeen);

    if (online) {
      await supabaseAdmin
        .from("sessions")
        .update({ status: "connected" })
        .eq("id", data.sessionId)
        .eq("host_owner_id", context.userId)
        .eq("status", "waiting");
    }
    return { online, status: online ? "connected" : "waiting", lastSeen };
  });



export const startRemoteSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        partnerDeviceId: z.string().min(3).max(32),
        pin: z.string().min(4).max(8),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const partnerDeviceId = normalizeDeviceId(data.partnerDeviceId);
    const pin = data.pin.replace(/\D/g, "");

    const { data: supportClient, error: supportClientError } = await admin
      .from("client_devices")
      .select("device_id,current_pin,last_seen,alias")
      .eq("device_id", partnerDeviceId)
      .maybeSingle();

    if (supportClientError) return { ok: false as const, error: "Unable to verify partner device" };

    const { data: accountDevice, error: accountDeviceError } = supportClient
      ? { data: null, error: null }
      : await admin.from("devices").select("device_id,pin,last_seen,alias").eq("device_id", partnerDeviceId).maybeSingle();

    if (accountDeviceError) return { ok: false as const, error: "Unable to verify partner device" };

    const target = supportClient ?? accountDevice;
    const targetPin = supportClient?.current_pin ?? accountDevice?.pin;
    if (!target) return { ok: false as const, error: "Partner device not found" };
    if (targetPin !== pin) return { ok: false as const, error: "PIN does not match the partner device" };

    const partnerOnline = isRecent(target?.last_seen);
    const status = partnerOnline ? "connected" : "waiting";

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert({
        host_owner_id: context.userId,
        partner_device_id: partnerDeviceId,
        status,
      })
      .select("id,started_at,status")
      .single();

    if (sessionError || !session) return { ok: false as const, error: "Unable to start session" };

    return {
      ok: true as const,
      sessionId: session.id,
      startedAt: session.started_at,
      status: session.status,
      partnerDeviceId,
      partnerOnline,
      targetKnown: true,
      message: partnerOnline
        ? "Session started"
        : "Session started and waiting for the partner app to come online",
    };
  });

export const getAdminAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        outcome: z.enum(["granted", "denied", "error", "unauthenticated"]).optional().nullable(),
        reason: z.string().max(200).optional().nullable(),
        userId: z.string().max(64).optional().nullable(),
        from: z.string().datetime().optional().nullable(),
        to: z.string().datetime().optional().nullable(),
        limit: z.number().int().min(1).max(500).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;

    const decision = await authorizeAdminAccess(admin, context.userId, captureAuditContext());
    if (!decision.ok) throw new Error(decision.error);

    let q = admin
      .from("admin_access_audit")
      .select("id,user_id,outcome,reason,path,ip,user_agent,created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);

    if (data.outcome) q = q.eq("outcome", data.outcome);
    if (data.userId) q = q.eq("user_id", data.userId);
    if (data.reason) q = q.ilike("reason", `%${data.reason}%`);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);

    const { data: rows, error } = await q;
    if (error) throw new Error("Unable to load audit log");
    return { rows: rows ?? [] };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;

    // Admin-only: the `support` role does NOT get access to admin actions.
    // authorizeAdminAccess() runs has_role() and writes exactly one audit row
    // (granted / denied / error) with the request metadata.
    const decision = await authorizeAdminAccess(admin, context.userId, captureAuditContext());
    if (!decision.ok) throw new Error(decision.error);

    const [clientResult, deviceResult, sessionResult] = await Promise.all([
      admin
        .from("client_devices")
        .select("device_id,alias,platform,app_version,last_seen,created_at")
        .order("last_seen", { ascending: false, nullsFirst: false }),
      supabaseAdmin
        .from("devices")
        .select("device_id,alias,last_seen,created_at")
        .order("last_seen", { ascending: false, nullsFirst: false }),
      supabaseAdmin
        .from("sessions")
        .select("id,partner_device_id,status,started_at,ended_at")
        .order("started_at", { ascending: false })
        .limit(20),
    ]);

    if (clientResult.error) throw new Error("Unable to load support clients");
    if (deviceResult.error) throw new Error("Unable to load devices");
    if (sessionResult.error) throw new Error("Unable to load sessions");

    const rows = [
      ...(clientResult.data ?? []).map((d: any) => ({ ...d, source: "quick-support" as const })),
      ...(deviceResult.data ?? []).map((d) => ({ ...d, platform: null, app_version: null, source: "account" as const })),
    ];
    const online = rows.filter((d) => isRecent(d.last_seen)).length;
    const total = rows.length;
    const sessions = sessionResult.data ?? [];
    const activeSessions = sessions.filter((s) => s.status === "connected" || s.status === "waiting").length;

    return {
      totalDevices: total,
      onlineDevices: online,
      offlineDevices: Math.max(total - online, 0),
      activeClients: online,
      inactiveClients: Math.max(total - online, 0),
      activeSessions,
      recentSessions: sessions,
      devices: rows.slice(0, 50).map((d) => ({
        deviceId: d.device_id,
        alias: d.alias,
        lastSeen: d.last_seen,
        online: isRecent(d.last_seen),
        createdAt: d.created_at,
        platform: d.platform,
        appVersion: d.app_version,
        source: d.source,
      })),
    };
  });