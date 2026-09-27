import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Shield, Flame, Camera, Server, Cloud, Boxes, Lock, Globe, Smartphone,
  Network, LifeBuoy, Database, ArrowRight,
} from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Enterprise Services — SS TECH SERVICES" },
      { name: "description", content: "Network security, firewalls, CCTV, cloud, OpenShift, cybersecurity, AMC, and 24×7 enterprise IT support by SS TECH SERVICES." },
      { property: "og:title", content: "Enterprise Services — SS TECH SERVICES" },
      { property: "og:description", content: "Premium enterprise IT, security and cloud services." },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { icon: Shield, title: "Network Security", desc: "Zero-trust segmentation, IDS/IPS, SOC monitoring." },
  { icon: Flame, title: "Firewall Configuration", desc: "Fortinet, Sophos, Palo Alto, pfSense — hardened." },
  { icon: Camera, title: "CCTV Installation", desc: "IP & analog surveillance with NVR + cloud archive." },
  { icon: Server, title: "Server Deployment", desc: "Bare-metal, virtualization, HA clusters." },
  { icon: Cloud, title: "Cloud Infrastructure", desc: "AWS, Azure, GCP architecture & migration." },
  { icon: Boxes, title: "OpenShift / Kubernetes", desc: "Cluster setup, operators, GitOps pipelines." },
  { icon: Lock, title: "Cyber Security Consulting", desc: "Audits, pentests, ISO 27001 readiness." },
  { icon: Globe, title: "Website Development", desc: "Premium enterprise web platforms." },
  { icon: Smartphone, title: "App Development", desc: "iOS, Android & cross-platform apps." },
  { icon: Network, title: "VPN Server Deployment", desc: "WireGuard / OpenVPN for distributed teams." },
  { icon: LifeBuoy, title: "IT AMC Support", desc: "Annual maintenance with SLA-backed response." },
  { icon: Database, title: "Data Center Support", desc: "Rack, cooling, power & 24×7 NOC." },
];

function ServicesPage() {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SS TECH SERVICES" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="leading-tight">
              <div className="font-bold text-sm">SS TECH <span className="text-blue-400">SERVICES</span></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Enterprise Platform</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <Link to="/services" className="text-white">Services</Link>
            <Link to="/pricing" className="hover:text-white">Pricing</Link>
            <Link to="/payment" className="hover:text-white">Payments</Link>
            <Link to="/client" className="hover:text-white">Clients</Link>
            <Link to="/employee" className="hover:text-white">Employees</Link>
          </nav>
          <Link to="/payment"><Button size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500">Pay now</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 space-y-14">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
            Enterprise-grade · 24×7 SLA · ISO-aligned
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Engineered for <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">mission-critical</span> enterprises
          </h1>
          <p className="mt-4 text-white/60 text-lg">
            From firewalls to OpenShift clusters — SS TECH SERVICES designs, deploys and supports the entire stack.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-blue-400/40 hover:bg-white/[0.07] transition">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-emerald-500/0 group-hover:from-blue-500/20 group-hover:to-emerald-500/20 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-white/10">
                  <Icon className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/60">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 p-10 text-center">
          <h2 className="font-display text-3xl font-bold">Need a custom enterprise quote?</h2>
          <p className="mt-2 text-white/60">Talk to our solution architects — response within 4 business hours.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/payment"><Button className="bg-gradient-to-r from-blue-500 to-emerald-500">Make a payment <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/client"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Client portal</Button></Link>
          </div>
        </section>

        <footer className="text-center text-xs text-white/40 pt-10 border-t border-white/10">
          Powered by <span className="text-white/80 font-semibold">SS TECH SERVICES</span> · 24×7 Enterprise IT Support · <a href="https://sstechservices.org" className="text-blue-400 hover:underline">sstechservices.org</a>
        </footer>
      </main>
    </div>
  );
}
