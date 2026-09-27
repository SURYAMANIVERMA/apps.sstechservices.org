import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BUILD_TIME, BUILD_HASH, ROUTES, ASSETS } from "@/lib/build-info";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function PreviewDiagnostics() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, tick] = useState(0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMounted(true);
    try {
      setOpen(localStorage.getItem("nexeus:diag-open") === "1");
    } catch {}
    const id = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, []);

  // Hide on production published site
  if (!mounted) return null;
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isPreview =
    import.meta.env.DEV ||
    host.includes("lovable.app") ||
    host.includes("lovable.dev") ||
    host === "localhost";
  if (!isPreview) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem("nexeus:diag-open", next ? "1" : "0");
    } catch {}
  };

  const buildLine = `Build ${BUILD_HASH} · ${new Date(BUILD_TIME).toLocaleString()}`;

  return (
    <div className="fixed bottom-3 right-3 z-[9999] font-mono text-[11px]">
      {!open && (
        <button
          onClick={toggle}
          className="rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-white/80 backdrop-blur hover:bg-black/90"
          title="Preview diagnostics"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {BUILD_HASH} · {timeAgo(BUILD_TIME)}
        </button>
      )}

      {open && (
        <div className="w-[320px] rounded-lg border border-white/15 bg-black/85 p-3 text-white/90 shadow-2xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-semibold">Preview Diagnostics</div>
            <div className="flex gap-1">
              <button
                onClick={() => navigator.clipboard?.writeText(buildLine)}
                className="rounded border border-white/15 px-1.5 py-0.5 hover:bg-white/10"
                title="Copy build info"
              >
                copy
              </button>
              <button
                onClick={toggle}
                className="rounded border border-white/15 px-1.5 py-0.5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mb-2 rounded bg-white/5 p-2">
            <div className="text-white/60">Build</div>
            <div>{BUILD_HASH}</div>
            <div className="text-white/60">
              {new Date(BUILD_TIME).toLocaleString()} · {timeAgo(BUILD_TIME)}
            </div>
          </div>

          <div className="mb-1 text-white/60">Routes</div>
          <ul className="mb-2 max-h-40 overflow-auto rounded bg-white/5 p-1">
            {ROUTES.map((r) => {
              const active = pathname === r.path;
              return (
                <li
                  key={r.path}
                  className={`flex items-center justify-between rounded px-1.5 py-0.5 ${
                    active ? "bg-emerald-500/20 text-emerald-200" : ""
                  }`}
                >
                  <a href={r.path} className="hover:underline">
                    {r.path}
                  </a>
                  <span className="text-white/50">{r.label}</span>
                </li>
              );
            })}
          </ul>

          <div className="mb-1 text-white/60">Assets</div>
          <ul className="rounded bg-white/5 p-1">
            {ASSETS.map((a) => (
              <li key={a.path} className="flex justify-between px-1.5 py-0.5">
                <span>{a.name}</span>
                <span className="text-white/50">{a.path.split("/").pop()}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 text-[10px] text-white/40">
            Bundle timestamp updates on every rebuild. Hidden on production.
          </div>
        </div>
      )}
    </div>
  );
}
