import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Users, FileSpreadsheet, CalendarCheck, BriefcaseBusiness, ShieldCheck, Wrench } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/employee")({
  head: () => ({
    meta: [
      { title: "Employee Portal — SS TECH SERVICES" },
      { name: "description", content: "Internal HR, payroll, attendance and IT support portal for SS TECH SERVICES staff." },
    ],
  }),
  component: EmployeePortal,
});

const ITEMS = [
  { icon: FileSpreadsheet, title: "Salary Slip", desc: "Download monthly pay slips." },
  { icon: CalendarCheck, title: "Attendance", desc: "Clock-in & monthly summary." },
  { icon: Users, title: "HR Dashboard", desc: "Documents, policies, profile." },
  { icon: BriefcaseBusiness, title: "Leave Management", desc: "Apply & track leaves." },
  { icon: Wrench, title: "IT Support", desc: "Internal tickets for IT team." },
  { icon: ShieldCheck, title: "Security Center", desc: "MFA, devices, access logs." },
];

function EmployeePortal() {
  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SS TECH SERVICES" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="font-bold text-sm">SS TECH <span className="text-blue-400">SERVICES</span></div>
          </Link>
          <Link to="/auth"><Button size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500">Employee Sign-in</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
            Internal · Restricted · Staff-only
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-5xl font-bold">Employee workspace</h1>
          <p className="mt-3 text-white/60">Payroll, HR, attendance and IT — one secure portal.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-blue-400/40 transition">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 ring-1 ring-white/10">
                <Icon className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          Access is restricted to verified SS TECH SERVICES staff. Use your corporate email to sign in.
        </div>

        <footer className="text-center text-xs text-white/40 pt-8 border-t border-white/10">
          Powered by <span className="text-white/80 font-semibold">SS TECH SERVICES</span> · 24×7 Enterprise IT Support · <a href="https://sstechservices.org" className="text-blue-400 hover:underline">sstechservices.org</a>
        </footer>
      </main>
    </div>
  );
}
