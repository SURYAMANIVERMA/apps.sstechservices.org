import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/sstech-logo.png.asset.json";
const logo = logoAsset.url;
import hero from "@/assets/hero-nexeus.jpg";
import { Button } from "@/components/ui/button";
import {
  Shield, Zap, Monitor, Lock, Headphones, Globe, Download, ArrowRight,
  CheckCircle2, Sparkles, Cpu, Users, Star, Activity, Layers
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sstech Nexeus — World-Class Remote Support" },
      { name: "description", content: "Ultra-secure, lightning-fast remote desktop support trusted by teams worldwide. Connect to any device in milliseconds." },
      { property: "og:title", content: "Sstech Nexeus — Remote Support, Redefined" },
      { property: "og:description", content: "Connect to any device, anywhere — in milliseconds. Military-grade encryption. Built for scale." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground antialiased selection:bg-primary/30">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[700px] w-[1200px] -translate-x-1/2 rounded-full bg-primary/15 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.82_0.17_165/0.08),transparent_60%)]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg" />
              <img src={logo} alt="Sstech Nexeus" className="relative h-11 w-11 rounded-xl bg-background p-1 ring-1 ring-border" width={44} height={44} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">SSTECH <span className="text-primary">NEXEUS</span></div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Remote Support</div>
            </div>
          </a>
          <nav className="hidden gap-9 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#how" className="transition hover:text-foreground">How it works</a>
            <a href="#trust" className="transition hover:text-foreground">Trust</a>
            <Link to="/pricing" className="transition hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" className="hidden md:inline-flex">Sign in</Button></Link>
            <Link to="/app">
              <Button className="bg-primary text-primary-foreground shadow-[0_0_40px_-5px] shadow-primary/40 hover:bg-primary/90">
                <Download className="mr-2 h-4 w-4" /> Open Dashboard
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Trusted by teams in 80+ countries
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-primary">v4.0 just shipped</span>
            </div>
            <h1 className="font-display mt-8 text-6xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem]">
              Remote support,<br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">redefined for the world.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Sstech Nexeus connects engineers to any device on Earth in milliseconds —
              with quantum-grade encryption, zero install friction, and a control surface
              that feels like the future.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/download">
                <Button size="lg" className="h-12 bg-primary px-7 text-base text-primary-foreground shadow-[0_0_50px_-5px] shadow-primary/50 hover:bg-primary/90">
                  <Download className="mr-2 h-5 w-5" /> Download free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 border-border bg-card/50 px-7 text-base backdrop-blur">
                Start a session <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No signup</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> AES-256 + RSA-4096</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> SOC 2 Type II</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> GDPR ready</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto mt-20 max-w-6xl">
            <div className="absolute inset-x-10 -top-10 bottom-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-2 shadow-2xl backdrop-blur">
              <div className="overflow-hidden rounded-2xl ring-1 ring-border/60">
                <img src={hero} alt="Sstech Nexeus remote desktop interface" className="w-full" width={1024} height={1024} />
              </div>
            </div>
            {/* Floating stats */}
            <div className="absolute -left-4 top-1/4 hidden rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-xl backdrop-blur md:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Latency</div>
                  <div className="font-display text-sm font-semibold">12ms avg</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-1/4 hidden rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-xl backdrop-blur md:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Encrypted</div>
                  <div className="font-display text-sm font-semibold">100% sessions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="border-y border-border/40 bg-card/20 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
            {[
              { v: "180M+", l: "Sessions per month" },
              { v: "99.99%", l: "Uptime SLA" },
              { v: "12ms", l: "Global latency" },
              { v: "80+", l: "Countries served" },
            ].map((s) => (
              <div key={s.l} className="text-center md:text-left">
                <div className="font-display text-3xl font-bold tracking-tight md:text-4xl">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Capabilities</p>
            <h2 className="font-display mt-4 text-5xl font-bold tracking-tight">Engineered for speed. <span className="text-muted-foreground">Built for trust.</span></h2>
            <p className="mt-5 text-lg text-muted-foreground">Every detail crafted so you spend zero seconds fighting the tool — and every second solving the problem.</p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: "Sub-15ms latency", desc: "Custom UDP protocol with adaptive H.265 streaming. Feels native, even across continents." },
              { icon: Lock, title: "Quantum-ready encryption", desc: "AES-256-GCM with RSA-4096 key exchange. Forward secrecy on every packet." },
              { icon: Monitor, title: "Unattended access", desc: "Install once, control 24/7. Wake-on-LAN, remote reboot, BIOS-level support." },
              { icon: Globe, title: "Universal platform", desc: "Windows, macOS, Linux, ChromeOS, Android, iOS — one console, every device." },
              { icon: Headphones, title: "Voice, chat & whiteboard", desc: "Crystal-clear voice, persistent chat, and annotation tools built right in." },
              { icon: Cpu, title: "AI assist", desc: "Smart diagnostics, auto-script suggestions, and instant log summaries." },
              { icon: Users, title: "Team collaboration", desc: "Shared sessions, role-based access, session handoff between agents." },
              { icon: Layers, title: "File transfer at scale", desc: "Drag-drop multi-GB files with resumable, parallel-stream transfer." },
              { icon: Shield, title: "Enterprise controls", desc: "SSO, SAML, SCIM, audit logs, session recording, IP allowlists." },
            ].map((f) => (
              <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-7 backdrop-blur transition hover:border-primary/40 hover:bg-card/70">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 to-primary/0 opacity-0 transition group-hover:from-primary/10 group-hover:opacity-100" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative border-y border-border/40 bg-card/20 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Workflow</p>
              <h2 className="font-display mt-4 text-5xl font-bold tracking-tight">Three steps. Zero friction.</h2>
              <p className="mt-5 text-lg text-muted-foreground">From cold start to controlling a machine on another continent — under fifteen seconds.</p>
              <div className="mt-10 space-y-6">
                {[
                  { n: "01", t: "Download & launch", d: "Lightweight 4MB client. No installer, no admin rights required." },
                  { n: "02", t: "Share your secure ID", d: "Give your 9-digit session ID and one-time PIN to your agent." },
                  { n: "03", t: "Get help — instantly", d: "Agent connects through encrypted relays. Issue resolved in minutes." },
                ].map((s) => (
                  <div key={s.n} className="flex gap-5">
                    <div className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-sm font-bold text-primary">{s.n}</div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock terminal */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/15 blur-3xl" />
              <div className="rounded-2xl border border-border/60 bg-background/80 p-1 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <span className="ml-3 text-xs text-muted-foreground">nexeus // secure-session</span>
                </div>
                <div className="rounded-xl bg-background/50 p-6 font-mono text-[13px] leading-relaxed">
                  <div className="text-muted-foreground"># Initiating secure relay…</div>
                  <div className="text-primary">✔ Handshake complete <span className="text-muted-foreground">(rsa-4096)</span></div>
                  <div className="text-primary">✔ Tunnel established <span className="text-muted-foreground">via fra-1 → sin-2</span></div>
                  <div className="text-primary">✔ Latency <span className="text-foreground">11ms</span> · jitter <span className="text-foreground">0.3ms</span></div>
                  <div className="text-muted-foreground">$ session.id <span className="text-foreground">→ 847-209-356</span></div>
                  <div className="text-muted-foreground">$ status <span className="text-primary">CONNECTED</span> <span className="inline-block h-2 w-2 animate-glow rounded-full bg-primary align-middle" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="trust" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Loved worldwide</p>
            <h2 className="font-display mt-4 text-5xl font-bold tracking-tight">The remote tool teams actually keep.</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { q: "We replaced three legacy tools with Nexeus in a weekend. Our resolution time dropped 60%.", a: "Priya Sharma", r: "Head of IT, Northwind" },
              { q: "The latency is unreal. It genuinely feels like I'm sitting at the remote machine.", a: "Marco Bianchi", r: "Senior Engineer, Lumen" },
              { q: "Security review passed on day one. SOC 2, audit logs, SSO — everything was just there.", a: "Aisha Khan", r: "CISO, Vault Finance" },
            ].map((t) => (
              <figure key={t.a} className="rounded-2xl border border-border/60 bg-card/40 p-7 backdrop-blur">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-base leading-relaxed">"{t.q}"</blockquote>
                <figcaption className="mt-5 text-sm">
                  <div className="font-semibold">{t.a}</div>
                  <div className="text-muted-foreground">{t.r}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative border-t border-border/40 bg-card/20 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Pricing</p>
            <h2 className="font-display mt-4 text-5xl font-bold tracking-tight">Simple plans. Serious power.</h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { name: "Free", price: "$0", desc: "For personal use forever", features: ["1 concurrent session", "AES-256 encryption", "Community support", "Cross-platform"] },
              { name: "Pro", price: "$24", suffix: "/user/mo", desc: "For growing IT teams", features: ["10 concurrent sessions", "Unattended access", "Session recording", "AI diagnostics", "Priority support"], featured: true },
              { name: "Enterprise", price: "Custom", desc: "For mission-critical scale", features: ["Unlimited devices", "SSO / SAML / SCIM", "Audit & compliance", "Dedicated CSM", "99.99% SLA"] },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-2xl border p-8 backdrop-blur ${p.featured ? "border-primary/60 bg-card/80 shadow-[0_0_80px_-15px] shadow-primary/40" : "border-border/60 bg-card/40"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Most popular</div>
                )}
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tight">{p.price}</span>
                  {p.suffix && <span className="text-sm text-muted-foreground">{p.suffix}</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <Button className={`mt-7 w-full ${p.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} variant={p.featured ? "default" : "outline"}>
                  {p.name === "Enterprise" ? "Talk to sales" : "Get started"}
                </Button>
                <ul className="mt-7 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-card/80 via-card/60 to-card/80 p-12 text-center shadow-2xl backdrop-blur md:p-20">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,oklch(0.82_0.17_165/0.25),transparent_70%)]" />
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Connect the world.<br />
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Start in 30 seconds.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Join 50,000+ engineers using Sstech Nexeus to deliver world-class support every day.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="h-12 bg-primary px-8 text-base text-primary-foreground shadow-[0_0_50px_-5px] shadow-primary/60 hover:bg-primary/90">
                <Download className="mr-2 h-5 w-5" /> Download now
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-border bg-background/40 px-8 text-base backdrop-blur">
                Book a demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Sstech Nexeus" className="h-9 w-9 rounded-lg bg-background p-1 ring-1 ring-border" width={36} height={36} />
                <div className="font-display font-bold tracking-tight">SSTECH <span className="text-primary">NEXEUS</span></div>
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Remote support, redefined. Built by engineers, for engineers — and the teams who trust them.
              </p>
            </div>
            {[
              { t: "Product", l: ["Features", "Pricing", "Changelog", "Download"] },
              { t: "Company", l: ["About", "Blog", "Careers", "Contact"] },
              { t: "Legal", l: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((c) => (
              <div key={c.t}>
                <div className="text-xs font-semibold uppercase tracking-wider text-foreground">{c.t}</div>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {c.l.map((i) => <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 text-sm text-muted-foreground md:flex-row md:items-center">
            <div className="space-y-1">
              <div>© {new Date().getFullYear()} SSTECH NEXEUS. All rights reserved.</div>
              <div className="text-xs">
                Powered by <span className="text-foreground font-semibold">SS TECH SERVICES</span> · <a href="https://sstechservices.org" className="text-primary hover:underline">sstechservices.org</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/payment" className="text-primary hover:underline">Payment</Link>
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-2 w-2 animate-glow rounded-full bg-primary" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
