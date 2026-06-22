import { useState, useRef, useEffect, Fragment } from "react";
import MonitorsPage from "./MonitorsPage";
import ScanPage from "./ScanPage";
import AuthModal from "./AuthModal";
import { supabase } from "./supabaseClient";

// DESIGN TOKENS / GLOBAL STYLES

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

.dw{
  --white:#FFFFFF;
  --ink:#0B0E14;
  --slate-950:#1FB6A6;
  --slate-900:#0F172A;
  --slate-700:#344054;
  --slate-600:#475467;
  --slate-500:#667085;
  --slate-400:#98A2B3;
  --slate-300:#D0D5DD;
  --slate-200:#E4E7EC;
  --slate-100:#F2F4F7;
  --slate-50:#F9FAFB;
  --indigo:#4F46E5;
  --indigo-600:#4338CA;
  --indigo-50:#EEF2FF;
  --indigo-100:#E0E7FF;
  --emerald:#10B981;
  --emerald-50:#ECFDF5;
  --emerald-600:#059669;
  --amber:#F59E0B;
  --amber-50:#FFFBEB;
  --red:#EF4444;
  --red-50:#FEF2F2;
  --font-sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  font-family:var(--font-sans);
  color:var(--slate-700);
  background:var(--white);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.5;
}
.dw *{box-sizing:border-box;}
.dw a{color:inherit;text-decoration:none;}
.dw button{font-family:inherit;}
.dw img,.dw svg{display:block;}

.container{max-width:1180px;margin:0 auto;padding:0 24px;}
@media(min-width:640px){.container{padding:0 40px;}}

