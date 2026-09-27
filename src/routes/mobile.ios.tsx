import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Apple, ExternalLink, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mobile/ios")({
  head: () => ({
    meta: [
      { title: "iOS Build — SSTECH Nexeus" },
      { name: "description", content: "iOS App Store/TestFlight channel for SSTECH Nexeus Quick Support." },
    ],
  }),
  component: IosBuildPage,
});

function IosBuildPage() {
  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <Link to="/download" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Downloads
        </Link>
        <img src={logoAsset.url} alt="SSTECH Nexeus" className="h-16 w-16 rounded-2xl bg-background p-1 ring-1 ring-border" />
        <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
          <Apple className="h-3.5 w-3.5 text-primary" /> iOS build channel
        </div>
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight md:text-5xl">SSTECH Nexeus iOS Build</h1>
        <p className="mt-4 text-muted-foreground">
          iPhone/iPad card ab Windows .exe/.zip download nahi karega. iOS ke liye App Store ya TestFlight channel use hota hai.
        </p>
        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">iOS build signing channel</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                iOS app direct .exe ki tarah download nahi hoti; Apple signing/TestFlight/App Store approval ke baad yahi button official redirect karega.
              </p>
            </div>
          </div>
          <a href="mailto:support@sstechservices.org?subject=iOS%20build%20request">
            <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <ExternalLink className="mr-2 h-4 w-4" /> Request iOS build
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}