/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";

// ---- Mocks ----
const getUserMock = vi.fn();
const rpcMock = vi.fn();
const getAdminStatsMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => ({ options: opts, ...opts }),
  Link: ({ children, ...props }: any) =>
    React.createElement("a", props, children),
}));

vi.mock("@tanstack/react-start", () => ({
  useServerFn: (fn: any) => fn,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: (...a: any[]) => getUserMock(...a) },
    rpc: (...a: any[]) => rpcMock(...a),
  },
}));

vi.mock("@/lib/remote.functions", () => ({
  getAdminStats: (...a: any[]) => getAdminStatsMock(...a),
}));

// Import AFTER mocks so createFileRoute uses our stub.
const routeModule = await import("@/routes/admin");
const AdminDashboard = (routeModule as any).Route.options.component as React.FC;

describe("Admin page authorization — frontend", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows sign-in required screen when user is signed out; no admin data fetched", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    render(React.createElement(AdminDashboard));

    await waitFor(() =>
      expect(screen.getByText(/Admin sign in required/i)).toBeInTheDocument(),
    );

    // No role check, no admin stats call, no admin UI rendered.
    expect(rpcMock).not.toHaveBeenCalled();
    expect(getAdminStatsMock).not.toHaveBeenCalled();
    expect(screen.queryByText(/Quick Support Admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total clients/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Client devices/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recent sessions/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Refresh/i })).not.toBeInTheDocument();
  });

  it("shows 'Admin access required' when signed-in user lacks the admin role; no admin data fetched or rendered", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-non-admin" } } });
    rpcMock.mockResolvedValue({ data: false, error: null });

    render(React.createElement(AdminDashboard));

    await waitFor(() =>
      expect(screen.getByText(/Admin access required/i)).toBeInTheDocument(),
    );

    // Role check ran with the admin role and returned false.
    expect(rpcMock).toHaveBeenCalledWith("has_role", {
      _user_id: "user-non-admin",
      _role: "admin",
    });

    // Critical: no admin data was ever requested from the server.
    expect(getAdminStatsMock).not.toHaveBeenCalled();

    // Critical: no admin UI (KPIs, device table, sessions, refresh) is rendered.
    expect(screen.queryByText(/Quick Support Admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total clients/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Online/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Client devices/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recent sessions/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Refresh/i })).not.toBeInTheDocument();
  });

  it("renders admin dashboard and fetches stats when the user has the admin role", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-admin" } } });
    rpcMock.mockResolvedValue({ data: true, error: null });
    getAdminStatsMock.mockResolvedValue({
      totalDevices: 3,
      onlineDevices: 1,
      offlineDevices: 2,
      activeClients: 1,
      activeSessions: 0,
      devices: [],
      recentSessions: [],
    });

    render(React.createElement(AdminDashboard));

    await waitFor(() =>
      expect(screen.getByText(/Quick Support Admin/i)).toBeInTheDocument(),
    );

    expect(getAdminStatsMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Client devices/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent sessions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin access required/i)).not.toBeInTheDocument();
  });
});
