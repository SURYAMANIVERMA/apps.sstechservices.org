import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound, Copy, Plus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/licenses")({
  head: () => ({ meta: [{ title: "License Keys — SSTECH NEXEUS" }, { name: "robots", content: "noindex" }] }),
  component: LicensesPage,
});

type License = {
  id: string; license_key: string; plan: string; status: string; seats: number;
  issued_at: string; expires_at: string | null; activated_device_id: string | null;
};

function LicensesPage() {
  const [rows, setRows] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("business");
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("license_keys")
      .select("id,license_key,plan,status,seats,issued_at,expires_at,activated_device_id")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as License[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function issue() {
    setBusy(true);
    const { error } = await supabase.rpc("issue_license", { _plan: plan, _months: months, _seats: 1 });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("License issued");
    void load();
  }

  async function copy(v: string) { await navigator.clipboard.writeText(v); toast.success("Copied"); }

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/app" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="text-xs text-white/50">License Manager</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2"><KeyRound className="h-7 w-7 text-blue-400" /> License Keys</h1>
          <p className="text-white/50 text-sm mt-2">Generate and manage license keys for SSTECH NEXEUS installations. Keys activate the desktop client during install.</p>
        </div>

        <section className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
          <h2 className="font-semibold mb-4">Issue a new license</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <select value={plan} onChange={(e) => setPlan(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm">
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
              <option value="trial">Trial</option>
            </select>
            <select value={months} onChange={(e) => setMonths(+e.target.value)}
              className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm">
              <option value={1}>1 month</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>1 year</option>
              <option value={24}>2 years</option>
              <option value={36}>3 years</option>
            </select>
            <Button onClick={issue} disabled={busy} className="bg-gradient-to-r from-blue-500 to-emerald-500">
              <Plus className="h-4 w-4 mr-1" /> Generate
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Your licenses</h2>
          {loading ? <p className="text-white/50 text-sm">Loading…</p> :
           rows.length === 0 ? <p className="text-white/40 text-sm py-6 text-center">No licenses yet.</p> :
           <div className="divide-y divide-white/5">
             {rows.map((r) => (
               <div key={r.id} className="py-4 flex flex-wrap items-center gap-4 justify-between">
                 <div>
                   <div className="font-mono text-lg text-emerald-300">{r.license_key}</div>
                   <div className="text-xs text-white/50 mt-1">
                     {r.plan.toUpperCase()} · {r.status} · {r.seats} seat{r.seats>1?"s":""}
                     {r.expires_at && <> · expires {new Date(r.expires_at).toLocaleDateString()}</>}
                     {r.activated_device_id && <> · device {r.activated_device_id}</>}
                   </div>
                 </div>
                 <Button size="sm" variant="ghost" onClick={() => copy(r.license_key)}><Copy className="h-4 w-4" /></Button>
               </div>
             ))}
           </div>}
        </section>
      </main>
    </div>
  );
}
