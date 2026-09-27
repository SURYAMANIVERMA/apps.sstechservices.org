import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/sstech-logo.png.asset.json";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SSTECH NEXEUS Remote Support" },
      { name: "description", content: "Free for personal use. Business plans from $8/month. Students get 1 year free with .edu / .ac.in email." },
      { property: "og:title", content: "SSTECH NEXEUS Pricing — Free for individuals" },
      { property: "og:description", content: "$8/mo, $20/qtr, $40/half-year, annual & multi-year plans with 10% discount." },
    ],
  }),
  component: Pricing,
});

type Plan = {
  id: string;
  name: string;
  price: string;
  per: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  cta: string;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    per: "forever",
    features: [
      "Personal use",
      "Up to 30 saved devices",
      "Auto-rotating one-time PIN",
      "AES-256 end-to-end encryption",
      "Community support",
    ],
    cta: "Get started",
  },
  {
    id: "student",
    name: "Student",
    price: "$0",
    per: "1 year free",
    badge: "Auto-detected",
    features: [
      "Free with .edu / .ac.in / .edu.in email",
      "100 saved devices",
      "Renews yearly with valid institute email",
      "All Business features included",
      "Priority email support",
    ],
    cta: "Sign up with student email",
  },
  {
    id: "monthly",
    name: "Business Monthly",
    price: "$8",
    per: "/month",
    features: [
      "For freelancers & small teams",
      "Unlimited saved devices",
      "Unattended access",
      "File transfer + chat",
      "Priority support",
    ],
    cta: "Start monthly",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "$20",
    per: "/ 3 months",
    badge: "Save ~17%",
    features: [
      "Everything in Monthly",
      "Billed every 3 months",
      "Equivalent to ~$6.67/mo",
    ],
    cta: "Start quarterly",
  },
  {
    id: "halfyearly",
    name: "Half-yearly",
    price: "$40",
    per: "/ 6 months",
    badge: "Save ~17%",
    features: [
      "Everything in Quarterly",
      "Billed every 6 months",
      "Equivalent to ~$6.67/mo",
    ],
    cta: "Start half-yearly",
  },
  {
    id: "annual",
    name: "Annual",
    price: "$72",
    per: "/ year",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Half-yearly",
      "Equivalent to $6/mo",
      "25% off vs monthly",
      "Custom branding",
    ],
    cta: "Go annual",
  },
  {
    id: "two_year",
    name: "2-Year",
    price: "$130",
    per: "/ 2 years",
    badge: "10% extra off",
    features: [
      "Annual price × 2, then 10% off",
      "Locked-in rate",
      "Dedicated account manager",
    ],
    cta: "Go 2-year",
  },
  {
    id: "three_year",
    name: "3-Year",
    price: "$194",
    per: "/ 3 years",
    badge: "Best value · 10% off",
    features: [
      "Annual price × 3, then 10% off",
      "Locked-in rate",
      "Onboarding & training included",
    ],
    cta: "Go 3-year",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-red-500/10 blur-[140px]" />
      </div>

      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="SSTECH" className="h-9 w-9 rounded-lg bg-white/5 p-1" />
            <div className="font-bold text-sm">SSTECH <span className="text-blue-400">NEXEUS</span></div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-gradient-to-r from-blue-500 to-red-500">Get started free</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Free for personal use · Always
          </div>
          <h1 className="mt-6 text-5xl font-bold tracking-tight">Simple, honest pricing</h1>
          <p className="mt-4 text-lg text-white/60">
            Free for everyone. Pay only when you're running a business. Multi-year plans get 10% extra off.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                p.highlight
                  ? "border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-transparent shadow-[0_0_60px_-15px] shadow-blue-500/40"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {p.badge && (
                <div className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${p.highlight ? "bg-blue-500 text-white" : "bg-white/10 text-white/80"}`}>
                  {p.badge}
                </div>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-white/50">{p.per}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-white/70 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Link to="/auth" className="mt-6 block">
                <Button className={`w-full ${p.highlight ? "bg-gradient-to-r from-blue-500 to-red-500" : "bg-white/10 hover:bg-white/20"}`}>
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8 max-w-3xl mx-auto text-sm text-white/70">
          <h3 className="text-white font-semibold mb-3">How billing works</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li><strong className="text-white">Personal use is always free</strong> with up to 30 saved devices.</li>
            <li><strong className="text-white">Students:</strong> sign up with a .edu / .ac.in / .edu.in email — 1 year free is applied automatically.</li>
            <li><strong className="text-white">Business plans:</strong> charged per single user (technician). Unlimited saved devices.</li>
            <li><strong className="text-white">2-year & 3-year plans:</strong> 10% extra discount on top of the annual rate.</li>
            <li>Payments will be activated in the next release (Stripe / Paddle integration in progress).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
