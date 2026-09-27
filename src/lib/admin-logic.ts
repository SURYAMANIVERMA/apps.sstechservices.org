export type AdminAuditOutcome = "granted" | "denied" | "error" | "unauthenticated";

export interface AuditContext {
  path: string | null;
  ip: string | null;
  userAgent: string | null;
}

const EMPTY_CTX: AuditContext = { path: null, ip: null, userAgent: null };

/**
 * Insert one row into admin_access_audit. Never throws — audit failures must
 * not break the caller. Timestamp is written by the DB (`created_at DEFAULT now()`).
 */
export async function recordAdminAccess(
  admin: any,
  userId: string | null,
  outcome: AdminAuditOutcome,
  reason: string | null,
  ctx: AuditContext = EMPTY_CTX,
): Promise<void> {
  try {
    await admin.from("admin_access_audit").insert({
      user_id: userId,
      outcome,
      reason,
      path: ctx.path,
      ip: ctx.ip,
      user_agent: ctx.userAgent,
    });
  } catch (err) {
    console.error("[admin-audit] failed to record attempt", err);
  }
}

/**
 * Server-side authorization gate for admin actions. Runs `has_role(admin)` and
 * writes exactly one audit row per call describing the outcome.
 */
export async function authorizeAdminAccess(
  admin: any,
  userId: string,
  ctx: AuditContext = EMPTY_CTX,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: isAdmin, error: roleError } = await admin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (roleError) {
    await recordAdminAccess(admin, userId, "error", roleError.message ?? "role check failed", ctx);
    return { ok: false, error: "Unable to verify admin access" };
  }
  if (!isAdmin) {
    await recordAdminAccess(admin, userId, "denied", "not an admin", ctx);
    return { ok: false, error: "Admin access required" };
  }
  await recordAdminAccess(admin, userId, "granted", null, ctx);
  return { ok: true };
}
