import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RefreshCw, ShieldCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getAdminAuditLog, logAdminAccessAttempt } from "@/lib/remote.functions";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Admin Access Audit — SSTECH NEXEUS" },
      { name: "description", content: "Browse admin access audit log with filters." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAuditPage,
});

type AuditRow = {
  id: string;
  user_id: string | null;
  outcome: string;
  reason: string | null;
  path: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

type OutcomeFilter = "" | "granted" | "denied" | "error" | "unauthenticated";

function AdminAuditPage() {
  const fetchAudit = useServerFn(getAdminAuditLog);
  const logAttempt = useServerFn(logAdminAccessAttempt);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [outcome, setOutcome] = useState<OutcomeFilter>("");
  const [reason, setReason] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(100);

  const lastLoggedOutcome = useRef<string | null>(null);
  function logOnce(kind: "unauthenticated" | "denied", why: string) {
    if (lastLoggedOutcome.current === kind) return;
    lastLoggedOutcome.current = kind;
    void logAttempt({ data: { outcome: kind, reason: why } }).catch(() => {});
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setSignedIn(false);
        setIsAdmin(false);
        logOnce("unauthenticated", "no session");
        return;
      }
      setSignedIn(true);
      const { data: adminOk, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (roleError) throw roleError;
      if (!adminOk) {
        setIsAdmin(false);
        logOnce("denied", "not an admin");
        return;
      }
      setIsAdmin(true);
      lastLoggedOutcome.current = "granted";

      const toIso = (v: string) => (v ? new Date(v).toISOString() : null);
      const res = await fetchAudit({
        data: {
          outcome: outcome || null,
          reason: reason.trim() || null,
          userId: userId.trim() || null,
          from: toIso(from),
          to: toIso(to),
          limit,
        },
      });
      setRows(res.rows as AuditRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit log load nahi ho paya");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c = { granted: 0, denied: 0, error: 0, unauthenticated: 0 } as Record<string, number>;
    for (const r of rows) c[r.outcome] = (c[r.outcome] ?? 0) + 1;
    return c;
  }, [rows]);

  if (signedIn === false) {
    return (
      <GateCard title="Admin sign in required" desc="Audit log dekhne ke liye sign in karein." to="/auth" cta="Sign in" tone="blue" />
    );
  }
  if (signedIn && isAdmin === false) {
    return (
      <GateCard title="Admin access required" desc="Is page ke liye admin role chahiye." to="/app" cta="Back to app" tone="red" />
    );
  }

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Admin
            </Link>
            <span className="text-white/20">/</span>
            <h1 className="text-lg font-semibold">Access Audit Log</h1>
          </div>
          <Button onClick={() => void load()} disabled={loading} variant="ghost" size="sm" className="text-white/70">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/80">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-xs text-white/60">
              Outcome
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as OutcomeFilter)}
                className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-2 text-sm text-white"
              >
                <option value="">All</option>
                <option value="granted">granted</option>
                <option value="denied">denied</option>
                <option value="error">error</option>
                <option value="unauthenticated">unauthenticated</option>
              </select>
            </label>
            <label className="text-xs text-white/60 lg:col-span-2">
              User ID
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="uuid" className="mt-1 bg-black/40" />
            </label>
            <label className="text-xs text-white/60 lg:col-span-2">
              Reason contains
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="not an admin" className="mt-1 bg-black/40" />
            </label>
            <label className="text-xs text-white/60">
              Limit
              <Input
                type="number"
                min={1}
                max={500}
                value={limit}
                onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 100)))}
                className="mt-1 bg-black/40"
              />
            </label>
            <label className="text-xs text-white/60 lg:col-span-2">
              From
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 bg-black/40" />
            </label>
            <label className="text-xs text-white/60 lg:col-span-2">
              To
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 bg-black/40" />
            </label>
            <div className="flex items-end gap-2 lg:col-span-2">
              <Button onClick={() => void load()} disabled={loading} className="bg-blue-500 hover:bg-blue-400">Apply</Button>
              <Button
                variant="ghost"
                className="text-white/70"
                onClick={() => {
                  setOutcome(""); setReason(""); setUserId(""); setFrom(""); setTo(""); setLimit(100);
                  setTimeout(() => void load(), 0);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</section>
        )}

        <section className="grid gap-3 sm:grid-cols-4">
          <Stat label="Granted" value={counts.granted ?? 0} tone="emerald" />
          <Stat label="Denied" value={counts.denied ?? 0} tone="red" />
          <Stat label="Error" value={counts.error ?? 0} tone="amber" />
          <Stat label="Unauthenticated" value={counts.unauthenticated ?? 0} tone="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-[1.3fr_.8fr_1.4fr_1.6fr_.9fr] gap-3 bg-black/50 px-4 py-3 text-xs uppercase tracking-wider text-white/40">
            <span>Timestamp</span><span>Outcome</span><span>User ID</span><span>Reason · Path</span><span>IP</span>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/40">
              {loading ? "Loading…" : "No audit rows match these filters."}
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[1.3fr_.8fr_1.4fr_1.6fr_.9fr] gap-3 border-t border-white/5 px-4 py-3 text-sm">
                <span className="text-white/80">{new Date(r.created_at).toLocaleString()}</span>
                <span><OutcomePill outcome={r.outcome} /></span>
                <span className="font-mono text-xs text-blue-300 break-all">{r.user_id ?? "—"}</span>
                <span className="text-white/70">
                  <div>{r.reason ?? <span className="text-white/30">no reason</span>}</div>
                  <div className="text-xs text-white/40">{r.path ?? ""}</div>
                </span>
                <span className="font-mono text-xs text-white/50">{r.ip ?? "—"}</span>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function GateCard({ title, desc, to, cta, tone }: { title: string; desc: string; to: string; cta: string; tone: "blue" | "red" }) {
  const color = tone === "blue" ? "text-blue-300" : "text-red-300";
  return (
    <div className="min-h-screen text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <ShieldCheck className={`mx-auto h-10 w-10 ${color}`} />
        <h1 className="mt-4 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-white/60">{desc}</p>
        <Link to={to}><Button className="mt-6 bg-blue-500 hover:bg-blue-400">{cta}</Button></Link>
      </div>
    </div>
  );
}

function OutcomePill({ outcome }: { outcome: string }) {
  const cls =
    outcome === "granted"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : outcome === "denied"
        ? "border-red-500/30 bg-red-500/10 text-red-200"
        : outcome === "error"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
          : "border-blue-500/30 bg-blue-500/10 text-blue-200";
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${cls}`}>{outcome}</span>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "red" | "amber" | "blue" }) {
  const cls = {
    emerald: "border-emerald-500/20 text-emerald-300",
    red: "border-red-500/20 text-red-300",
    amber: "border-amber-500/20 text-amber-300",
    blue: "border-blue-500/20 text-blue-300",
  }[tone];
  return (
    <div className={`rounded-2xl border bg-white/5 p-4 ${cls}`}>
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
