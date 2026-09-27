import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  authorizeAdminAccess,
  recordAdminAccess,
  type AuditContext,
} from "@/lib/admin-logic";

/**
 * In-memory fake of the subset of supabase-js we use for admin authorization
 * and audit writes:
 *   - .rpc("has_role", { _user_id, _role }) -> { data, error }
 *   - .from("admin_access_audit").insert(row) -> { data, error }
 *
 * All inserted rows are captured on `admin._audit` so tests can assert the
 * exact user_id / outcome / reason / metadata / timestamp shape.
 */
function createFakeAdmin(opts: {
  hasRole?: boolean;
  hasRoleError?: { message: string } | null;
} = {}) {
  const audit: any[] = [];
  const rpcCalls: any[] = [];

  const admin = {
    _audit: audit,
    _rpcCalls: rpcCalls,
    rpc(name: string, args: any) {
      rpcCalls.push({ name, args });
      if (name !== "has_role") return Promise.resolve({ data: null, error: null });
      if (opts.hasRoleError) return Promise.resolve({ data: null, error: opts.hasRoleError });
      return Promise.resolve({ data: opts.hasRole ?? false, error: null });
    },
    from(table: string) {
      return {
        insert(row: any) {
          if (table !== "admin_access_audit") {
            throw new Error(`unexpected insert into ${table}`);
          }
          audit.push({ ...row, created_at: new Date().toISOString() });
          return Promise.resolve({ data: row, error: null });
        },
      };
    },
  };
  return admin;
}

const CTX: AuditContext = {
  path: "/admin",
  ip: "203.0.113.9",
  userAgent: "vitest/1.0",
};

const USER_ID = "11111111-1111-1111-1111-111111111111";

describe("admin_access_audit — recordAdminAccess row shape", () => {
  it("writes user_id, outcome, reason, request metadata, and a timestamp", async () => {
    const admin = createFakeAdmin();
    const before = Date.now();
    await recordAdminAccess(admin, USER_ID, "granted", null, CTX);
    const after = Date.now();

    expect(admin._audit).toHaveLength(1);
    const row = admin._audit[0];
    expect(row.user_id).toBe(USER_ID);
    expect(row.outcome).toBe("granted");
    expect(row.reason).toBeNull();
    expect(row.path).toBe(CTX.path);
    expect(row.ip).toBe(CTX.ip);
    expect(row.user_agent).toBe(CTX.userAgent);

    const ts = new Date(row.created_at).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("records user_id = null for unauthenticated attempts", async () => {
    const admin = createFakeAdmin();
    await recordAdminAccess(admin, null, "unauthenticated", "no session", CTX);
    expect(admin._audit[0]).toMatchObject({
      user_id: null,
      outcome: "unauthenticated",
      reason: "no session",
      path: "/admin",
    });
  });

  it("never throws when the audit insert itself fails", async () => {
    const admin = {
      from() {
        return {
          insert() {
            return Promise.reject(new Error("db down"));
          },
        };
      },
    };
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      recordAdminAccess(admin as any, USER_ID, "granted", null, CTX),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});

describe("admin_access_audit — authorizeAdminAccess decisions", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("GRANTS access for an admin and writes exactly one 'granted' audit row", async () => {
    const now = new Date("2026-01-02T03:04:05.000Z");
    vi.setSystemTime(now);
    const admin = createFakeAdmin({ hasRole: true });

    const res = await authorizeAdminAccess(admin as any, USER_ID, CTX);
    expect(res).toEqual({ ok: true });

    expect(admin._rpcCalls).toEqual([
      { name: "has_role", args: { _user_id: USER_ID, _role: "admin" } },
    ]);
    expect(admin._audit).toHaveLength(1);
    expect(admin._audit[0]).toMatchObject({
      user_id: USER_ID,
      outcome: "granted",
      reason: null,
      path: "/admin",
      ip: "203.0.113.9",
      user_agent: "vitest/1.0",
    });
    expect(new Date(admin._audit[0].created_at).toISOString()).toBe(now.toISOString());
  });

  it("DENIES access for a non-admin and writes a 'denied' row with reason 'not an admin'", async () => {
    const admin = createFakeAdmin({ hasRole: false });

    const res = await authorizeAdminAccess(admin as any, USER_ID, CTX);
    expect(res).toEqual({ ok: false, error: "Admin access required" });

    expect(admin._audit).toHaveLength(1);
    expect(admin._audit[0]).toMatchObject({
      user_id: USER_ID,
      outcome: "denied",
      reason: "not an admin",
      path: "/admin",
    });
  });

  it("records an 'error' row (with the role-check error message) when has_role fails", async () => {
    const admin = createFakeAdmin({
      hasRoleError: { message: "role lookup exploded" },
    });

    const res = await authorizeAdminAccess(admin as any, USER_ID, CTX);
    expect(res).toEqual({ ok: false, error: "Unable to verify admin access" });

    expect(admin._audit).toHaveLength(1);
    expect(admin._audit[0]).toMatchObject({
      user_id: USER_ID,
      outcome: "error",
      reason: "role lookup exploded",
    });
  });

  it("writes only one audit row per authorization call (no double-logging)", async () => {
    const admin = createFakeAdmin({ hasRole: false });
    await authorizeAdminAccess(admin as any, USER_ID, CTX);
    await authorizeAdminAccess(admin as any, USER_ID, CTX);
    expect(admin._audit).toHaveLength(2);
    expect(admin._audit.map((r) => r.outcome)).toEqual(["denied", "denied"]);
  });

  it("falls back to a generic reason when the role error has no message", async () => {
    const admin = createFakeAdmin({ hasRoleError: {} as any });
    await authorizeAdminAccess(admin as any, USER_ID, CTX);
    expect(admin._audit[0].reason).toBe("role check failed");
  });
});
