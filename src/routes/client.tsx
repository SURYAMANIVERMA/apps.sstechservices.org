import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FileText, Receipt, LifeBuoy, RefreshCw, Download, Ticket, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Client Portal — SS TECH SERVICES" },
      { name: "description", content: "Invoices, AMC renewals, ticketing and service requests for SS TECH SERVICES clients." },
    ],
  }),
  component: ClientPortal,
});

const ITEMS = [
  { icon: Receipt, title: "Invoices", desc: "View & download GST invoices." },
  { icon: RefreshCw, title: "AMC Renewals", desc: "Track and renew annual maintenance contracts." },
  { icon: Ticket, title: "Raise a Ticket", desc: "SLA-backed support requests." },
  { icon: LifeBuoy, title: "Service Requests", desc: "On-site, remote, deployment requests." },
  { icon: Download, title: "Invoice PDF", desc: "One-click PDF receipts." },
  { icon: FileText, title: "Subscription History", desc: "Full billing timeline." },
];

function ClientPortal() {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SS TECH SERVICES" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="font-bold text-sm">SS TECH <span className="text-blue-400">SERVICES</span></div>
          </Link>
          <Link to="/auth"><Button size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500">Client Sign-in</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure client portal · SSL · MFA-ready
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-5xl font-bold">Your enterprise hub</h1>
          <p className="mt-3 text-white/60">Manage invoices, renewals and support — all in one place.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-emerald-400/40 transition">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-white/10">
                <Icon className="h-5 w-5 text-emerald-300" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <p><span className="text-white font-semibold">Coming online:</span> The full self-service client area (tickets, invoice PDFs, AMC dashboards) activates after sign-in. New client? <Link to="/auth" className="text-blue-400 hover:underline">Create your account →</Link></p>
        </div>

        <footer className="text-center text-xs text-white/40 pt-8 border-t border-white/10">
          Powered by <span className="text-white/80 font-semibold">SS TECH SERVICES</span> · 24×7 Enterprise IT Support · <a href="https://sstechservices.org" className="text-blue-400 hover:underline">sstechservices.org</a>
        </footer>
      </main>
    </div>
  );
}
