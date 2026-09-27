import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Building2, CheckCircle2, ArrowLeft, IndianRupee, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — SSTECH NEXEUS" },
      { name: "description", content: "Pay securely via SBI bank transfer / UPI. SSTECH NEXEUS by SS TECH SERVICES." },
      { property: "og:title", content: "Payment — SSTECH NEXEUS" },
      { property: "og:description", content: "Bank transfer & UPI payment portal for SS TECH SERVICES." },
    ],
  }),
  component: PaymentPage,
});

const BANK = {
  beneficiary: "MS SS TECH SERVICES",
  bank: "State Bank of India",
  branch: "RAJGHAT HARRAIYA, DIST: BASTI, UTTAR PRADESH — 272135",
  account: "42868917846",
  ifsc: "SBIN0001688",
  type: "Current A/C",
  upi: "sstechservices@sbi",
};

const PLANS = [
  { id: "monthly", label: "Monthly", inr: 680 },
  { id: "quarterly", label: "Quarterly", inr: 1700 },
  { id: "halfyearly", label: "Half-Yearly", inr: 3400 },
  { id: "annual", label: "Annual", inr: 6100 },
  { id: "two", label: "2 Year (10% off)", inr: 10980 },
  { id: "three", label: "3 Year (10% off)", inr: 16470 },
];

function PaymentPage() {
  const [plan, setPlan] = useState(PLANS[0]);
  const [txn, setTxn] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txn || !email) return toast.error("Transaction ID aur email zaroori hai");
    toast.success("Payment proof submitted. Activation 24hrs me ho jayega.");
    setTxn(""); setName(""); setEmail("");
  };

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SSTECH" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="leading-tight">
              <div className="font-bold text-sm">SSTECH <span className="text-blue-400">NEXEUS</span></div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Payment Portal</div>
            </div>
          </Link>
          <Link to="/pricing"><Button variant="ghost" size="sm" className="text-white/70"><ArrowLeft className="h-4 w-4 mr-1" />Back to pricing</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure bank transfer · Verified SBI Business Account
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-5xl font-bold tracking-tight">Complete your payment</h1>
          <p className="mt-3 text-white/60">Bank transfer ya UPI se payment karein. Activation 24 hours ke andar.</p>
        </div>

        {/* Plan selector */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-4">Select plan</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlan(p)}
                className={`rounded-xl border p-4 text-left transition ${plan.id === p.id ? "border-blue-500/60 bg-blue-500/10" : "border-white/10 bg-black/30 hover:border-white/20"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.label}</div>
                  {plan.id === p.id && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <IndianRupee className="h-4 w-4 text-white/60" />
                  <span className="font-display text-2xl font-bold">{p.inr.toLocaleString("en-IN")}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bank details */}
          <section className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent p-6">
            <div className="flex items-center gap-2 text-blue-300">
              <Building2 className="h-5 w-5" />
              <h2 className="font-semibold">SBI Business Account — Bank Transfer / NEFT / IMPS</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Beneficiary", BANK.beneficiary],
                ["Bank", BANK.bank],
                ["Account Number", BANK.account],
                ["IFSC Code", BANK.ifsc],
                ["Account Type", BANK.type],
                ["Branch", BANK.branch],
                ["UPI ID", BANK.upi],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{k}</div>
                    <div className="font-mono text-sm font-semibold mt-0.5 break-all">{v}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copy(v, k)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/50">
              Payment ke baad neeche form me Transaction / UTR ID submit karein. Confirmation 24 hours ke andar email pe.
            </p>
          </section>

          {/* Submit proof */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold mb-1">Submit payment proof</h2>
            <p className="text-xs text-white/50 mb-5">Selected: <span className="text-blue-300 font-semibold">{plan.label} — ₹{plan.inr.toLocaleString("en-IN")}</span></p>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black/40 border-white/10 text-white" placeholder="Your full name" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Email</label>
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Transaction / UTR ID</label>
                <Input required value={txn} onChange={(e) => setTxn(e.target.value)} className="bg-black/40 border-white/10 text-white font-mono" placeholder="e.g. 412345678901" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-red-500">Submit for verification</Button>
            </form>
            <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] text-white/50">
              International cards / Stripe / Razorpay gateway integration coming soon. For now, direct bank transfer & UPI accepted.
            </div>
          </section>
        </div>

        <div className="text-center text-xs text-white/40">
          Powered by <span className="text-white/70 font-semibold">SS TECH SERVICES</span> · <a href="https://sstechservices.org" className="text-blue-400 hover:underline">sstechservices.org</a>
        </div>
      </main>
    </div>
  );
}
