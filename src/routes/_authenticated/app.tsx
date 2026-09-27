import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Copy, RefreshCw, LogOut, Plus, Trash2, Crown, Monitor, KeyRound, Ticket, Download, Loader2, ShieldCheck, XCircle, LayoutDashboard } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";
import { startRemoteSession, pairPartnerDevice, pollSessionStatus } from "@/lib/remote.functions";

type ConnectStage = "idle" | "pin" | "handshake" | "authorizing" | "connected" | "failed";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — SSTECH NEXEUS" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

type Profile = {
  email: string;
  full_name: string | null;
  plan: string;
  plan_expires_at: string | null;
  is_student: boolean;
};
type Device = { device_id: string; pin: string; alias: string | null };
type SavedDevice = { id: string; partner_device_id: string; alias: string | null; created_at: string };

const PLAN_LIMITS: Record<string, number> = {
  free: 30,
  student: 100,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [saved, setSaved] = useState<SavedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPartnerId, setNewPartnerId] = useState("");
  const [newAlias, setNewAlias] = useState("");

  // Connect modal state
  const [connectTarget, setConnectTarget] = useState<{ id: string; alias: string | null } | null>(null);
  const [connectStage, setConnectStage] = useState<ConnectStage>("idle");
  const [connectPin, setConnectPin] = useState("");
  const [connectError, setConnectError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectStatusMessage, setConnectStatusMessage] = useState<string | null>(null);
  const startSession = useServerFn(startRemoteSession);
  const pairDevice = useServerFn(pairPartnerDevice);
  const pollStatus = useServerFn(pollSessionStatus);
  const [pairing, setPairing] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);

  // Poll for partner check-in while the session is waiting
  useEffect(() => {
    if (connectStage !== "connected" || !sessionId || !connectTarget || partnerOnline) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await pollStatus({ data: { sessionId, partnerDeviceId: connectTarget.id } });
        if (cancelled) return;
        if (res.online) {
          setPartnerOnline(true);
          setConnectStatusMessage("Partner online — remote workspace connected");
          toast.success("Partner device online");
        }
      } catch { /* keep polling */ }
    };
    void tick();
    const iv = setInterval(tick, 4000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [connectStage, sessionId, connectTarget, partnerOnline, pollStatus]);


  async function pairAndRetry() {
    if (!connectTarget) return;
    const pin = connectPin.trim();
    if (pin.length < 4) { setConnectError("Enter the PIN to pair"); return; }
    setPairing(true);
    setConnectError(null);
    try {
      const pair = await pairDevice({ data: { partnerDeviceId: connectTarget.id, pin, alias: connectTarget.alias } });
      if (!pair.ok) {
        setConnectError(pair.error);
        setPairing(false);
        return;
      }
      setConnectStage("authorizing");
      const result = await startSession({ data: { partnerDeviceId: connectTarget.id, pin } });
      if (!result.ok) {
        setConnectError(result.error);
        setConnectStage("failed");
      } else {
        setSessionId(result.sessionId);
        setConnectStatusMessage(result.message);
        setPartnerOnline(result.partnerOnline);
        setConnectStage("connected");
        toast.success("Device paired & session started");
      }
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Unable to pair device");
      setConnectStage("failed");
    } finally {
      setPairing(false);
    }
  }

  function openConnect(target: { id: string; alias: string | null }) {
    setConnectTarget(target);
    setConnectPin("");
    setConnectError(null);
    setSessionId(null);
    setConnectStatusMessage(null);
    setPartnerOnline(false);
    setConnectStage("pin");
  }
  function closeConnect() {
    setConnectTarget(null);
    setConnectStage("idle");
  }

  async function startConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!connectTarget) return;
    const pin = connectPin.trim();
    if (pin.length < 4) { setConnectError("Enter the 6-digit PIN shown on partner's device"); return; }
    setConnectError(null);
    setConnectStage("handshake");
    try {
      await new Promise((r) => setTimeout(r, 350));
      setConnectStage("authorizing");
      const result = await startSession({ data: { partnerDeviceId: connectTarget.id, pin } });
      if (!result.ok) {
        setConnectError(result.error);
        setConnectStage("failed");
        return;
      }
      setSessionId(result.sessionId);
      setConnectStatusMessage(result.message);
      setPartnerOnline(result.partnerOnline);
      setConnectStage("connected");
      toast.success("Session started");
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : "Unable to start session");
      setConnectStage("failed");
    }
  }



  async function loadAll() {
    setLoading(true);
    const [{ data: p }, { data: d }, { data: s }] = await Promise.all([
      supabase.from("profiles").select("email,full_name,plan,plan_expires_at,is_student").maybeSingle(),
      supabase.from("devices").select("device_id,pin,alias").maybeSingle(),
      supabase.from("saved_devices").select("id,partner_device_id,alias,created_at").order("created_at", { ascending: false }),
    ]);
    setProfile(p as Profile | null);
    setDevice(d as Device | null);
    setSaved((s as SavedDevice[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { void loadAll(); }, []);

  async function rotatePin() {
    const { data, error } = await supabase.rpc("rotate_my_pin");
    if (error) return toast.error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (row) setDevice((prev) => prev ? { ...prev, pin: row.pin, device_id: row.device_id } : prev);
    toast.success("PIN rotated");
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  async function addSaved(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = newPartnerId.trim();
    if (!cleaned) return;
    const { error } = await supabase.from("saved_devices").insert({
      owner_id: (await supabase.auth.getUser()).data.user!.id,
      partner_device_id: cleaned,
      alias: newAlias.trim() || null,
    });
    if (error) return toast.error(error.message);
    setNewPartnerId(""); setNewAlias("");
    toast.success("Device added");
    void loadAll();
  }

  async function removeSaved(id: string) {
    const { error } = await supabase.from("saved_devices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    void loadAll();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const planLimit = PLAN_LIMITS[profile?.plan ?? "free"];
  const limitText = planLimit ? `${saved.length} / ${planLimit}` : `${saved.length}`;
  const atLimit = planLimit !== undefined && saved.length >= planLimit;

  if (loading) {
    return <div className="min-h-screen text-white flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[160px]" />
      </div>

      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SSTECH" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="leading-tight">
              <div className="font-bold text-sm">SSTECH <span className="text-blue-400">NEXEUS</span></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Dashboard</div>
            </div>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/licenses"><Button variant="ghost" size="sm" className="text-white/70"><KeyRound className="h-4 w-4 mr-1" />Licenses</Button></Link>
            <Link to="/tickets"><Button variant="ghost" size="sm" className="text-white/70"><Ticket className="h-4 w-4 mr-1" />Tickets</Button></Link>
            <Link to="/admin"><Button variant="ghost" size="sm" className="text-white/70"><LayoutDashboard className="h-4 w-4 mr-1" />Admin</Button></Link>
            <Link to="/download"><Button variant="ghost" size="sm" className="text-white/70"><Download className="h-4 w-4 mr-1" />Downloads</Button></Link>
            <Link to="/pricing"><Button variant="ghost" size="sm" className="text-white/70"><Crown className="h-4 w-4 mr-1" />Upgrade</Button></Link>
            <Button onClick={signOut} variant="ghost" size="sm" className="text-white/60"><LogOut className="h-4 w-4 mr-1" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Greeting + plan badge */}
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
            <p className="text-sm text-white/50 mt-1">{profile?.email}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs">
            Plan: <span className="font-semibold uppercase text-blue-400">{profile?.plan}</span>
            {profile?.plan_expires_at && (
              <span className="ml-2 text-white/40">expires {new Date(profile.plan_expires_at).toLocaleDateString()}</span>
            )}
          </div>
        </section>

        {/* Your device card */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-blue-400 font-semibold">
              <Monitor className="h-4 w-4" /> Your Device
            </div>
            <p className="text-xs text-white/50 mt-1">Share this ID and PIN with your technician.</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Device ID</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-mono text-2xl font-bold tracking-widest text-blue-300">{device?.device_id}</div>
                  <Button size="sm" variant="ghost" onClick={() => copy(device!.device_id, "Device ID")}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">One-Time PIN</div>
                  <Button size="sm" variant="ghost" onClick={rotatePin} className="text-[11px] text-white/60"><RefreshCw className="h-3 w-3 mr-1" />Rotate</Button>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-mono text-2xl font-bold tracking-[0.4em] text-white">{device?.pin}</div>
                  <Button size="sm" variant="ghost" onClick={() => copy(device!.pin, "PIN")}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick connect */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-wider text-white/60 font-semibold">Quick Connect</div>
            <p className="text-xs text-white/50 mt-1">Enter your partner's Device ID to start a session.</p>

            <form onSubmit={addSaved} className="mt-5 space-y-3">
              <Input placeholder="000-000-000" value={newPartnerId} onChange={(e) => setNewPartnerId(e.target.value)} className="bg-black/40 border-white/10 text-white font-mono tracking-widest text-center text-lg" />
              <Input placeholder="Optional label (e.g. Mom's PC)" value={newAlias} onChange={(e) => setNewAlias(e.target.value)} className="bg-black/40 border-white/10 text-white" />
              <Button type="submit" disabled={atLimit} className="w-full bg-gradient-to-r from-blue-500 to-red-500">
                <Plus className="h-4 w-4 mr-1" />{atLimit ? "Limit reached — upgrade" : "Save to address book"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-[11px] text-white/40">
              <span>Saved devices: {limitText}</span>
              {atLimit && <Link to="/pricing" className="text-blue-400 hover:underline">Upgrade →</Link>}
            </div>
          </div>
        </section>

        {/* Address book */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">Address Book</h2>
            <span className="text-xs text-white/40">{limitText}</span>
          </div>
          {saved.length === 0 ? (
            <p className="text-sm text-white/40 py-8 text-center">No saved devices yet. Add one above ↑</p>
          ) : (
            <div className="divide-y divide-white/5">
              {saved.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-mono text-sm font-semibold tracking-wider text-blue-300">{s.partner_device_id}</div>
                    {s.alias && <div className="text-xs text-white/50">{s.alias}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-white/60" onClick={() => openConnect({ id: s.partner_device_id, alias: s.alias })}>Connect</Button>
                    <Button size="sm" variant="ghost" className="text-red-400/70 hover:text-red-400" onClick={() => removeSaved(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {profile?.plan === "free" && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-amber-200">You're on the Free plan</div>
                <p className="text-white/70 mt-1">Up to 30 saved devices. Need more? Business plans start at $8/month.</p>
                <Link to="/pricing"><Button size="sm" className="mt-3 bg-amber-500 text-black hover:bg-amber-400">See plans</Button></Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Dialog open={!!connectTarget} onOpenChange={(o) => !o && closeConnect()}>
        <DialogContent className="bg-[#070b16] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-400" />
              Connect to {connectTarget?.alias || connectTarget?.id}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Partner ID: <span className="font-mono text-blue-300">{connectTarget?.id}</span>
            </DialogDescription>
          </DialogHeader>

          {connectStage === "pin" && (
            <form onSubmit={startConnect} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/60">One-Time PIN</label>
                <Input
                  autoFocus
                  inputMode="numeric"
                  maxLength={8}
                  value={connectPin}
                  onChange={(e) => setConnectPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit PIN"
                  className="mt-2 bg-black/40 border-white/10 text-white font-mono tracking-[0.4em] text-center text-xl"
                />
                {connectError && <p className="mt-2 text-xs text-red-400">{connectError}</p>}
                <p className="mt-2 text-xs text-white/40">Ask your partner to read the PIN shown on their SSTECH NEXEUS app.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeConnect}>Cancel</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-red-500">Start session</Button>
              </DialogFooter>
            </form>
          )}

          {(connectStage === "handshake" || connectStage === "authorizing") && (
            <div className="py-8 flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
              <div className="text-sm text-white/80">
                {connectStage === "handshake" ? "Contacting relay server…" : "Waiting for partner authorization…"}
              </div>
              <div className="text-xs text-white/40">End-to-end encrypted • TLS 1.3</div>
            </div>
          )}

          {connectStage === "connected" && (
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <ShieldCheck className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Session started</div>
                  <div className="text-xs text-white/50">{connectStatusMessage || "Secure remote session is live."}</div>
                </div>
              </div>
              {sessionId && (
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs">
                  <div className="text-white/40 uppercase tracking-wider text-[10px]">Session ID</div>
                  <div className="font-mono text-blue-300 mt-1 break-all">{sessionId}</div>
                </div>
              )}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-black/60 text-center">
                  <div>
                    <Monitor className="mx-auto h-10 w-10 text-blue-300" />
                    <div className="mt-3 text-sm font-semibold text-white">Remote workspace ready</div>
                    <div className="mt-1 text-xs text-white/50">Partner app online hote hi live screen yahin attach hogi.</div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={closeConnect}>Close</Button>
                <Link to="/download"><Button className="bg-blue-500 hover:bg-blue-400">Open desktop app</Button></Link>
              </DialogFooter>
            </div>
          )}

          {connectStage === "failed" && (
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Connection failed</div>
                  <div className="text-xs text-white/50">{connectError || "Partner did not authorize the session."}</div>
                </div>
              </div>
              {connectError?.toLowerCase().includes("not found") && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-white/70 space-y-3">
                  <div>
                    Partner desktop app abhi tak check-in nahi hui. Agar aapke paas current PIN hai, is device ko manually pair karke turant session start kar sakte hain.
                  </div>
                  <Input
                    inputMode="numeric"
                    maxLength={8}
                    value={connectPin}
                    onChange={(e) => setConnectPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Partner's current PIN"
                    className="bg-black/40 border-white/10 text-white font-mono tracking-[0.4em] text-center"
                  />
                  <Button onClick={pairAndRetry} disabled={pairing} className="w-full bg-gradient-to-r from-blue-500 to-emerald-500">
                    {pairing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Pairing…</> : "Pair device & start session"}
                  </Button>
                </div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={closeConnect}>Close</Button>
                <Button onClick={() => setConnectStage("pin")} className="bg-blue-500">Try again</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
