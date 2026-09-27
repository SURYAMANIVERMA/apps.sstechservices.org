import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, Smartphone, ShieldCheck } from "lucide-react";
import logoAsset from "@/assets/sstech-logo.png.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/mobile/android")({
  head: () => ({
    meta: [
      { title: "Android APK — SSTECH Nexeus" },
      { name: "description", content: "Android APK download channel for SSTECH Nexeus Quick Support." },
    ],
  }),
  component: AndroidBuildPage,
});

function AndroidBuildPage() {
  return (
    <div className="min-h-screen text-foreground">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <Link to="/download" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Downloads
        </Link>
        <img src={logoAsset.url} alt="SSTECH Nexeus" className="h-16 w-16 rounded-2xl bg-background p-1 ring-1 ring-border" />
        <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5 text-primary" /> Android build channel
        </div>
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight md:text-5xl">SSTECH Nexeus Android APK</h1>
        <p className="mt-4 text-muted-foreground">
          Mobile card ab Windows .exe/.zip download nahi karega. Android APK build ke liye ye dedicated channel open hota hai.
        </p>
        <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">APK build ready hone par yahin download hoga</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Android native screen-control app ko Play Protect compatible signing ke saath package karna hota hai. Abhi galat Windows file download hone se rok diya gaya hai.
              </p>
            </div>
          </div>
          <a href="mailto:support@sstechservices.org?subject=Android%20APK%20build%20request">
            <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" /> Request APK build
            </Button>
          </a>
        </div>
      </main>
    </div>
  );
}