.section{padding:clamp(64px,9vw,128px) 0;}
.bg-alt{background:#F0F2F7;}

.h1{font-size:clamp(36px,5.4vw,64px);font-weight:800;letter-spacing:-0.03em;line-height:1.04;color:var(--slate-950);margin:0;}
.h2{font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.025em;line-height:1.16;color:var(--slate-900);margin:0;}
.h3{font-size:19px;font-weight:700;letter-spacing:-0.01em;color:var(--slate-900);margin:0;}
.lede{font-size:clamp(16px,1.6vw,18px);color:var(--slate-500);line-height:1.7;margin:0;}
.section-head{max-width:620px;margin:0 auto 56px;text-align:center;}
.mono{font-family:var(--font-mono);}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid transparent;transition:border-color .25s ease;}
.nav.scrolled{border-color:var(--slate-200);}
.nav-inner{display:flex;align-items:center;height:68px;gap:28px;}
.nav-links{display:none;align-items:center;gap:28px;flex:1;}
@media(min-width:880px){.nav-links{display:flex;}}
.nav-link{font-size:14px;font-weight:500;color:var(--slate-600);transition:color .15s ease;background:none;border:none;cursor:pointer;padding:0;}
.nav-link:hover{color:var(--slate-900);}
.nav-actions{display:flex;align-items:center;gap:18px;margin-left:auto;}
.nav-signin{display:none;font-size:14px;font-weight:500;color:var(--slate-600);background:none;border:none;cursor:pointer;}
@media(min-width:640px){.nav-signin{display:inline-flex;}}
.nav-signin:hover{color:var(--slate-900);}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:14.5px;border-radius:10px;padding:13px 22px;cursor:pointer;border:1px solid transparent;transition:transform .2s ease,box-shadow .2s ease,background .2s ease,border-color .2s ease,color .2s ease;white-space:nowrap;}
.btn-sm{padding:9px 16px;font-size:13px;border-radius:9px;}
.btn-primary{background:var(--indigo);color:#fff;box-shadow:0 1px 2px rgba(16,24,40,.06);}
.btn-primary:hover{background:var(--indigo-600);transform:translateY(-2px);box-shadow:0 12px 24px rgba(79,70,229,.28);}
.btn-outline{background:#fff;color:var(--slate-900);border-color:var(--slate-200);}
.btn-outline:hover{border-color:var(--slate-900);transform:translateY(-2px);box-shadow:0 12px 24px rgba(15,23,42,.07);}
.btn-on-dark{background:#fff;color:var(--ink);}
.btn-on-dark:hover{background:var(--indigo-50);transform:translateY(-2px);box-shadow:0 12px 24px rgba(0,0,0,.25);}
.btn-outline-dark{background:transparent;color:#fff;border-color:rgba(255,255,255,.22);}
.btn-outline-dark:hover{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.06);transform:translateY(-2px);}
.btn:focus-visible,.nav-link:focus-visible,a:focus-visible,button:focus-visible{outline:2px solid var(--indigo);outline-offset:3px;}

/* layout grids */
.hero-pad{padding-top:clamp(120px,18vw,125px);padding-bottom:clamp(48px,8vw,90px);}
.hero-grid{display:grid;grid-template-columns:1fr;gap:64px;align-items:center;}
@media(min-width:980px){.hero-grid{grid-template-columns:1.08fr .92fr;gap:40px;}}
.grid-3{display:grid;grid-template-columns:1fr;gap:20px;}
@media(min-width:680px){.grid-3{grid-template-columns:repeat(2,1fr);}}
@media(min-width:1020px){.grid-3{grid-template-columns:repeat(3,1fr);}}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
@media(min-width:780px){.grid-4{grid-template-columns:repeat(4,1fr);}}
.footer-grid{display:grid;grid-template-columns:1fr;gap:40px;}
@media(min-width:760px){.footer-grid{grid-template-columns:2fr 1fr 1fr;}}

/* cards */
.card{background:#fff;border:1px solid var(--slate-200);border-radius:16px;box-shadow:0 2px 10px hsla(220, 43%, 11%, 0.06),0 0 0 1px rgba(16,24,40,.02);}
.feature-card{padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;}
.feature-card:hover{transform:translateY(-4px);border-color:var(--indigo-100);box-shadow:0 18px 36px hsla(222, 47%, 11%, 0.06);}
.icon-badge{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}

/* pills */
.pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:999px;}
.pill-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.pill-emerald{background:var(--emerald-50);color:var(--emerald-600);}
.pill-amber{background:var(--amber-50);color:#B45309;}

/* scroll reveal */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);}
.reveal.in-view{opacity:1;transform:translateY(0);}

/* hero texture */
.dot-field{position:absolute;inset:0;background-image:radial-gradient(var(--slate-200) 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 30%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 30%,transparent 80%);}
.glow{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(79,70,229,.16),transparent 70%);filter:blur(10px);pointer-events:none;}

/* hero dashboard mockup */
.hero-visual{position:relative;width:100%;max-width:480px;margin:0 auto;padding:30px 14px 64px;}
.dash-card{position:relative;z-index:2;background:rgba(255,255,255,.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(228,231,236,.9);border-radius:20px;padding:22px;box-shadow:0 24px 64px -12px #1fb6a7b7;} 
.float-card{position:absolute;z-index:3;background:#fff;border:1px solid var(--slate-200);border-radius:14px;box-shadow:0 16px 40px -8px #1fb6a75e;padding:14px 16px;}
.alert-card{top:-18px;right:-6px;width:208px;animation:float 6s ease-in-out infinite;}
.toast-card{bottom:-22px;left:-10px;width:212px;}
@keyframes float{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-9px) rotate(-2deg);}}
@media(max-width:600px){
  .hero-visual{display:flex;flex-direction:column;gap:14px;padding:8px 2px;max-width:380px;}
  .glow{display:none;}
  .float-card{position:static;width:100%;animation:none;box-shadow:0 8px 20px -6px #0f172a1f;}
}
.chart-line{stroke-dasharray:480;stroke-dashoffset:480;animation:draw 1.5s cubic-bezier(.4,0,.2,1) forwards .5s;}
@keyframes draw{to{stroke-dashoffset:0;}}
.ring-progress{transform:rotate(-90deg);transform-origin:50% 50%;animation:ringfill 1.3s cubic-bezier(.4,0,.2,1) forwards .7s;}
@keyframes ringfill{to{stroke-dashoffset:var(--ring-offset);}}

/* how it works */
.step-row{display:flex;flex-direction:column;gap:0;}
@media(min-width:900px){.step-row{flex-direction:row;align-items:stretch;}}
.step-connector{display:flex;align-items:center;justify-content:center;color:var(--slate-300);flex:0 0 auto;padding:14px 0;}
.step-connector svg{transform:rotate(90deg);}
@media(min-width:900px){.step-connector{padding:0 6px;}.step-connector svg{transform:none;}}
.accent-top{border-top-width:3px;border-top-style:solid;border-top-left-radius:16px;border-top-right-radius:16px;}

/* tech */
.tech-col-title{font-family:var(--font-mono);font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-400);margin-bottom:14px;}

/* hero metrics */
.metrics-row{display:flex;flex-wrap:wrap;gap:32px;margin-top:48px;}
.metric-num{font-size:26px;font-weight:800;color:var(--slate-900);letter-spacing:-0.02em;}
.metric-label{font-size:13px;color:var(--slate-500);margin-top:4px;max-width:140px;}

/* final cta */
.cta-section{padding-bottom:clamp(80px,11vw,140px);}
.cta-panel{background:var(--ink);border-radius:28px;padding:clamp(48px,7vw,80px) clamp(24px,6vw,56px);text-align:center;box-shadow:0 32px 64px -24px rgba(11,14,20,.35);}

@media (prefers-reduced-motion: reduce){
  .reveal{transition:none!important;opacity:1!important;transform:none!important;}
  .alert-card{animation:none!important;}
  .chart-line,.ring-progress{animation:none!important;stroke-dashoffset:0!important;}
}
`;

// ICON SYSTEM (dependency-free, line-style)

function makeIcon(children, opts = {}) {
  const strokeWidth = opts.strokeWidth || 1.6;
  const viewBox = opts.viewBox || "0 0 24 24";
  const filled = !!opts.filled;
  return function IconCmp({ size = 20, className = "", style = {} }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
      >
        {children}
      </svg>
    );
  };
}

const Icon = {
  plug: makeIcon(
    <>
      <path d="M9 2v4M15 2v4M7.5 8h9a1.5 1.5 0 0 1 1.5 1.5v2A5.5 5.5 0 0 1 12.5 17h-1A5.5 5.5 0 0 1 6 11.5v-2A1.5 1.5 0 0 1 7.5 8Z" />
      <path d="M12 17v3M9 22h6" />
    </>,
  ),
  activity: makeIcon(
    <polyline points="2 14 7.5 14 10 7 14 19 16.5 14 22 14" />,
  ),
  Mail: makeIcon(
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3 6.5 9 6.5 9-6.5" />
    </>,
  ),
  cpu: makeIcon(
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 10h4v4h-4z" />
    </>,
  ),
  clock: makeIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>,
  ),
  trendDown: makeIcon(
    <>
      <polyline points="3 6 10 13 14 9 21 17" />
      <polyline points="21 10 21 17 14 17" />
    </>,
  ),
  AlertTriangle: makeIcon(
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17.2" r="0.4" fill="currentColor" stroke="none" />
    </>,
  ),
  shield: makeIcon(
    <path d="M12 3.5 19.5 6.3v5.6c0 4.7-3.1 7.6-7.5 9-4.4-1.4-7.5-4.3-7.5-9V6.3L12 3.5Z" />,
  ),
  key: makeIcon(
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="M11.2 11.8 19 4M16.2 7l2.8 2.8M19 4l2.5 2.5" />
    </>,
  ),
  lock: makeIcon(
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </>,
  ),
  userCheck: makeIcon(
    <>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <path d="m15.5 12.5 2 2 3.5-3.5" />
    </>,
  ),
  ArrowRight: makeIcon(<path d="M4 12h16M13 5l7 7-7 7" />, {
    strokeWidth: 1.8,
  }),
  Github: makeIcon(
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
    { filled: true },
  ),
  fileSheet: makeIcon(
    <>
      <path d="M6 2.5h8L19 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V2.5Z" />
      <path d="M14 2.5V8h5" />
      <path d="M9 13h6M9 16.5h6M9 9.5h2" />
    </>,
  ),
  barChart: makeIcon(<path d="M4 21V10M11 21V3M18 21v-7" />),
  sliders: makeIcon(
    <>
      <path d="M4 6h9M17 6h3M4 18h3M11 18h9" />
      <circle cx="14.5" cy="6" r="2.2" />
      <circle cx="7.5" cy="18" r="2.2" />
    </>,
  ),
};

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#0B0E14" />
      <path
        d="M7 20.5 12 13l4 5 4.5-8L25 17"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="18" r="2" fill="#4F46E5" />
    </svg>
  );
}

// SMALL UTILITIES

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(node);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function IconBadge({ icon: Ico, tone = "indigo" }) {
  const tones = {
    indigo: { bg: "var(--indigo-50)", color: "var(--indigo)" },
    emerald: { bg: "var(--emerald-50)", color: "var(--emerald-600)" },
    amber: { bg: "var(--amber-50)", color: "#B45309" },
    slate: { bg: "var(--slate-100)", color: "var(--slate-600)" },
  };
  const t = tones[tone] || tones.indigo;
  return (
    <div className="icon-badge" style={{ background: t.bg, color: t.color }}>
      <Ico size={19} />
    </div>
  );
}

function SectionHead({ title, desc, light }) {
  return (
    <div className="section-head">
      <h2 className="h2" style={light ? { color: "#fff" } : undefined}>
        {title}
      </h2>
      {desc && (
        <p
          className="lede"
          style={{
            marginTop: 14,
            ...(light ? { color: "rgba(255,255,255,.62)" } : {}),
          }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

function FeatureCard({ icon, tone, title, desc, delay = 0 }) {
  return (
    <Reveal delay={delay} style={{ height: "100%" }}>
      <div className="card feature-card" style={{ height: "100%" }}>
        <IconBadge icon={icon} tone={tone} />
        <div className="h3" style={{ marginBottom: 8 }}>
          {title}
        </div>
        <p
          style={{
            fontSize: 14.5,
            color: "var(--slate-500)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </Reveal>
  );
}

function StatusPill({ tone, children }) {
  return (
    <span className={`pill pill-${tone}`}>
      <span className="pill-dot" style={{ background: "currentColor" }} />
      {children}
    </span>
  );
}

// NAV

function Nav({ onStart, refs }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span
            style={{
              fontWeight: 800,
              fontSize: 16.5,
              color: "var(--slate-900)",
              letterSpacing: "-0.01em",
            }}
          >
            DriftWatch
          </span>
        </div>

        <div className="nav-links">
          <button className="nav-link" onClick={() => goTo(refs.how)}>
            How it works
          </button>
          <button className="nav-link" onClick={() => goTo(refs.features)}>
            Features
          </button>
          <button className="nav-link" onClick={() => goTo(refs.detection)}>
            Detection engine
          </button>
          <button className="nav-link" onClick={() => goTo(refs.security)}>
            Security
          </button>
        </div>

        <div className="nav-actions">
          <button className="nav-signin" onClick={() => onStart("monitor")}>
            Sign in
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onStart("scan")}
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

// HERO DASHBOARD MOCKUP

function HeroVisual() {
  const points = [
    [10, 72],
    [46, 60],
    [82, 66],
    [118, 54],
    [154, 62],
    [190, 56],
    [226, 118],
    [262, 104],
    [300, 98],
  ];
  const linePath = smoothPath(points);
  const areaPath = `${linePath} L 300 134 L 10 134 Z`;
  const anomaly = points[6];
  const r = 28;
  const c = 2 * Math.PI * r;
  const score = 86;
  const offset = c - (score / 100) * c;

  return (
    <div className="hero-visual">
      <div
        className="glow"
        style={{ width: 360, height: 360, top: -40, right: -60 }}
      />

      <div className="dash-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14.5,
                color: "var(--slate-900)",
              }}
            >
              Daily Sales Monitor
            </div>
            <div
              className="mono"
              style={{
                fontSize: 11.5,
                color: "var(--slate-400)",
                marginTop: 3,
              }}
            >
              Google Sheet · every 24h
            </div>
          </div>
          <StatusPill tone="emerald">Active</StatusPill>
        </div>

        <svg
          viewBox="0 0 310 134"
          style={{ width: "100%", height: "auto", marginTop: 16 }}
        >
          <defs>
            <linearGradient id="dwAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="134"
            x2="310"
            y2="134"
            stroke="var(--slate-200)"
            strokeWidth="1"
          />
          <path d={areaPath} fill="url(#dwAreaFill)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2.25"
            strokeLinecap="round"
            className="chart-line"
          />
          <line
            x1={anomaly[0]}
            y1={anomaly[1]}
            x2={anomaly[0]}
            y2="134"
            stroke="#EF4444"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.55"
          />
          <circle
            cx={anomaly[0]}
            cy={anomaly[1]}
            r="4.5"
            fill="#fff"
            stroke="#EF4444"
            strokeWidth="2.25"
          />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--slate-400)" }}
          >
            Mon
          </span>
          <span
            className="mono"
            style={{ fontSize: 10.5, color: "var(--slate-400)" }}
          >
            Sun
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: 14,
            marginTop: 18,
            paddingTop: 18,
            borderTop: "1px solid var(--slate-100)",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: 60, height: 60 }}>
            <svg width="60" height="60" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="var(--slate-100)"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c}
                className="ring-progress"
                style={{ "--ring-offset": offset }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 13.5,
                  color: "var(--slate-900)",
                }}
              >
                86
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
              Health score
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--slate-700)",
                marginTop: 2,
              }}
            >
              1 metric flagged
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
              Rows scanned
            </div>
            <div
              className="mono"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--slate-900)",
                marginTop: 2,
              }}
            >
              12,480
            </div>
          </div>
        </div>
      </div>

      <div className="float-card alert-card">
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--amber-50)",
              color: "#B45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.AlertTriangle size={15} />
          </div>
          <div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--slate-900)",
              }}
            >
              Anomaly detected
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--slate-500)",
                marginTop: 2,
                lineHeight: 1.5,
              }}
            >
              daily_sales is 83% below average
            </div>
          </div>
        </div>
      </div>

      <div className="float-card toast-card">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--indigo-50)",
              color: "var(--indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.Mail size={14} />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--slate-900)",
              }}
            >
              Alert email sent
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: "var(--slate-400)",
                marginTop: 1,
              }}
            >
              09:02 AM · ops@company.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// LANDING PAGE

function LandingPage({ onStart }) {
  const howRef = useRef(null);
  const featuresRef = useRef(null);
  const detectionRef = useRef(null);
  const securityRef = useRef(null);
  const refs = {
    how: howRef,
    features: featuresRef,
    detection: detectionRef,
    security: securityRef,
  };

  const problems = [
    {
      icon: Icon.activity,
      title: "Nobody is watching",
      desc: "A sync fails, a column goes blank, a number triples overnight — and nothing tells you until someone notices the report looks wrong.",
    },
    {
      icon: Icon.clock,
      title: "Caught too late",
      desc: "By the time a stakeholder flags a broken chart in a meeting, the bad data has already shaped a decision.",
    },
    {
      icon: Icon.sliders,
      title: "Manual checks don't scale",
      desc: "Eyeballing every sheet every morning works for a while — until it doesn't, and the checks quietly stop happening.",
    },
  ];

  const steps = [
    {
      n: "01",
      icon: Icon.plug,
      tone: "indigo",
      title: "Connect your source",
      desc: "Link a Google Sheet or upload a CSV. No code, no integration work, no waiting on engineering.",
    },
    {
      n: "02",
      icon: Icon.activity,
      tone: "emerald",
      title: "DriftWatch watches continuously",
      desc: "On your schedule, every dataset is checked against its own history for unusual trends and outliers.",
    },
    {
      n: "03",
      icon: Icon.Mail,
      tone: "indigo",
      title: "Get a clear alert",
      desc: "When something looks off, you get an email that explains what changed, why it matters, and what to check first.",
    },
  ];

  const features = [
    {
      icon: Icon.activity,
      tone: "indigo",
      title: "Automated monitoring",
      desc: "Schedule checks from hourly to weekly. DriftWatch runs in the background so you don't have to remember to look.",
    },
    {
      icon: Icon.fileSheet,
      tone: "emerald",
      title: "One-time scans",
      desc: "Upload a CSV and get a full anomaly report in seconds. No login, nothing stored.",
    },
    {
      icon: Icon.barChart,
      tone: "indigo",
      title: "Run history",
      desc: "Every check is logged on a timeline, so you can spot a pattern, not just a single incident.",
    },
    {
      icon: Icon.cpu,
      tone: "amber",
      title: "AI-generated explanations",
      desc: "Every alert comes with a clear, written explanation of what changed and why it likely happened.",
    },
    {
      icon: Icon.Mail,
      tone: "emerald",
      title: "Smart email alerts",
      desc: "You're only emailed when something needs attention. Normal days stay quiet.",
    },
    {
      icon: Icon.sliders,
      tone: "slate",
      title: "Full control, anytime",
      desc: "Pause, resume, or delete any monitor in a click. Nothing runs without your say.",
    },
  ];

  const detectors = [
    {
      icon: Icon.trendDown,
      tone: "indigo",
      tag: "Statistical drift · z-score baseline",
      title: "Numeric trend detection",
      desc: "Flags when a number — sales, orders, signups — moves far outside its normal range, using a baseline built from that column's own history.",
    },
    {
      icon: Icon.barChart,
      tone: "emerald",
      tag: "Distribution shift · chi-square test",
      title: "Category shift detection",
      desc: "Flags when the mix of values in a column changes shape, like a payment method or status field suddenly skewing toward one value.",
    },
    {
      icon: Icon.cpu,
      tone: "amber",
      tag: "Multivariate outliers · isolation forest",
      title: "Row-level anomaly detection",
      desc: "Flags rows that look suspicious across several columns at once, even when each individual column looks normal on its own.",
    },
  ];

  const securityItems = [
    {
      icon: Icon.lock,
      tag: "PostgreSQL Row-Level Security",
      title: "Your data never crosses accounts",
      desc: "Isolation is enforced inside the database itself, not just in app code — so there's no path for one user to see another's monitors.",
    },
    {
      icon: Icon.key,
      tag: "JWT-based authentication",
      title: "Every request is verified",
      desc: "Nothing reaches your data without proving it's really you, on every single call.",
    },
    {
      icon: Icon.userCheck,
      tag: "Google OAuth",
      title: "Sign in your way",
      desc: "Continue with Google or email. No separate password for us to store, and nothing for you to lose.",
    },
    {
      icon: Icon.shield,
      tag: "Stateless processing",
      title: "Scans leave nothing behind",
      desc: "One-time scans run entirely in memory. Nothing is written to a database, and nothing is kept after you close the tab.",
    },
  ];

  return (
    <div className="dw">
      <style>{GLOBAL_CSS}</style>

      <Nav onStart={onStart} refs={refs} />

      {/* ── HERO ── */}
      <section
        className="hero-pad"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div className="dot-field" />
        <div className="container hero-grid" style={{ position: "relative" }}>
          <div>
            <h1 className="h1">
              Monitor data quality before revenue is impacted
            </h1>
            <p className="lede" style={{ marginTop: 20, maxWidth: 480 }}>
              AI-powered anomaly detection for Google Sheets and CSV data.
              Detect unusual trends, data drift, and operational issues before
              they become business problems.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 32,
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => onStart("monitor")}
              >
                Start monitoring <Icon.ArrowRight size={16} />
              </button>
              <button
                className="btn btn-outline"
                onClick={() => onStart("scan")}
              >
                Run a free scan
              </button>
            </div>
            {/* <p
              style={{
                fontSize: 12.5,
                color: "var(--slate-400)",
                marginTop: 14,
              }}
            >
              No credit card required · one-time scans need no login
            </p> */}

            <div className="metrics-row">
              {[
                { n: "2 min", l: "To your first live monitor" },
                { n: "24/7", l: "Continuous monitoring" },
                { n: "₹0", l: "To get started" },
              ].map((m) => (
                <div key={m.l}>
                  <div className="metric-num">{m.n}</div>
                  <div className="metric-label">{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <section className="section bg-alt">
        <div className="container">
          <Reveal>
            <SectionHead
              title="Your data already broke. You just don't know it yet."
              desc="Spreadsheets and CSVs are the backbone of daily decisions — and the easiest place for something to quietly go wrong."
            />
          </Reveal>
          <div className="grid-3">
            {problems.map((p, i) => (
              <FeatureCard
                key={p.title}
                icon={p.icon}
                tone="slate"
                title={p.title}
                desc={p.desc}
                delay={i * 90}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" ref={howRef} style={{ scrollMarginTop: 84 }}>
        <div className="container">
          <Reveal>
            <SectionHead
              title="Set up once. DriftWatch does the rest."
              desc="Three steps between you and never finding out about a data problem the hard way."
            />
          </Reveal>
          <div className="step-row">
            {steps.map((s, i) => {
              const accent =
                s.tone === "emerald" ? "var(--emerald)" : "var(--indigo)";
              return (
                <Fragment key={s.n}>
                  <Reveal delay={i * 110} style={{ flex: 1 }}>
                    <div
                      className="card accent-top"
                      style={{
                        height: "100%",
                        padding: "30px 26px",
                        borderTopColor: accent,
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: 13,
                          color: accent,
                          fontWeight: 700,
                          marginBottom: 14,
                        }}
                      >
                        {s.n}
                      </div>
                      <IconBadge icon={s.icon} tone={s.tone} />
                      <div className="h3" style={{ marginBottom: 8 }}>
                        {s.title}
                      </div>
                      <p
                        style={{
                          fontSize: 14.5,
                          color: "var(--slate-500)",
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {s.desc}
                      </p>
                    </div>
                  </Reveal>
                  {i < steps.length - 1 && (
                    <div className="step-connector">
                      <Icon.ArrowRight size={18} />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section
        className="section bg-alt"
        ref={featuresRef}
        style={{ scrollMarginTop: 84 }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Everything you need, nothing you have to babysit"
              desc="DriftWatch is built to run quietly in the background and only ask for your attention when it matters."
            />
          </Reveal>
          <div className="grid-3">
            {features.map((f, i) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                tone={f.tone}
                title={f.title}
                desc={f.desc}
                delay={(i % 3) * 90}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── DETECTION ENGINE ── */}
      <section
        className="section"
        ref={detectionRef}
        style={{ scrollMarginTop: 84 }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Three ways of looking at the same data"
              desc="Most tools watch for one type of problem. DriftWatch checks every dataset from three angles at once, then combines them into a single, clear verdict."
            />
          </Reveal>
          <div className="grid-3">
            {detectors.map((d, i) => (
              <Reveal key={d.title} delay={i * 100} style={{ height: "100%" }}>
                <div className="card feature-card" style={{ height: "100%" }}>
                  <IconBadge icon={d.icon} tone={d.tone} />
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--slate-400)",
                      marginBottom: 8,
                    }}
                  >
                    {d.tag}
                  </div>
                  <div className="h3" style={{ marginBottom: 8 }}>
                    {d.title}
                  </div>
                  <p
                    style={{
                      fontSize: 14.5,
                      color: "var(--slate-500)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {d.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section
        className="section bg-alt"
        ref={securityRef}
        style={{ scrollMarginTop: 84 }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Your data is yours. Always."
              desc="Every account is fully isolated from every other — enforced independently at the app layer and the database layer, so there's no single point of failure."
            />
          </Reveal>
          <div className="grid-4">
            {securityItems.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} style={{ height: "100%" }}>
                <div className="card feature-card" style={{ height: "100%" }}>
                  <IconBadge icon={s.icon} tone="indigo" />
                  <div
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: "var(--slate-400)",
                      marginBottom: 8,
                    }}
                  >
                    {s.tag}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: "var(--slate-900)",
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--slate-500)",
                      lineHeight: 1.65,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <h2 className="h2" style={{ color: "#fff" }}>
                Stop finding out about data problems too late
              </h2>
              <p
                className="lede"
                style={{
                  color: "rgba(255,255,255,.62)",
                  maxWidth: 480,
                  margin: "16px auto 0",
                }}
              >
                Free to start. No credit card. Set up your first monitor in
                minutes.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 36,
                }}
              >
                <button
                  className="btn btn-on-dark"
                  onClick={() => onStart("monitor")}
                >
                  Start monitoring <Icon.ArrowRight size={16} />
                </button>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => onStart("scan")}
                >
                  Run a free scan
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--ink)", padding: "64px 0 32px" }}>
        <div className="container">
          <div className="footer-grid" style={{ marginBottom: 40 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <Logo />
                <span style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>
                  DriftWatch
                </span>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#8a93a6",
                  lineHeight: 1.7,
                  maxWidth: 280,
                  marginBottom: 18,
                }}
              >
                Catch anomalies in your data before they become business
                problems.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <a
                  href="https://github.com/user1-prajwal/driftwatch"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-dark"
                >
                  <Icon.Github size={14} /> GitHub
                </a>
                <a
                  href="https://driftwatch-backend.onrender.com/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-dark"
                >
                  API docs<Icon.ArrowRight size={13} />
                </a>
              </div>
            </div>

            <div>
              <div className="tech-col-title" style={{ color: "#8a93a6" }}>
                Features
              </div>
              {[
                "Automated monitoring",
                "One-time scans",
                "Run history",
                "AI-generated explanations",
                "Smart email alerts",
                "Full control, anytime",
              ].map((f) => (
                <div
                  key={f}
                  style={{ fontSize: 13, color: "#8a93a6", marginBottom: 9 }}
                >
                  {f}
                </div>
              ))}
            </div>

            <div>
              <div className="tech-col-title" style={{ color: "#8a93a6" }}>
                Tech stack
              </div>
              {[
                "Python + FastAPI",
                "React",
                "scikit-learn",
                "Google Gemini AI",
                "Supabase + RLS",
                "APScheduler",
                "Brevo email API",
                "Vercel + Render",
              ].map((t) => (
                <div
                  key={t}
                  style={{ fontSize: 13, color: "#8a93a6", marginBottom: 9 }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.08)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#5d6577" }}>
              Built by <strong style={{ color: "#8a93a6" }}>Prajwal</strong> —
              CSE Student, East West Institute of Technology, Bengaluru
            </span>
            <span style={{ fontSize: 13, color: "#5d6577" }}>
              DriftWatch — AI-powered data quality monitor
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ROOT APP

export default function App() {
  const [page, setPage] = useState("landing");
  const [session, setSession] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleStart = (p) => {
    if (p === "monitor") {
      if (session) {
        setPage("monitor");
      } else {
        setShowAuthModal(true);
      }
    } else {
      setPage(p);
    }
  };

  if (page === "monitor") {
    return (
      <MonitorsPage
        session={session}
        onBack={() => setPage("landing")}
        onLogout={async () => {
          await supabase.auth.signOut();
          setSession(null);
          setPage("landing");
        }}
      />
    );
  }

  if (page === "scan") {
    return <ScanPage onBack={() => setPage("landing")} />;
  }

  return (
    <>
      <LandingPage onStart={handleStart} />
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(session) => {
            setSession(session);
            setShowAuthModal(false);
            setPage("monitor");
          }}
        />
      )}
    </>
  );
}
