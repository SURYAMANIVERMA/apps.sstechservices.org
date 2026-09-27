import { useEffect, useRef } from "react";

// Site-wide premium animated background:
// sweeping conic rays + drifting orbs + canvas particle network + circuit lines.
export function AnimatedRays() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let pts: P[] = [];

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((w * h) / 22000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // links
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) {
            const alpha = 1 - Math.sqrt(d2) / 130;
            ctx.strokeStyle = `rgba(56,189,248,${alpha * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // nodes
      for (const p of pts) {
        ctx.fillStyle = "rgba(125,211,252,0.85)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(56,189,248,0.18)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#04060d]" />

      {/* Sweeping conic rays */}
      <div className="ray ray-a" />
      <div className="ray ray-b" />
      <div className="ray ray-c" />
      <div className="ray ray-d" />

      {/* Energy beams */}
      <div className="beam beam-1" />
      <div className="beam beam-2" />
      <div className="beam beam-3" />
      <div className="beam-diag beam-diag-1" />
      <div className="beam-diag beam-diag-2" />

      {/* Cloud hub nodes */}
      <div className="hub hub-1" />
      <div className="hub hub-2" />
      <div className="hub hub-3" />

      {/* Drifting color orbs */}
      <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[140px] animate-orb-a" />
      <div className="absolute top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-emerald-400/15 blur-[140px] animate-orb-b" />
      <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/15 blur-[140px] animate-orb-c" />

      {/* Particle / AI network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(125,211,252,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Circuit line SVG */}
      <svg className="absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cw" x1="0" x2="1">
            <stop offset="0" stopColor="rgba(56,189,248,0)" />
            <stop offset="0.5" stopColor="rgba(56,189,248,0.8)" />
            <stop offset="1" stopColor="rgba(56,189,248,0)" />
          </linearGradient>
        </defs>
        <path d="M0,120 L300,120 L340,160 L700,160 L740,120 L1200,120" fill="none" stroke="url(#cw)" strokeWidth="1.2" className="circuit-trace" />
        <path d="M0,420 L220,420 L260,460 L900,460 L940,420 L1400,420" fill="none" stroke="url(#cw)" strokeWidth="1.2" className="circuit-trace circuit-trace-2" />
      </svg>
    </div>
  );
}
