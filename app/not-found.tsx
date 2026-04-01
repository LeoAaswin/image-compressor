import Link from "next/link";

export default function NotFound() {
  const tools = [
    {
      name: "Compress",
      href: "/compress",
      description: "Reduce file size",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      name: "Convert",
      href: "/convert",
      description: "Change formats",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      ),
    },
    {
      name: "Edit",
      href: "/edit",
      description: "Crop & adjust",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
    {
      name: "Remove BG",
      href: "/remove-background",
      description: "Erase backgrounds",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      ),
    },
    {
      name: "Resize",
      href: "/resize",
      description: "Change dimensions",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      ),
    },
    {
      name: "Metadata",
      href: "/metadata",
      description: "Strip EXIF data",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        /* ── Theme-adaptive design tokens ── */
        :root {
          --nf-dot:          rgba(0,   0,   0,   0.07);
          --nf-scan:         rgba(0,   0,   0,   0.05);
          --nf-pixel-neutral:rgba(0,   0,   0,   0.12);
          --nf-text-glow:    rgba(239, 68,  68,  0.08);
        }
        .dark {
          --nf-dot:          rgba(255, 255, 255, 0.055);
          --nf-scan:         rgba(255, 255, 255, 0.06);
          --nf-pixel-neutral:rgba(255, 255, 255, 0.15);
          --nf-text-glow:    rgba(239, 68,  68,  0.15);
        }

        /* ── Glitch effect — chromatic channel split ── */
        .glitch-text {
          position: relative;
          display: inline-block;
          color: hsl(var(--foreground));
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .glitch-text::before {
          color: hsl(0 84% 60%);
          animation: glitch-r 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
        }
        .glitch-text::after {
          color: hsl(221 83% 53%);
          animation: glitch-b 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          animation-delay: 0.15s;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
        }
        @keyframes glitch-r {
          0%, 82%, 100% { transform: none; opacity: 1; }
          84% { transform: translate(-6px, -2px) skewX(-3deg); opacity: 0.9; }
          86% { transform: translate(6px, 2px) skewX(3deg); opacity: 0.8; }
          88% { transform: translate(-3px, 0) skewX(-1deg); opacity: 1; }
          90% { transform: none; }
          92% { transform: translate(5px, -1px); opacity: 0.85; }
          94% { transform: none; opacity: 1; }
        }
        @keyframes glitch-b {
          0%, 83%, 100% { transform: none; opacity: 1; }
          85% { transform: translate(6px, 2px) skewX(3deg); opacity: 0.9; }
          87% { transform: translate(-6px, -2px) skewX(-3deg); opacity: 0.8; }
          89% { transform: translate(3px, 0) skewX(1deg); opacity: 1; }
          91% { transform: none; }
          93% { transform: translate(-5px, 1px); opacity: 0.85; }
          95% { transform: none; opacity: 1; }
        }

        /* ── Scan line sweep ── */
        .nf-scan-line {
          position: absolute;
          inset-inline: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--nf-scan), transparent);
          animation: nf-scan 6s linear infinite;
          pointer-events: none;
        }
        @keyframes nf-scan {
          from { top: -2px; }
          to   { top: 100%; }
        }

        /* ── Floating pixel squares ── */
        .nf-pixel {
          position: absolute;
          border-radius: 2px;
          animation: nf-float var(--dur, 8s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          opacity: var(--op, 0.15);
        }
        @keyframes nf-float {
          0%, 100% { transform: translateY(0) rotate(0deg);    opacity: var(--op, 0.15); }
          50%       { transform: translateY(-22px) rotate(180deg); opacity: calc(var(--op, 0.15) * 1.5); }
        }

        /* ── Staggered reveal ── */
        .nf-reveal {
          animation: nf-reveal-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .nf-reveal:nth-child(1) { animation-delay: 0.05s; }
        .nf-reveal:nth-child(2) { animation-delay: 0.13s; }
        .nf-reveal:nth-child(3) { animation-delay: 0.21s; }
        .nf-reveal:nth-child(4) { animation-delay: 0.29s; }
        .nf-reveal:nth-child(5) { animation-delay: 0.37s; }
        .nf-reveal:nth-child(6) { animation-delay: 0.45s; }
        @keyframes nf-reveal-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Tool card hover ── */
        .nf-tool-card {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.2s ease,
                      border-color 0.2s ease,
                      background-color 0.2s ease;
        }
        .nf-tool-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px hsl(var(--shadow, 0 0% 0%) / 0.12);
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .glitch-text::before,
          .glitch-text::after { display: none; }
          .nf-scan-line       { display: none; }
          .nf-pixel           { animation: none; }
          .nf-reveal          { animation: none; opacity: 1; transform: none; }
          .nf-tool-card:hover { transform: none; }
        }
      `}</style>

      <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background px-4 py-16">
        {/* Dot-grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--nf-dot) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Scan line */}
        <div className="nf-scan-line" />

        {/* Ambient radial glow — theme-adaptive opacity */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: "min(700px, 90vw)",
            height: "min(700px, 90vw)",
            background:
              "radial-gradient(circle, hsl(0 84% 60% / 0.06) 0%, transparent 70%)",
          }}
        />

        {/* Floating pixels */}
        {(
          [
            {
              size: 6,
              top: "12%",
              left: "8%",
              color: "hsl(0 84% 60% / 0.35)",
              dur: "7s",
              delay: "0s",
              op: "0.35",
            },
            {
              size: 10,
              top: "22%",
              left: "88%",
              color: "hsl(221 83% 53% / 0.3)",
              dur: "9s",
              delay: "1.5s",
              op: "0.3",
            },
            {
              size: 4,
              top: "68%",
              left: "6%",
              color: "var(--nf-pixel-neutral)",
              dur: "11s",
              delay: "3s",
              op: "0.2",
            },
            {
              size: 8,
              top: "78%",
              left: "91%",
              color: "hsl(0 84% 60% / 0.22)",
              dur: "8s",
              delay: "0.8s",
              op: "0.22",
            },
            {
              size: 5,
              top: "45%",
              left: "4%",
              color: "hsl(221 83% 53% / 0.25)",
              dur: "6s",
              delay: "2.2s",
              op: "0.25",
            },
            {
              size: 7,
              top: "55%",
              left: "94%",
              color: "var(--nf-pixel-neutral)",
              dur: "10s",
              delay: "4s",
              op: "0.15",
            },
            {
              size: 3,
              top: "88%",
              left: "20%",
              color: "hsl(0 84% 60% / 0.28)",
              dur: "8.5s",
              delay: "1s",
              op: "0.28",
            },
            {
              size: 9,
              top: "10%",
              left: "75%",
              color: "var(--nf-pixel-neutral)",
              dur: "12s",
              delay: "2.8s",
              op: "0.1",
            },
          ] as const
        ).map((p, i) => (
          <div
            key={i}
            className="nf-pixel"
            style={
              {
                width: p.size,
                height: p.size,
                top: p.top,
                left: p.left,
                backgroundColor: p.color,
                "--dur": p.dur,
                "--delay": p.delay,
                "--op": p.op,
              } as React.CSSProperties
            }
          />
        ))}

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full gap-6">
          {/* Badge */}
          <div className="nf-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-mono tracking-widest uppercase">
              ERROR_404 · PAGE_NOT_FOUND
            </span>
          </div>

          {/* Glitch 404 */}
          <div className="nf-reveal">
            <h1
              className="glitch-text font-black leading-none select-none"
              data-text="404"
              style={{
                fontSize: "clamp(7rem, 25vw, 14rem)",
                letterSpacing: "-0.04em",
                textShadow: "0 0 80px var(--nf-text-glow)",
              }}
            >
              404
            </h1>
          </div>

          {/* Icon + headline */}
          <div className="nf-reveal flex flex-col items-center gap-3">
            {/* Corrupted image icon */}
            <div className="relative w-16 h-16 rounded-xl border border-border bg-muted/50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-red-500/70 dark:text-red-400/80"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 15l5-5 4 4 3-3 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                  fill="currentColor"
                  opacity="0.6"
                />
                <line
                  x1="14"
                  y1="3"
                  x2="10"
                  y2="21"
                  stroke="hsl(0 84% 60%)"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
                <line
                  x1="3"
                  y1="11"
                  x2="21"
                  y2="14"
                  stroke="hsl(221 83% 53%)"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />
              </svg>
              <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-red-500/50 rounded-tl-xl" />
              <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-blue-500/50 rounded-br-xl" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground/90 tracking-tight">
              This pixel got lost
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          {/* CTAs */}
          <div className="nf-reveal flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 w-full sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go Home
            </Link>
            <Link
              href="/compress"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted/50 text-foreground/70 hover:text-foreground hover:bg-muted hover:border-border/80 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Start Compressing
            </Link>
          </div>

          {/* Divider */}
          <div className="nf-reveal w-full flex items-center gap-4">
            <span className="flex-1 h-px bg-border/60" />
            <span className="text-muted-foreground/60 text-xs font-mono tracking-widest">
              OR JUMP TO A TOOL
            </span>
            <span className="flex-1 h-px bg-border/60" />
          </div>

          {/* Tool grid */}
          <div className="nf-reveal grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="nf-tool-card group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 bg-muted/30 hover:border-border hover:bg-muted/70"
              >
                <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-200 text-muted-foreground group-hover:text-primary">
                  {tool.icon}
                </div>
                <div className="text-center">
                  <p className="text-foreground/70 text-xs font-medium group-hover:text-foreground transition-colors">
                    {tool.name}
                  </p>
                  <p className="text-muted-foreground/70 text-[10px] leading-tight hidden sm:block">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer note */}
          <p className="nf-reveal text-muted-foreground/50 text-xs font-mono">
            <span className="text-primary/70">opti</span>
            <span className="text-foreground/40">pix</span> · all tools run
            locally · your files never leave your device
          </p>
        </div>
      </main>
    </>
  );
}
