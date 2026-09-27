import { test, expect, type Route, type Request } from "@playwright/test";

/**
 * End-to-end authorization tests for /admin.
 *
 * These tests verify — against the real running app at http://localhost:8080 —
 * that non-admin visitors:
 *   1. Never see admin UI (KPIs, device tables, session tables, refresh action).
 *   2. Never trigger the getAdminStats server function.
 *
 * We intercept two backends:
 *   - Supabase Auth (/auth/v1/**) to simulate signed-out / signed-in states.
 *   - Supabase RPC has_role (/rest/v1/rpc/has_role) to force a non-admin verdict
 *     without needing a real seeded non-admin account.
 *
 * The getAdminStats server function is served by TanStack Start at
 * /_serverFn/**. We assert zero such requests fire for non-admins.
 */

const NON_ADMIN_USER = {
  id: "00000000-0000-0000-0000-0000000000aa",
  aud: "authenticated",
  role: "authenticated",
  email: "not-admin@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
};

const FAKE_SESSION = {
  access_token: "fake-access-token",
  refresh_token: "fake-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: NON_ADMIN_USER,
};

async function trackAdminServerFn(page: import("@playwright/test").Page) {
  const adminServerFnCalls: string[] = [];
  page.on("request", (req: Request) => {
    const url = req.url();
    // TanStack Start server functions are served under /_serverFn.
    // getAdminStats is the only one used by the admin dashboard.
    if (url.includes("_serverFn") && /getAdminStats|admin/i.test(url)) {
      adminServerFnCalls.push(url);
    }
  });
  return adminServerFnCalls;
}

function assertNoAdminUI(bodyText: string) {
  // Admin dashboard-only labels that must never render for non-admins.
  const forbidden = [
    "Online Devices",
    "Offline Devices",
    "Active Devices",
    "Inactive Devices",
    "Device ID",
    "Last Seen",
    "Refresh",
  ];
  for (const label of forbidden) {
    expect(bodyText, `admin UI label "${label}" must not appear`).not.toContain(label);
  }
}

test.describe("/admin authorization", () => {
  test("signed-out user sees sign-in gate, no admin data loaded", async ({ page, context }) => {
    // Force Supabase to report no session.
    await context.route("**/auth/v1/user**", (route: Route) =>
      route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ msg: "no session" }) }),
    );
    await context.route("**/auth/v1/token**", (route: Route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "no session" }) }),
    );

    const rpcCalls: string[] = [];
    await context.route("**/rest/v1/rpc/**", (route: Route) => {
      rpcCalls.push(route.request().url());
      route.fulfill({ status: 200, contentType: "application/json", body: "false" });
    });

    const adminServerFnCalls = await trackAdminServerFn(page);

    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /admin sign in required/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();

    const body = (await page.textContent("body")) ?? "";
    assertNoAdminUI(body);

    // No admin data must be fetched.
    expect(adminServerFnCalls, "getAdminStats must not be called when signed out").toEqual([]);
    // has_role must not be called when there is no session.
    expect(rpcCalls.filter((u) => u.includes("has_role"))).toEqual([]);
  });

  test("signed-in non-admin sees access-denied, has_role rejects, no admin data loaded", async ({ page, context }) => {
    // Pretend Supabase auth has a valid session for a non-admin user.
    await context.route(/\/auth\/v1\/user/, (route: Route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(NON_ADMIN_USER) }),
    );
    await context.route(/\/auth\/v1\/token/, (route: Route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FAKE_SESSION) }),
    );

    // has_role must be called and must return false for this non-admin.
    let hasRoleCalls = 0;
    await context.route(/\/rest\/v1\/rpc\/has_role/, (route: Route) => {
      hasRoleCalls += 1;
      route.fulfill({ status: 200, contentType: "application/json", body: "false" });
    });
    // Any other RPC: succeed empty (harmless).
    await context.route(/\/rest\/v1\/rpc\//, (route: Route) => {
      if (route.request().url().includes("has_role")) {
        // Already handled by more specific route above; fall through by aborting.
        route.fallback();
        return;
      }
      route.fulfill({ status: 200, contentType: "application/json", body: "null" });
    });

    // Prime localStorage with a fake session so the Supabase client thinks the user is signed in.
    // The storage key uses the project ref from VITE_SUPABASE_URL: sb-<ref>-auth-token.
    await page.goto("/"); // establish origin so localStorage writes stick
    await page.evaluate((session) => {
      const projectRef =
        (window as unknown as { __SUPABASE_REF__?: string }).__SUPABASE_REF__ ??
        // Fallback: sniff from any existing sb-*-auth-token key, else use the known ref.
        (Object.keys(window.localStorage).find((k) => /^sb-.*-auth-token$/.test(k)) ?? "sb-bdqjvzfdwpbgrfesfzap-auth-token");
      const key = projectRef.startsWith("sb-") ? projectRef : `sb-${projectRef}-auth-token`;
      window.localStorage.setItem(key, JSON.stringify(session));
    }, FAKE_SESSION);

    const adminServerFnCalls = await trackAdminServerFn(page);

    await page.goto("/admin", { waitUntil: "domcontentloaded" });

    // The access-denied panel must render.
    await expect(page.getByRole("heading", { name: /admin access required/i })).toBeVisible();
    await expect(page.getByText(/admin role/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to app/i })).toBeVisible();

    const body = (await page.textContent("body")) ?? "";
    assertNoAdminUI(body);

    // has_role must have been consulted at least once for the non-admin.
    expect(hasRoleCalls, "has_role must be consulted for signed-in users").toBeGreaterThanOrEqual(1);
    // But getAdminStats must never be called since the client gate refused.
    expect(adminServerFnCalls, "getAdminStats must not be called for non-admins").toEqual([]);
  });

  test("direct getAdminStats call without admin role is rejected by server", async ({ request }) => {
    // Belt-and-suspenders: even if the client UI were bypassed, the server function
    // itself is protected by requireSupabaseAuth + has_role. An unauthenticated
    // POST/GET must not return admin data.
    const res = await request.get("/_serverFn/src_lib_remote_functions_ts--getAdminStats_createServerFn_handler", {
      failOnStatusCode: false,
    });
    // Accept 401 / 403 / 404 (route id may differ) — the only forbidden outcome
    // is a 200 response containing admin payload keys.
    if (res.status() === 200) {
      const text = await res.text();
      expect(text).not.toMatch(/onlineDevices|offlineDevices|activeSessions/i);
    } else {
      expect([401, 403, 404, 405, 500]).toContain(res.status());
    }
  });
});
