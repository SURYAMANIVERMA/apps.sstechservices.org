import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/setup-guide")({
  head: () => ({
    meta: [
      { title: "Self-Host Setup Guide — SSTECH NEXEUS" },
      {
        name: "description",
        content:
          "Step-by-step guide to deploy your own SSTECH NEXEUS remote support infrastructure: relay server, branded desktop clients, and signaling.",
      },
      { property: "og:title", content: "SSTECH NEXEUS — Self-Host Setup Guide" },
      {
        property: "og:description",
        content:
          "Deploy a real, working remote-support platform branded as SSTECH NEXEUS. Relay server + Windows / macOS / Linux clients.",
      },
    ],
  }),
  component: SetupGuide,
});

type Step = {
  id: string;
  title: string;
  summary: string;
  body: React.ReactNode;
};

const CodeBlock = ({ children, label }: { children: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative my-3 rounded-lg border border-white/10 bg-black/60">
      {label && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/50">
          <span>{label}</span>
        </div>
      )}
      <button
        onClick={() => {
          navigator.clipboard.writeText(children);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-cyan-100/90">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const steps: Step[] = [
  {
    id: "overview",
    title: "0. Architecture overview",
    summary: "Samjho kya banega",
    body: (
      <div className="space-y-3 text-white/80">
        <p>3 pieces hain jo milke real remote support banate hain:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <b className="text-white">Relay / Rendezvous server</b> — ek VPS pe chalega. Ye 2 clients ko introduce karta hai
            aur agar direct connection nahi ban paaye to traffic relay karta hai. Binaries:{" "}
            <code className="rounded bg-white/10 px-1">hbbs</code> +{" "}
            <code className="rounded bg-white/10 px-1">hbbr</code>.
          </li>
          <li>
            <b className="text-white">Desktop client (SSTECH NEXEUS)</b> — Windows / macOS / Linux pe install hota hai.
            Screen capture, mouse/keyboard control, file transfer. RustDesk source se branding modify karke build.
          </li>
          <li>
            <b className="text-white">Aapki website</b> — yahi project. Users yahan se installer download karte hain.
          </li>
        </ul>
        <p className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          ⚠ License note: RustDesk AGPL-3.0 hai. Aapko apna fork bhi public rakhna padega. Closed-source chahiye to{" "}
          <a className="underline" href="https://rustdesk.com" target="_blank" rel="noreferrer">
            rustdesk.com
          </a>{" "}
          se commercial license kharidni hogi.
        </p>
      </div>
    ),
  },
  {
    id: "vps",
    title: "1. VPS le lo (relay server ke liye)",
    summary: "$5/month, 5 minute",
    body: (
      <div className="space-y-3 text-white/80">
        <p>Recommended providers:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>Hetzner CX22 — €4.5/month (best value)</li>
          <li>DigitalOcean Basic — $6/month</li>
          <li>Contabo VPS S — $5/month</li>
        </ul>
        <p>
          OS: <b>Ubuntu 22.04 LTS</b>. Minimum: 2 vCPU, 2 GB RAM, 40 GB SSD. Open ports in firewall:{" "}
          <code className="rounded bg-white/10 px-1">21115/tcp, 21116/tcp+udp, 21117/tcp, 21118/tcp, 21119/tcp</code>.
        </p>
        <p>SSH karke andar jao:</p>
        <CodeBlock label="local terminal">{`ssh root@YOUR_VPS_IP`}</CodeBlock>
      </div>
    ),
  },
  {
    id: "relay",
    title: "2. Relay server deploy karo (Docker se)",
    summary: "Ek command me ready",
    body: (
      <div className="space-y-3 text-white/80">
        <p>Docker install karo (agar nahi hai):</p>
        <CodeBlock label="VPS shell">{`curl -fsSL https://get.docker.com | sh
systemctl enable --now docker`}</CodeBlock>

        <p>
          Persistent data folder banao aur relay binaries (hbbs + hbbr) chalao. Ye RustDesk team ke official server images
          hain (AGPL):
        </p>
        <CodeBlock label="VPS shell">{`mkdir -p /opt/sstech-nexeus/data
cd /opt/sstech-nexeus

# hbbs = ID/Rendezvous server
docker run -d --name nexeus-hbbs --restart unless-stopped \\
  --net=host \\
  -v /opt/sstech-nexeus/data:/root \\
  rustdesk/rustdesk-server:latest \\
  hbbs -r YOUR_VPS_IP:21117

# hbbr = Relay server
docker run -d --name nexeus-hbbr --restart unless-stopped \\
  --net=host \\
  -v /opt/sstech-nexeus/data:/root \\
  rustdesk/rustdesk-server:latest \\
  hbbr`}</CodeBlock>

        <p>
          Replace <code className="rounded bg-white/10 px-1">YOUR_VPS_IP</code> with the actual public IP. Verify:
        </p>
        <CodeBlock>{`docker ps
# Dono containers "Up" dikhne chahiye

ls /opt/sstech-nexeus/data/
# id_ed25519 + id_ed25519.pub files generate hui hongi`}</CodeBlock>

        <p>
          <b className="text-white">Public key copy karo</b> — clients ko isi key ke saath sign karna hoga taaki sirf
          aapke server se connect ho:
        </p>
        <CodeBlock>{`cat /opt/sstech-nexeus/data/id_ed25519.pub`}</CodeBlock>
      </div>
    ),
  },
  {
    id: "fork",
    title: "3. RustDesk client fork karo",
    summary: "GitHub pe apna repo",
    body: (
      <div className="space-y-3 text-white/80">
        <p>
          GitHub pe jao →{" "}
          <a
            className="text-cyan-300 underline"
            href="https://github.com/rustdesk/rustdesk"
            target="_blank"
            rel="noreferrer"
          >
            github.com/rustdesk/rustdesk
          </a>{" "}
          → <b>Fork</b> button → apne account / org me fork karo. Naam rakho:{" "}
          <code className="rounded bg-white/10 px-1">sstech-nexeus-client</code>.
        </p>
        <p>Local pe clone:</p>
        <CodeBlock>{`git clone https://github.com/YOUR_GITHUB/sstech-nexeus-client.git
cd sstech-nexeus-client`}</CodeBlock>
        <p className="text-sm text-white/60">
          ⚠ License compliance: <code>LICENCE</code> file ko delete mat karna. AGPL-3.0 notice intact rakhna. Aapke fork
          ka source bhi public hona chahiye.
        </p>
      </div>
    ),
  },
  {
    id: "branding",
    title: "4. SSTECH NEXEUS branding apply karo",
    summary: "Logo, naam, colors",
    body: (
      <div className="space-y-3 text-white/80">
        <p>RustDesk me branding kuch jagah change karni hoti hai. Ye exact files hain:</p>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-2 font-semibold text-white">A) App name & product ID</p>
          <p className="text-sm">
            File: <code className="rounded bg-white/10 px-1">Cargo.toml</code> (root) — <code>name</code> field aur{" "}
            <code className="rounded bg-white/10 px-1">src/lang/en.rs</code> me strings.
          </p>
          <p className="mt-2 text-sm">
            File: <code className="rounded bg-white/10 px-1">flutter/lib/common.dart</code> — search{" "}
            <code>"RustDesk"</code>, replace <code>"SSTECH NEXEUS"</code>.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-2 font-semibold text-white">B) Icons & logo</p>
          <p className="text-sm">
            Replace these with your SSTECH logo (PNG/ICO):
          </p>
          <ul className="ml-5 mt-1 list-disc text-sm">
            <li>
              <code>res/icon.png</code>, <code>res/icon.ico</code>, <code>res/mac-icon.icns</code>
            </li>
            <li>
              <code>flutter/assets/logo.svg</code>
            </li>
            <li>
              <code>flutter/web/icons/Icon-*.png</code>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-2 font-semibold text-white">C) Built-in server pre-configuration</p>
          <p className="text-sm">
            Ye step important hai — clients ko auto-detect karna chahiye aapka relay (user ko manually IP enter na karna
            pade).
          </p>
          <p className="mt-2 text-sm">
            File: <code className="rounded bg-white/10 px-1">libs/hbb_common/src/config.rs</code>
          </p>
          <CodeBlock>{`// Find these constants and replace:
pub const RENDEZVOUS_SERVERS: &[&str] = &["YOUR_VPS_IP"];
pub const RS_PUB_KEY: &str = "PASTE_id_ed25519.pub_CONTENTS_HERE";
pub const APP_NAME: &str = "SSTECH NEXEUS";`}</CodeBlock>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-2 font-semibold text-white">D) Theme colors</p>
          <p className="text-sm">
            File: <code className="rounded bg-white/10 px-1">flutter/lib/common.dart</code> → search{" "}
            <code>MyTheme</code> → primary color ko apne SSTECH blue (<code>#1E3A8A</code>) me set karo.
          </p>
        </div>

        <p>Commit & push:</p>
        <CodeBlock>{`git add .
git commit -m "Rebrand to SSTECH NEXEUS + configure relay"
git push origin master`}</CodeBlock>
      </div>
    ),
  },
  {
    id: "build",
    title: "5. Installers build karo",
    summary: "Windows / Mac / Linux",
    body: (
      <div className="space-y-3 text-white/80">
        <p>
          Sabse easy raasta: <b className="text-white">GitHub Actions</b> use karo. RustDesk repo me already{" "}
          <code className="rounded bg-white/10 px-1">.github/workflows/flutter-build.yml</code> hai jo Windows, macOS,
          aur Linux teeno ke installers banata hai.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>Apne fork repo me jao → Actions tab → "I understand my workflows, enable them"</li>
          <li>
            "Flutter build" workflow → <b>Run workflow</b> → branch <code>master</code>
          </li>
          <li>~40 minute wait karo (cross-platform build slow hai)</li>
          <li>
            Workflow complete hone par <b>Artifacts</b> me milegi:
            <ul className="ml-5 mt-1 list-disc text-sm">
              <li>
                <code>sstech-nexeus-x86_64.exe</code> (Windows)
              </li>
              <li>
                <code>sstech-nexeus.dmg</code> (macOS)
              </li>
              <li>
                <code>sstech-nexeus_amd64.deb</code> + <code>.rpm</code> (Linux)
              </li>
            </ul>
          </li>
        </ol>
        <p>
          Local build chahiye to{" "}
          <a
            className="text-cyan-300 underline"
            href="https://rustdesk.com/docs/en/dev/build/"
            target="_blank"
            rel="noreferrer"
          >
            official build docs
          </a>{" "}
          dekho — Rust + Flutter + vcpkg setup chahiye.
        </p>
      </div>
    ),
  },
  {
    id: "host",
    title: "6. Installers ko website pe host karo",
    summary: "Download page wire-up",
    body: (
      <div className="space-y-3 text-white/80">
        <p>3 options hain installers host karne ke liye:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <b className="text-white">GitHub Releases</b> (free, recommended) — apne fork repo me Release banao, files
            attach karo. Direct download links mil jayenge.
          </li>
          <li>
            <b className="text-white">Cloudflare R2</b> — $0 egress, fast.
          </li>
          <li>
            <b className="text-white">Apna VPS</b> — same machine pe nginx se serve karo.
          </li>
        </ul>
        <p>
          Jab URLs ready ho jaye, mujhe bata dijiye — main is project ke{" "}
          <code className="rounded bg-white/10 px-1">/download</code> page pe Windows/Mac/Linux buttons ko aapke real
          installer URLs se wire kar dunga.
        </p>
      </div>
    ),
  },
  {
    id: "test",
    title: "7. Test karo",
    summary: "End-to-end working check",
    body: (
      <div className="space-y-3 text-white/80">
        <ol className="ml-5 list-decimal space-y-2">
          <li>2 alag computers pe SSTECH NEXEUS installer install karo</li>
          <li>App khole — top pe ek 9-digit ID dikhega + ek password</li>
          <li>
            Computer A pe Computer B ka ID enter karo → Connect → B pe password prompt → password enter → screen connect
            ho jayegi
          </li>
          <li>Network tab me dekho — connection aapke VPS IP se ja rahi honi chahiye (relay verify)</li>
        </ol>
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          ✓ Agar ye kaam karta hai — aapka real, branded, self-hosted remote support platform live hai.
        </p>
      </div>
    ),
  },
];

function SetupGuide() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link to="/" className="text-sm text-white/60 hover:text-white">
          ← Back to home
        </Link>

        <header className="mt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Self-Host Guide</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Deploy your own <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">SSTECH NEXEUS</span> infrastructure
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Ye guide aapko ek real, working remote-support platform deploy karne me help karega — relay server +
            branded desktop clients (Windows/Mac/Linux). Estimated time: <b className="text-white">1–2 din</b>.
            Recurring cost: <b className="text-white">~$5/month</b> (VPS).
          </p>
        </header>

        <nav className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 text-sm font-semibold text-white/80">Steps</p>
          <ol className="space-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-white/70 hover:text-cyan-300">
                  {i === 0 ? "" : `${i}. `}
                  {s.title.replace(/^\d+\.\s*/, "")} <span className="text-white/40">— {s.summary}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          {steps.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-white">{s.title}</h2>
              <p className="mt-1 text-sm text-white/50">{s.summary}</p>
              <div className="mt-5">{s.body}</div>
            </section>
          ))}
        </div>

        <footer className="mt-20 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-red-500/10 p-8">
          <h3 className="text-xl font-bold">Stuck somewhere?</h3>
          <p className="mt-2 text-white/70">
            Jab aap step 5 tak pohonche aur installers ban jaye, mujhe URLs do — main download page ko wire kar dunga
            aur ek branded "How to connect" tutorial page bhi bana dunga.
          </p>
        </footer>
      </div>
    </div>
  );
}
