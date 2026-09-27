import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowLeft, Clock, Monitor, RefreshCw, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStats, logAdminAccessAttempt } from "@/lib/remote.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — SSTECH NEXEUS" },
      { name: "description", content: "Live Quick Support client status: online, offline, active and inactive devices." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

function AdminDashboard() {
  const fetchStats = useServerFn(getAdminStats);
  const logAttempt = useServerFn(logAdminAccessAttempt);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  // Dedupe audit writes across the 15s polling loop so we log each new
  // outcome once per browser session instead of every refresh.
  const lastLoggedOutcome = useRef<string | null>(null);
  function logOnce(outcome: "unauthenticated" | "denied", reason: string) {
    if (lastLoggedOutcome.current === outcome) return;
    lastLoggedOutcome.current = outcome;
    void logAttempt({ data: { outcome, reason } }).catch(() => {});
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setSignedIn(false);
        setIsAdmin(false);
        setStats(null);
        logOnce("unauthenticated", "no session");
        return;
      }
      setSignedIn(true);

      // Client-side role check so non-admins see a clear message instead of an
      // error toast. The server function re-verifies via has_role() — this UI
      // gate is defense-in-depth, not the authorization boundary. The server
      // records the authoritative audit entry when getAdminStats runs.
      const { data: adminOk, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (roleError) throw roleError;
      if (!adminOk) {
        setIsAdmin(false);
        setStats(null);
        logOnce("denied", "not an admin");
        return;
      }
      setIsAdmin(true);
      lastLoggedOutcome.current = "granted";
      setStats(await fetchStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin stats load nahi ho paya");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(id);
  }, []);

  const lastUpdated = useMemo(() => new Date().toLocaleTimeString(), [stats]);

  if (signedIn === false) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-blue-300" />
          <h1 className="mt-4 text-2xl font-bold">Admin sign in required</h1>
          <p className="mt-2 text-sm text-white/60">Admin dashboard dekhne ke liye apne SSTECH NEXEUS account se sign in karein.</p>
          <Link to="/auth"><Button className="mt-6 bg-blue-500 hover:bg-blue-400">Sign in</Button></Link>
        </div>
      </div>
    );
  }

  if (signedIn && isAdmin === false) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-red-300" />
          <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-white/60">Is page ke liye <span className="font-mono">admin</span> role chahiye. Aapke account par admin role assigned nahi hai.</p>
          <Link to="/app"><Button className="mt-6 bg-blue-500 hover:bg-blue-400">Back to app</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> App
            </Link>
            <span className="text-white/20">/</span>
            <h1 className="text-lg font-semibold">Quick Support Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/audit" className="text-sm text-white/60 hover:text-white">Audit log</Link>
            <Button onClick={() => void load()} disabled={loading} variant="ghost" size="sm" className="text-white/70">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {error && (
          <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">
            {error === "Admin access required" ? "Is page ke liye admin role chahiye." : error}
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi icon={Monitor} label="Total clients" value={stats?.totalDevices ?? 0} tone="blue" />
          <Kpi icon={Wifi} label="Online" value={stats?.onlineDevices ?? 0} tone="emerald" />
          <Kpi icon={WifiOff} label="Offline" value={stats?.offlineDevices ?? 0} tone="red" />
          <Kpi icon={Activity} label="Active clients" value={stats?.activeClients ?? 0} tone="cyan" />
          <Kpi icon={Clock} label="Active sessions" value={stats?.activeSessions ?? 0} tone="amber" />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Client devices</h2>
              <p className="mt-1 text-xs text-white/40">Last updated {lastUpdated} · auto-refresh 15s</p>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              Online = last 2 minutes
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[1.1fr_.8fr_.7fr_.8fr] gap-3 bg-black/50 px-4 py-3 text-xs uppercase tracking-wider text-white/40">
              <span>Device ID</span><span>Platform</span><span>Status</span><span>Last seen</span>
            </div>
            {(stats?.devices ?? []).length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-white/40">Abhi koi Quick Support client registered nahi hai.</div>
            ) : (
              stats!.devices.map((device) => (
                <div key={`${device.source}-${device.deviceId}`} className="grid grid-cols-[1.1fr_.8fr_.7fr_.8fr] gap-3 border-t border-white/5 px-4 py-3 text-sm">
                  <div>
                    <div className="font-mono font-semibold text-blue-300">{device.deviceId}</div>
                    <div className="text-xs text-white/40">{device.alias || device.source}</div>
                  </div>
                  <span className="text-white/70">{device.platform || "web"}</span>
                  <span className={device.online ? "text-emerald-300" : "text-red-300"}>{device.online ? "Online" : "Offline"}</span>
                  <span className="text-white/50">{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Recent sessions</h2>
          <div className="mt-4 space-y-2">
            {(stats?.recentSessions ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-white/40">No sessions yet.</p>
            ) : (
              stats!.recentSessions.map((session) => (
                <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                  <div>
                    <div className="font-mono text-blue-300">{session.partner_device_id || "Unknown partner"}</div>
                    <div className="text-xs text-white/40">{new Date(session.started_at).toLocaleString()}</div>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{session.status}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Monitor; label: string; value: number; tone: "blue" | "emerald" | "red" | "cyan" | "amber" }) {
  const cls = {
    blue: "border-blue-500/20 text-blue-300",
    emerald: "border-emerald-500/20 text-emerald-300",
    red: "border-red-500/20 text-red-300",
    cyan: "border-cyan-500/20 text-cyan-300",
    amber: "border-amber-500/20 text-amber-300",
  }[tone];
  return (
    <div className={`rounded-2xl border bg-white/5 p-5 ${cls}`}>
      <Icon className="h-5 w-5" />
      <p className="mt-4 text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
