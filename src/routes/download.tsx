import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/sstech-logo.png.asset.json";
import winInstaller from "@/assets/sstech-nexeus-windows.zip.asset.json";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Monitor, Apple, Smartphone, CheckCircle2, Shield, Zap, Headphones } from "lucide-react";

const logo = logoAsset.url;

// SSTECH Nexeus Quick Support — own Electron-based client.
// Windows x64 build is hosted via lovable-assets.
const QUICK_SUPPORT_URL = winInstaller.url;

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Quick Support — SSTECH Nexeus" },
      { name: "description", content: "Download the SSTECH Nexeus Quick Support client for instant, secure remote assistance on Windows, macOS, Linux, Android and iOS." },
      { property: "og:title", content: "Download SSTECH Nexeus Quick Support" },
      { property: "og:description", content: "Instant remote support client — no install, end-to-end encrypted, ready in seconds." },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="min-h-screen text-foreground antialiased">


      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SSTECH Nexeus" className="h-11 w-11 rounded-xl bg-background p-1 ring-1 ring-border" width={44} height={44} />
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">SSTECH <span className="text-primary">NEXEUS</span></div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Remote Support</div>
            </div>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-16 pb-24 lg:pt-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Secure · Signed · Virus-free
          </div>
          <h1 className="font-display mt-8 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Download <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">Quick Support</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Get instant, end-to-end encrypted remote assistance from the SSTECH Services & Academy
            team. No installation required — just download, run, and share your session ID.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={QUICK_SUPPORT_URL} target="_blank" rel="noopener noreferrer" download>
              <Button size="lg" className="h-14 bg-primary px-8 text-base text-primary-foreground shadow-[0_0_60px_-5px] shadow-primary/50 hover:bg-primary/90">
                <Download className="mr-2 h-5 w-5" /> Download Quick Support
              </Button>
            </a>
            <Link to="/setup-guide">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                Self-Host Setup Guide →
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Want a real, production-grade remote-control infrastructure under your own brand?
            Follow the <Link to="/setup-guide" className="text-primary underline">step-by-step guide</Link>.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No signup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> AES-256 encrypted</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free for personal use</span>
          </div>
        </div>

        {/* Platforms */}
        <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Monitor, label: "Windows", sub: "Windows 10 / 11 · 64-bit", href: QUICK_SUPPORT_URL, cta: "Download .zip", available: true, download: true, external: true },
            { icon: Apple, label: "macOS", sub: "macOS 11 Big Sur or newer", href: "mailto:support@sstechservices.org?subject=macOS%20build%20request", cta: "Request macOS build", available: true, download: false, external: false },
            { icon: Smartphone, label: "Android", sub: "Android 9.0+ · APK channel", href: "/mobile/android", cta: "Open APK download", available: true, download: false, external: false },
            { icon: Apple, label: "iOS", sub: "iPhone / iPad · App Store", href: "/mobile/ios", cta: "Open iOS build", available: true, download: false, external: false },
          ].map((p) => (
            <a
              key={p.label}
              href={p.href}
              target={p.external ? "_blank" : undefined}
              rel={p.external ? "noopener noreferrer" : undefined}
              {...(p.download ? { download: true } : {})}
              className="group rounded-2xl border border-border/60 bg-card/40 p-7 backdrop-blur transition hover:border-primary/40 hover:bg-card/70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display mt-5 text-lg font-semibold">{p.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.sub}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                {p.cta} <Download className="h-3.5 w-3.5" />
              </div>
            </a>
          ))}
        </div>

        {/* How to */}
        <div className="mt-20 rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur md:p-12">
          <h2 className="font-display text-3xl font-bold tracking-tight">How to get support in 3 steps</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Download & run", d: "Click the download button above and launch the Quick Support client. No install needed.", icon: Download },
              { n: "02", t: "Share your ID", d: "The client will show a 9-digit session ID. Share it with our technician on call.", icon: Zap },
              { n: "03", t: "Get help live", d: "Approve the secure connection — our agent will take it from there.", icon: Headphones },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-background/40 p-6">
                <div className="font-display text-xs font-bold tracking-wider text-primary">STEP {s.n}</div>
                <h3 className="font-display mt-2 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={QUICK_SUPPORT_URL} target="_blank" rel="noopener noreferrer" download>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="mr-2 h-4 w-4" /> Download now
              </Button>
            </a>
            <a href="mailto:support@sstechservices.org">
              <Button size="lg" variant="outline">Contact support</Button>
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          By downloading you agree to the SSTECH Services & Academy terms of use. The client is
          digitally signed and runs without admin rights.
        </p>
      </main>
    </div>
  );
}
