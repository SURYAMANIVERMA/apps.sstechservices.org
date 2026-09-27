import { createFileRoute, Link } from "@tanstack/react-router";
import { Server, Cpu, KeyRound, Radio, ShieldCheck, ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "API Architecture — SSTECH NEXEUS" },
      { name: "description", content: "Cloud API architecture for the SSTECH NEXEUS remote desktop platform. Endpoints for license activation, device registry, session brokering and relay signaling." },
    ],
  }),
  component: ApiDocs,
});

const ENDPOINTS = [
  { method: "POST", path: "/api/public/license/activate", desc: "Activate a license key on a device (called from desktop client at install time)." },
  { method: "POST", path: "/api/public/device/register", desc: "Register a new device, returns its 9-digit ID and 6-digit PIN." },
  { method: "POST", path: "/api/public/device/heartbeat", desc: "Desktop/mobile agent sends heartbeat + status; cloud updates last_seen." },
  { method: "POST", path: "/api/public/session/request", desc: "Requester asks cloud to broker a session with target device ID + PIN." },
  { method: "POST", path: "/api/public/session/accept", desc: "Target device accepts / rejects incoming session; returns relay URL + short-lived token." },
  { method: "POST", path: "/api/public/relay/token", desc: "Mint an HMAC-signed token for hbbs/hbbr (RustDesk-compatible signaling)." },
  { method: "POST", path: "/api/public/webhooks/payment", desc: "Payment gateway webhook — upgrades plan + auto-issues license keys." },
];

function ApiDocs() {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SS TECH" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="font-bold text-sm">SS TECH <span className="text-blue-400">SERVICES</span></div>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4"/> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5"/> API v1 · RustDesk-compatible signaling
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-5xl font-bold">SSTECH NEXEUS Cloud API</h1>
          <p className="mt-4 text-white/60">
            Enterprise API architecture for connecting the SSTECH NEXEUS desktop / mobile clients to our
            cloud identity, license and session brokering layer. Designed to plug in a RustDesk-based
            relay backend (hbbs + hbbr) without changing app-side contracts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: KeyRound, title: "License & Identity", desc: "Issue keys, verify seats, tie devices to accounts." },
            { icon: Cpu, title: "Device Registry", desc: "Auto-generated 9-digit ID + rotating 6-digit PIN per device." },
            { icon: Radio, title: "Session Broker", desc: "Cloud mints short-lived signed tokens for hbbs/hbbr relays." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-white/10">
                <Icon className="h-5 w-5 text-blue-300"/>
              </div>
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2 mb-6"><Server className="h-6 w-6 text-emerald-300"/> Public Endpoints</h2>
          <div className="divide-y divide-white/5">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="py-4 flex flex-wrap items-center gap-4">
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-blue-500/20 text-blue-200 border border-blue-500/40">{e.method}</span>
                <code className="text-sm text-emerald-300">{e.path}</code>
                <span className="text-sm text-white/60 flex-1 min-w-[240px]">{e.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-6">
            All public endpoints require HMAC-signed requests (X-SST-Signature) verified server-side.
            Rate-limited per IP + license key. Full OpenAPI spec available on request.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">Relay Backend Integration Plan</h2>
          <pre className="text-xs bg-black/40 rounded-lg p-4 overflow-x-auto text-emerald-200/90 leading-relaxed">
{`Desktop / Mobile Client (RustDesk fork, SSTECH-branded)
        │  device ID + PIN
        ▼
  cloud.sstechservices.org  ── (TanStack server functions)
        │  – auth, license verify, device registry
        │  – mints signed session token
        ▼
  hbbs (ID server)  ⇄  hbbr (relay) ── deployed on Hetzner VPS
        │  – NAT traversal / TCP relay
        ▼
  Peer client establishes P2P (or falls back to relay)`}
          </pre>
          <p className="text-sm text-white/60 mt-4">
            The cloud platform in this repo is deliberately relay-agnostic. When the RustDesk fork is
            ready, point <code className="text-blue-300">hbbs</code> at this cloud's
            <code className="text-blue-300"> /api/public/relay/token</code> endpoint and enable
            signature verification — no schema changes needed on either side.
          </p>
        </section>

        <footer className="text-center text-xs text-white/40 pt-8 border-t border-white/10">
          Powered by <span className="text-white/80 font-semibold">SS TECH SERVICES</span> · <a href="https://sstechservices.org" className="text-blue-400 hover:underline">sstechservices.org</a>
        </footer>
      </main>
    </div>
  );
}
