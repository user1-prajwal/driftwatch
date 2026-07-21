import { useState, useRef, useEffect } from "react";
import MonitorsPage from "./MonitorsPage";
import ScanPage from "./ScanPage";
import AuthModal from "./AuthModal";
import { supabase } from "./supabaseClient";
import axios from "axios";

// const SCAN_API = "http://localhost:8000";
const SCAN_API = "https://driftwatch-backend.onrender.com";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

.dw{
  --paper:#F6F3EC;
  --paper-dim:#EFEBE0;
  --paper-line:#DDD7C7;
  --ink:#15181D;
  --ink-soft:#2B2E33;
  --body:#4B4C46;
  --body-dim:#83817A;
  --body-faint:#6E6A62;
  --card:#FCFBF8;
  --brick:#B5402F;
  --brick-dim:#8F3225;
  --brick-tint:#F4E3DE;
  --pine:#33604A;
  --pine-tint:#E1EBE2;
  --ochre:#AD7C2A;
  --ochre-tint:#F1E6D2;
  --ink-invert:#F6F3EC;
  --font-display:'Fraunces',Georgia,serif;
  --font-sans:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  font-family:var(--font-sans);
  color:var(--body);
  background:var(--paper);
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  line-height:1.5;
}
.dw *{box-sizing:border-box;}
.dw a{color:inherit;text-decoration:none;}
.dw button{font-family:inherit;}
.dw img,.dw svg{display:block;}
.dw ::selection{background:var(--ink);color:var(--paper);}

.container{max-width:1180px;margin:0 auto;padding:0 24px;}
@media(min-width:640px){.container{padding:0 40px;}}
.container-narrow{max-width:860px;margin:0 auto;padding:0 24px;}
@media(min-width:640px){.container-narrow{padding:0 40px;}}

.section{padding:clamp(56px,8vw,112px) 0;}
.rule{border:none;border-top:1px solid var(--paper-line);margin:0;}
.mono{font-family:var(--font-mono);}

.eyebrow{font-family:var(--font-mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--brick);display:flex;align-items:center;gap:9px;}
.eyebrow::before{content:'';width:15px;height:1px;background:var(--brick);display:inline-block;}

.h1{font-family:var(--font-display);font-size:clamp(34px,4.4vw,56px);font-weight:600;letter-spacing:-0.015em;line-height:1.08;color:var(--ink);margin:0;}
.h2{font-family:var(--font-display);font-size:clamp(28px,3.4vw,42px);font-weight:600;letter-spacing:-0.01em;line-height:1.14;color:var(--ink);margin:0;}
.h2-light{font-family:var(--font-display);font-size:clamp(28px,3.4vw,42px);font-weight:600;letter-spacing:-0.01em;line-height:1.14;color:var(--ink-invert);margin:0;}
.h3{font-family:var(--font-display);font-size:20px;font-weight:600;letter-spacing:-0.005em;color:var(--ink);margin:0;}
.lede{font-size:clamp(16px,1.5vw,18.5px);color:var(--body-dim);line-height:1.7;margin:0;}
.lede-light{font-size:clamp(16px,1.5vw,18.5px);color:rgba(246,243,236,.62);line-height:1.7;margin:0;}
.section-head{max-width:640px;margin:0 0 48px;}
.section-head.center{margin-left:auto;margin-right:auto;text-align:center;}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(246,243,236,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid transparent;transition:border-color .2s ease;}
.nav.scrolled{border-color:var(--paper-line);}
.nav-inner{display:flex;align-items:center;height:64px;gap:28px;}
.nav-links{display:none;align-items:center;gap:26px;flex:1;}
@media(min-width:880px){.nav-links{display:flex;}}
.nav-link{font-size:13.5px;font-weight:600;color:var(--body);transition:color .15s ease;background:none;border:none;cursor:pointer;padding:0;}
.nav-link:hover{color:var(--ink);}
.nav-actions{display:flex;align-items:center;gap:18px;margin-left:auto;}

/* buttons — flat, hairline, no lift/bounce */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:14px;border-radius:3px;padding:12px 20px;cursor:pointer;border:1px solid transparent;transition:background .15s ease,border-color .15s ease,color .15s ease;white-space:nowrap;}
.btn-sm{padding:8px 15px;font-size:13px;}
.btn-primary{background:var(--ink);color:var(--paper);border-color:var(--ink);}
.btn-primary:hover{background:var(--brick);border-color:var(--brick);}
.btn-outline{background:transparent;color:var(--ink);border-color:var(--ink);}
.btn-outline:hover{background:var(--ink);color:var(--paper);}
.btn-on-dark{background:var(--paper);color:var(--ink);border-color:var(--paper);}
.btn-on-dark:hover{background:var(--brick);color:var(--paper);border-color:var(--brick);}
.btn-outline-dark{background:transparent;color:var(--paper);border-color:rgba(246,243,236,.32);}
.btn-outline-dark:hover{border-color:var(--paper);}
.btn:focus-visible,.nav-link:focus-visible,a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--brick);outline-offset:2px;}

/* grids */
.hero-pad{padding-top:clamp(104px,16vw,116px);padding-bottom:clamp(40px,7vw,72px);}
.hero-grid{display:grid;grid-template-columns:1fr;gap:56px;align-items:start;}
@media(min-width:980px){.hero-grid{grid-template-columns:1.15fr .85fr;gap:48px;align-items:center;}}
.grid-3{display:grid;grid-template-columns:1fr;gap:0;}
@media(min-width:780px){.grid-3{grid-template-columns:repeat(3,1fr);}}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
@media(min-width:780px){.grid-4{grid-template-columns:repeat(4,1fr);}}
.footer-grid{display:grid;grid-template-columns:1fr;gap:40px;}
@media(min-width:760px){.footer-grid{grid-template-columns:2fr 1fr 1fr;}}
@media(min-width:940px){.how-grid{grid-template-columns:1.15fr .85fr!important;align-items:start;}}

/* case-file rows — replaces bento/badge step markers with a ledger device */
.file-row{display:grid;grid-template-columns:64px 1fr;gap:0;border-top:1px solid var(--paper-line);}
.file-row:last-child{border-bottom:1px solid var(--paper-line);}
.file-num{font-family:var(--font-mono);font-size:12px;color:var(--body-faint);padding:26px 0 26px 2px;}
.file-body{padding:24px 4px 24px 20px;border-left:1px solid var(--paper-line);}
@media(min-width:640px){.file-body{padding:26px 4px 26px 28px;}}

/* problem panel — flat hairline card, no border-radius flourish */
.problem-card{padding:28px 26px;border-top:2px solid var(--ink);background:var(--ink-soft);}
.problem-card + .problem-card{border-left:1px solid rgba(246,243,236,.08);}
@media(max-width:779px){.problem-card{border-left:2px solid var(--ink)!important;border-top:none;}.problem-card + .problem-card{border-left:2px solid var(--ink)!important;border-top:1px solid rgba(246,243,236,.1)!important;}}

/* detector cards */
.det-card{padding:28px 26px;background:var(--card);border:1px solid var(--paper-line);border-top:3px solid var(--tone,var(--ink));}

/* feature ledger row */
.feat-row{display:flex;gap:18px;padding:22px 0;border-top:1px solid var(--paper-line);align-items:flex-start;}
.feat-row:last-child{border-bottom:1px solid var(--paper-line);}

/* security tiles */
.sec-tile{padding:24px 22px;background:#1B1F26;border:1px solid rgba(246,243,236,.08);}

/* pills / status */
.pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;font-weight:600;padding:3px 9px;border-radius:2px;letter-spacing:.02em;}
.pill-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.pill-pine{background:var(--pine-tint);color:var(--pine);}
.pill-ochre{background:var(--ochre-tint);color:var(--ochre);}
.pill-brick{background:var(--brick-tint);color:var(--brick-dim);}

/* reveal */
.reveal{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1);}
.reveal.in-view{opacity:1;transform:translateY(0);}

/* instrument — the signature hero element: a lab-style strip reading */
.instrument{position:relative;background:var(--card);border:1px solid var(--paper-line);}
.instrument-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--paper-line);}
.instrument-body{padding:20px 20px 8px;}
.instrument-foot{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid var(--paper-line);}
.instrument-foot > div{padding:14px 18px;}
.instrument-foot > div + div{border-left:1px solid var(--paper-line);}
.reading-line{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 1.4s cubic-bezier(.4,0,.2,1) forwards .3s;}
@keyframes draw{to{stroke-dashoffset:0;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}
.live-dot{animation:blink 1.8s ease-in-out infinite;}

/* scan tool chips */
.col-chip{display:flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid var(--paper-line);cursor:pointer;user-select:none;transition:all .12s ease;background:var(--paper);}
.col-chip.on{border-color:var(--ink);background:var(--paper-dim);}

/* cta */
.cta-section{padding-bottom:clamp(72px,10vw,124px);}
.cta-panel{position:relative;overflow:hidden;background:var(--ink);padding:clamp(48px,7vw,76px) clamp(24px,6vw,56px);text-align:center;}
.cta-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--brick);}

@media(prefers-reduced-motion:reduce){
  .reveal{transition:none!important;opacity:1!important;transform:none!important;}
  .reading-line{animation:none!important;stroke-dashoffset:0!important;}
  .live-dot{animation:none!important;}
}
`;

// ─── ICONS ────

function makeIcon(children, opts = {}) {
  const sw = opts.strokeWidth || 1.5;
  return function Ico({ size = 20, className = "", style = {} }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={sw}
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
  Plug: makeIcon(
    <>
      <path d="M9 2v4M15 2v4M7.5 8h9a1.5 1.5 0 0 1 1.5 1.5v2A5.5 5.5 0 0 1 12.5 17h-1A5.5 5.5 0 0 1 6 11.5v-2A1.5 1.5 0 0 1 7.5 8Z" />
      <path d="M12 17v3M9 22h6" />
    </>,
  ),
  Activity: makeIcon(<polyline points="2 14 7.5 14 10 7 14 19 16.5 14 22 14" />),
  Mail: makeIcon(
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="1" />
      <path d="m3 6.5 9 6.5 9-6.5" />
    </>,
  ),
  Cpu: makeIcon(
    <>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 10h4v4h-4z" />
    </>,
  ),
  Clock: makeIcon(
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
  Shield: makeIcon(<path d="M12 3.5 19.5 6.3v5.6c0 4.7-3.1 7.6-7.5 9-4.4-1.4-7.5-4.3-7.5-9V6.3L12 3.5Z" />),
  key: makeIcon(
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="M11.2 11.8 19 4M16.2 7l2.8 2.8M19 4l2.5 2.5" />
    </>,
  ),
  lock: makeIcon(
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
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
  ArrowRight: makeIcon(<path d="M4 12h16M13 5l7 7-7 7" />, { strokeWidth: 1.7 }),
  ArrowUpRight: makeIcon(<path d="M7 17 17 7M8 7h9v9" />, { strokeWidth: 1.7 }),
  Github: makeIcon(
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
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
  Check: makeIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </>,
  ),
  Upload: makeIcon(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>,
  ),
  Pin: makeIcon(
    <>
      <circle cx="12" cy="10.5" r="2.6" />
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
    </>,
  ),
};

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="0.5" y="0.5" width="31" height="31" fill="#15181D" stroke="#15181D" />
      <path d="M7 20.5 12 13l4 5 4.5-8L25 17" stroke="#F6F3EC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="16" cy="18" r="1.8" fill="#B5402F" />
    </svg>
  );
}

// ─── UTILITIES ────

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1],
      p1 = points[i],
      p2 = points[i + 1],
      p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6,
      cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6,
      cp2y = p2[1] - (p3[1] - p1[1]) / 6;
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
      ([e]) => {
        if (e.isIntersecting) {
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

// function SectionHead({ eyebrow, title, desc, light, center }) {
//   return (
//     <div className={`section-head ${center ? "center" : ""}`}>
//       {eyebrow && <div className="eyebrow" style={{ marginBottom: 14, justifyContent: center ? "center" : "flex-start" }}>{eyebrow}</div>}
//       {light ? <h2 className="h2-light">{title}</h2> : <h2 className="h2">{title}</h2>}
//       {desc && (
//         <p className={light ? "lede-light" : "lede"} style={{ marginTop: 14 }}>
//           {desc}
//         </p>
//       )}
//     </div>
//   );
// }

// ─── STATUS / SCORING ────

function statusMeta(s) {
  const st = s || "";
  if (st.includes("CRITICAL"))
    return { color: "#B5402F", bg: "#F4E3DE", border: "#DDBBAF", text: "#8F3225", label: "Critical" };
  if (st.includes("WARNING"))
    return { color: "#AD7C2A", bg: "#F1E6D2", border: "#DEC79A", text: "#84611F", label: "Warning" };
  if (st === "ERROR")
    return { color: "#95502A", bg: "#F1E2D2", border: "#D9BFA0", text: "#753F20", label: "Error" };
  return { color: "#33604A", bg: "#E1EBE2", border: "#B9CCBB", text: "#274A38", label: "Normal" };
}
function parseExp(text) {
  if (!text) return null;
  const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
  const c = text.match(/POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/);
  const a = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
  return {
    what: w?.[1]?.trim() || null,
    causes: c?.[1]?.trim()?.split("\n")?.filter(Boolean) || [],
    action: a?.[1]?.trim() || null,
  };
}
function calcScore(result) {
  const cols = result?.columns || [];
  if (!cols.length) return 100;
  let p = 0;
  cols.forEach((c) => {
    const s = c.status || "";
    if (s.includes("CRITICAL")) p += 25;
    else if (s.includes("WARNING")) p += 12;
    else if (s === "ERROR") p += 20;
  });
  return Math.max(0, 100 - p);
}
function scoreLabel(n) {
  if (n >= 80) return { text: "Healthy", color: "#33604A" };
  if (n >= 60) return { text: "Fair", color: "#AD7C2A" };
  if (n >= 40) return { text: "Degraded", color: "#95502A" };
  return { text: "Critical drift", color: "#B5402F" };
}

// ─── COLUMN CARD ────

function ColumnCard({ col }) {
  const [rcaOpen, setRcaOpen] = useState(false);
  const meta = statusMeta(col.status),
    exp = col.gemini_explanation ? parseExp(col.gemini_explanation) : null,
    isOk = meta.label === "Normal";
  const today = typeof col.today_value === "number" ? col.today_value : 0;
  const baseline = typeof col.baseline_mean === "number" && col.baseline_mean !== 0 ? col.baseline_mean : 1;
  const todayPct = Math.min((today / baseline) * 100, 100),
    diffPct = ((today - baseline) / Math.abs(baseline)) * 100;
  const shortInsight = exp?.what ? exp.what.replace(/\n/g, " ").split(/(?<=[.!?])\s+/)[0] : null;
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--paper-line)", borderLeft: `3px solid ${meta.color}` }}>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9, gap: 8 }}>
          <div className="mono" style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", lineHeight: 1.3 }}>
            {col.column === "row_anomaly" ? "overall_row_check" : col.column}
          </div>
          <span style={{ background: meta.bg, color: meta.text, fontFamily: "var(--font-mono)", padding: "2px 8px", fontSize: 10.5, fontWeight: 700, flexShrink: 0, letterSpacing: ".02em", textTransform: "uppercase" }}>
            {meta.label}
          </span>
        </div>
        {col.change_text && (
          <div style={{ fontSize: 13, color: "var(--body-dim)", marginBottom: 13, lineHeight: 1.5 }}>{col.change_text}</div>
        )}
        {col.type === "numeric" && col.today_value != null && (
          <div style={{ marginBottom: 15 }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--body-faint)", marginBottom: 4 }}>
                <span>today</span>
                <span className="mono" style={{ fontWeight: 700, color: meta.text }}>{today.toLocaleString()}</span>
              </div>
              <div style={{ background: "var(--paper-dim)", height: 5, overflow: "hidden" }}>
                <div style={{ width: `${todayPct}%`, background: meta.color, height: 5, transition: "width .7s cubic-bezier(.4,0,.2,1)", minWidth: todayPct > 0 ? 3 : 0 }} />
              </div>
            </div>
            <div style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--body-faint)", marginBottom: 4 }}>
                <span>baseline avg</span>
                <span className="mono" style={{ fontWeight: 700, color: "var(--body)" }}>{col.baseline_mean?.toLocaleString?.()}</span>
              </div>
              <div style={{ background: "var(--paper-dim)", height: 5, overflow: "hidden" }}>
                <div style={{ width: "100%", background: "var(--paper-line)", height: 5 }} />
              </div>
            </div>
            {!isOk && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: meta.bg, padding: "3px 9px" }}>
                <span style={{ fontSize: 12, color: meta.color, fontWeight: 800 }}>{today < baseline ? "\u25BC" : "\u25B2"}</span>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: meta.text }}>
                  {Math.abs(diffPct).toFixed(1)}% {today < baseline ? "below" : "above"} usual
                </span>
              </div>
            )}
          </div>
        )}
        {shortInsight && (
          <div style={{ background: "var(--paper-dim)", borderLeft: "2px solid var(--ink)", padding: "10px 13px", marginBottom: 11 }}>
            <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--body-dim)", letterSpacing: ".07em", marginBottom: 5, textTransform: "uppercase" }}>
              reading
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>{shortInsight}</p>
          </div>
        )}
        {exp && (exp.what || exp.causes?.length > 0 || exp.action) && (
          <div style={{ borderTop: "1px solid var(--paper-line)", paddingTop: 11 }}>
            <button
              onClick={() => setRcaOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", background: "transparent", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--body-dim)", padding: 0, fontFamily: "inherit" }}
            >
              <span style={{ fontSize: 10 }}>{rcaOpen ? "\u25B2" : "\u25BC"}</span>
              Root cause analysis
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--body-faint)", fontWeight: 400 }}>{rcaOpen ? "Collapse" : "Expand"}</span>
            </button>
            {rcaOpen && (
              <div style={{ marginTop: 13 }}>
                {exp.what && <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, margin: "0 0 11px" }}>{exp.what}</p>}
                {exp.causes?.length > 0 && (
                  <div style={{ marginBottom: 11 }}>
                    <div className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: "var(--body-faint)", letterSpacing: ".06em", marginBottom: 7, textTransform: "uppercase" }}>
                      possible causes
                    </div>
                    {exp.causes.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5 }}>
                        <span className="mono" style={{ color: "var(--brick)", fontWeight: 700, flexShrink: 0, marginTop: 1, fontSize: 12 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.6 }}>{c.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    ))}
                  </div>
                )}
                {exp.action && (
                  <div style={{ background: "var(--paper-dim)", padding: "10px 13px", borderLeft: "2px solid var(--brick)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--brick)", fontWeight: 700, flexShrink: 0 }}>{"\u2192"}</span>
                      <span style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 500, lineHeight: 1.6 }}>{exp.action}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HEALTH SCORE HEADER ────

function HealthScoreHeader({ result, score, execTime }) {
  const lbl = scoreLabel(score),
    analyzed = result?.summary?.total_columns || (result?.columns || []).length,
    flagged = (result?.summary?.critical || 0) + (result?.summary?.warnings || 0);
  const R = 32,
    circ = 2 * Math.PI * R;
  return (
    <div style={{ background: "var(--ink)", padding: "22px 24px", marginBottom: 1, display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center" }}>
      <div style={{ position: "relative", width: 74, height: 74, flexShrink: 0 }}>
        <svg width="74" height="74" viewBox="0 0 74 74">
          <circle cx="37" cy="37" r={R} fill="none" stroke="rgba(246,243,236,.12)" strokeWidth="5" />
          <circle
            cx="37" cy="37" r={R} fill="none" stroke={lbl.color} strokeWidth="5" strokeLinecap="butt"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} transform="rotate(-90 37 37)"
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span className="mono" style={{ fontWeight: 700, fontSize: 17, color: "var(--paper)", lineHeight: 1 }}>{score}</span>
          <span className="mono" style={{ fontSize: 9, color: "rgba(246,243,236,.4)", marginTop: 2 }}>/100</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--paper)", marginBottom: 7 }}>
          System health — <span style={{ color: lbl.color }}>{lbl.text}</span>
        </div>
        <div className="mono" style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", fontSize: 12, color: "rgba(246,243,236,.5)", marginBottom: 11 }}>
          <span>{analyzed} columns analyzed</span>
          <span style={{ color: "rgba(246,243,236,.2)" }}>/</span>
          <span>{flagged} anomalies flagged</span>
          {execTime && (
            <>
              <span style={{ color: "rgba(246,243,236,.2)" }}>/</span>
              <span>{execTime}ms</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {[
            { label: `${result?.summary?.critical || 0} critical`, c: "#D9897B" },
            { label: `${result?.summary?.warnings || 0} warnings`, c: "#D9BC7E" },
            { label: `${result?.summary?.normal || 0} normal`, c: "#8FB89C" },
          ].map((p) => (
            <span key={p.label} className="mono" style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", background: "rgba(246,243,236,.06)", color: p.c }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FullResultsDashboard({ result, execTime, onStart }) {
  const score = calcScore(result),
    cols = result?.columns || [],
    hasBad = (result?.summary?.critical || 0) > 0 || (result?.summary?.warnings || 0) > 0;
  return (
    <div>
      <HealthScoreHeader result={result} score={score} execTime={execTime} />
      {cols.length === 0 && (
        <div style={{ padding: "36px 24px", textAlign: "center", background: "var(--pine-tint)", border: "1px solid var(--paper-line)", borderTop: "none" }}>
          <Icon.Check size={28} style={{ color: "var(--pine)", margin: "0 auto 12px" }} />
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--pine)", marginBottom: 4 }}>All columns look normal</div>
          <div style={{ fontSize: 13, color: "var(--body-dim)" }}>No anomalies detected in this scan.</div>
        </div>
      )}
      {cols.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 1, background: "var(--paper-line)", border: "1px solid var(--paper-line)", borderTop: "none", marginBottom: hasBad ? 1 : 0 }}>
          {cols.map((col, i) => (
            <ColumnCard key={i} col={col} />
          ))}
        </div>
      )}
      {hasBad && (
        <div style={{ background: "var(--ink)", padding: "28px 26px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brick)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 12 }}>
            This is a one-time scan
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--paper)", marginBottom: 9 }}>
            DriftWatch caught something. Want it watched continuously?
          </div>
          <p style={{ fontSize: 13.5, color: "rgba(246,243,236,.55)", maxWidth: 400, margin: "0 auto 22px", lineHeight: 1.65 }}>
            Set up a monitor on this source and get an email the moment this pattern happens again.
          </p>
          <button className="btn btn-on-dark" onClick={() => onStart && onStart("monitor")}>
            Set up a monitor <Icon.ArrowRight size={15} />
          </button>
          <div className="mono" style={{ fontSize: 11, color: "rgba(246,243,236,.4)", marginTop: 12 }}>
            free to start / two minutes / no card required
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INSTRUMENT — signature hero element ────

function Instrument() {
  const points = [
    [8, 58], [40, 50], [72, 54], [104, 44], [136, 50], [168, 46],
    [200, 96], [232, 84], [264, 79], [296, 74],
  ];
  const linePath = smoothPath(points),
    baselinePath = smoothPath(points.map(([x], i) => [x, [56, 50, 52, 45, 49, 47, 51, 48, 50, 46][i]])),
    anomaly = points[6];
  return (
    <div className="instrument">
      <div className="instrument-head">
        <div>
          <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>daily_sales.csv</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--body-faint)", marginTop: 2 }}>google sheet · checked every 24h</div>
        </div>
        <span className="pill pill-pine">
          <span className="pill-dot live-dot" style={{ background: "currentColor" }} />
          watching
        </span>
      </div>
      <div className="instrument-body">
        <svg viewBox="0 0 304 118" style={{ width: "100%", height: "auto" }} role="img" aria-label="Strip chart showing daily sales dropping sharply below baseline on day six">
          <line x1="0" y1="98" x2="304" y2="98" stroke="var(--paper-line)" strokeWidth="1" />
          <line x1="0" y1="66" x2="304" y2="66" stroke="var(--paper-line)" strokeWidth="1" strokeDasharray="2 3" />
          <path d={baselinePath} fill="none" stroke="var(--body-faint)" strokeWidth="1.25" strokeDasharray="3 3" opacity="0.7" />
          <path d={linePath} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" className="reading-line" />
          <line x1={anomaly[0]} y1={anomaly[1]} x2={anomaly[0]} y2="98" stroke="var(--brick)" strokeWidth="1" strokeDasharray="2 2" opacity="0.55" />
          <circle cx={anomaly[0]} cy={anomaly[1]} r="4" fill="var(--card)" stroke="var(--brick)" strokeWidth="2" />
          <text x={anomaly[0] + 8} y={anomaly[1] - 6} className="mono" fontSize="9.5" fill="#8F3225" fontWeight="600">-83% vs baseline</text>
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, paddingBottom: 14 }}>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--body-faint)" }}>mon</span>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--body-faint)" }}>sun</span>
        </div>
      </div>
      <div className="instrument-foot">
        <div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--body-faint)", textTransform: "uppercase", letterSpacing: ".04em" }}>detector</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}>z-score</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--body-faint)", textTransform: "uppercase", letterSpacing: ".04em" }}>rows scanned</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}>12,480</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--body-faint)", textTransform: "uppercase", letterSpacing: ".04em" }}>alert sent</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--brick)", marginTop: 3 }}>09:02 am</div>
        </div>
      </div>
    </div>
  );
}

function HeroScanTool({ onScanComplete }) {
  const [stage, setStage] = useState("upload"),
    [file, setFile] = useState(null),
    [cols, setCols] = useState([]);
  const [dateCol, setDateCol] = useState(""),
    [selCols, setSelCols] = useState([]),
    [context, setContext] = useState("");
  const [sens, setSens] = useState("medium"),
    [drag, setDrag] = useState(false),
    [err, setErr] = useState("");
  const [busy, setBusy] = useState(false),
    [result, setResult] = useState(null);
  const nonDate = cols.filter((c) => c !== dateCol);
  const processFile = async (f) => {
    if (!f?.name?.endsWith(".csv")) {
      setErr("Upload a .csv file.");
      return;
    }
    setFile(f);
    setErr("");
    setBusy(true);
    const form = new FormData();
    form.append("file", f);
    try {
      const res = await axios.post(SCAN_API + "/columns", form);
      const c = res.data.columns || [];
      if (!c.length) {
        setErr("No columns found.");
        setBusy(false);
        return;
      }
      setCols(c);
      const dg = c.find((x) => /date|time/i.test(x)) || c[0];
      setDateCol(dg || "");
      setSelCols(c.filter((x) => x !== dg));
      setStage("columns");
    } catch {
      setErr("Could not read file. Is it a valid CSV?");
    } finally {
      setBusy(false);
    }
  };
  const runScan = async () => {
    if (!selCols.length) {
      setErr("Select at least one column.");
      return;
    }
    setStage("processing");
    setErr("");
    const t0 = Date.now();
    const form = new FormData();
    form.append("file", file);
    form.append("date_column", dateCol);
    form.append("context", context || "data monitoring");
    form.append("sensitivity", sens);
    form.append("monitor_columns", selCols.join(","));
    try {
      const res = await axios.post(SCAN_API + "/scan", form);
      const ms = Date.now() - t0;
      setResult(res.data);
      setStage("done");
      onScanComplete(res.data, ms);
    } catch (e) {
      setErr(e.response?.data?.detail || "Scan failed. Is the backend running?");
      setStage("configure");
    }
  };
  const reset = () => {
    setStage("upload");
    setFile(null);
    setCols([]);
    setDateCol("");
    setSelCols([]);
    setContext("");
    setResult(null);
    setErr("");
  };
  const score = result ? calcScore(result) : null,
    lbl = score !== null ? scoreLabel(score) : null;
  const card = { background: "var(--card)", border: "1px solid var(--paper-line)", padding: "22px 22px" };
  return (
    <div style={{ width: "100%" }}>
      {stage === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("dw-hero-csv")?.click()}
          style={{
            border: `1.5px dashed ${drag ? "var(--ink)" : "var(--body-faint)"}`,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? "var(--paper-dim)" : "var(--card)",
            transition: "all .15s ease",
          }}
        >
          {busy ? (
            <div>
              <div style={{ width: 40, height: 40, background: "var(--paper-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <div style={{ width: 18, height: 18, border: "2.5px solid var(--ink)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              </div>
              <div className="mono" style={{ fontWeight: 600, color: "var(--body)", fontSize: 13 }}>reading file…</div>
            </div>
          ) : (
            <>
              <div style={{ width: 48, height: 48, background: drag ? "var(--paper-line)" : "var(--paper-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", transition: "background .15s" }}>
                <Icon.Upload size={22} style={{ color: drag ? "var(--ink)" : "var(--body-faint)" }} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 6 }}>
                {drag ? "Drop it here" : "Scan a CSV"}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--body-faint)", marginBottom: 18 }}>Drag and drop, or click to browse</div>
              <div className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--paper-dim)", border: "1px solid var(--paper-line)", padding: "5px 12px", fontSize: 11 }}>
                <Icon.Shield size={12} /> stateless — runs in memory, nothing stored
              </div>
            </>
          )}
          <input id="dw-hero-csv" type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
        </div>
      )}
      {err && (
        <div style={{ marginTop: 10, padding: "9px 13px", background: "var(--brick-tint)", color: "var(--brick-dim)", fontSize: 13, display: "flex", gap: 7, alignItems: "center" }}>
          <Icon.AlertTriangle size={13} />
          {err}
        </div>
      )}
      {stage === "columns" && (
        <div style={card}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 3 }}>Choose what to scan</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--body-faint)", marginBottom: 15 }}>
            <span style={{ color: "var(--body)" }}>{file?.name}</span> · {cols.length} columns
          </div>
          <div style={{ marginBottom: 15 }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--body-dim)", marginBottom: 7, textTransform: "uppercase", letterSpacing: ".03em" }}>Date column</div>
            <select
              value={dateCol}
              onChange={(e) => { setDateCol(e.target.value); setSelCols(cols.filter((c) => c !== e.target.value)); }}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--paper-line)", fontSize: 13, outline: "none", background: "var(--paper)", fontFamily: "var(--font-mono)" }}
            >
              {cols.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 17 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, color: "var(--body-dim)", textTransform: "uppercase", letterSpacing: ".03em" }}>Columns to scan</div>
              <button
                onClick={() => setSelCols(selCols.length === nonDate.length ? [] : nonDate)}
                style={{ fontSize: 11.5, color: "var(--brick)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}
              >
                {selCols.length === nonDate.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {nonDate.map((col) => {
                const on = selCols.includes(col);
                return (
                  <div
                    key={col}
                    onClick={() => setSelCols((p) => (on ? p.filter((c) => c !== col) : [...p, col]))}
                    className={`col-chip ${on ? "on" : ""}`}
                  >
                    <div style={{ width: 13, height: 13, flexShrink: 0, border: on ? "1.5px solid var(--ink)" : "1.5px solid var(--body-faint)", background: on ? "var(--ink)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {on && <span style={{ color: "var(--paper)", fontSize: 8, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span className="mono" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: on ? 600 : 400, color: on ? "var(--ink)" : "var(--body-dim)" }}>{col}</span>
                  </div>
                );
              })}
            </div>
            {selCols.length === 0 && <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--ochre)", fontWeight: 500 }}>Pick at least one column.</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStage("upload"); setCols([]); setFile(null); }} className="btn btn-outline btn-sm" style={{ borderColor: "var(--paper-line)", color: "var(--body)" }}>Back</button>
            <button
              onClick={() => { if (!selCols.length) return setErr("Pick at least one column."); setErr(""); setStage("configure"); }}
              className="btn btn-primary"
              style={{ flex: 1, padding: "10px" }}
            >
              Continue <Icon.ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
      {stage === "configure" && (
        <div style={card}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 3 }}>Final settings</div>
          <div style={{ fontSize: 13, color: "var(--body-faint)", marginBottom: 15 }}>
            Scanning {selCols.length} column{selCols.length !== 1 ? "s" : ""}: <span className="mono">{selCols.join(", ")}</span>
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--body-dim)", display: "block", marginBottom: 7 }}>
              What is this data? <span style={{ fontWeight: 400, color: "var(--body-faint)" }}>optional</span>
            </label>
            <input
              type="text" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. daily sales of an online store"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--paper-line)", fontSize: 13, outline: "none", background: "var(--paper)", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--body-dim)", marginBottom: 8 }}>Detection sensitivity</div>
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--paper-line)" }}>
              {[
                { k: "low", l: "Low", d: "Big changes only" },
                { k: "medium", l: "Medium", d: "Moderate drift" },
                { k: "high", l: "High", d: "Small drifts" },
              ].map((o, i) => (
                <button
                  key={o.k} onClick={() => setSens(o.k)}
                  style={{
                    flex: 1, padding: "9px 6px", fontFamily: "inherit", border: "none",
                    borderLeft: i > 0 ? "1px solid var(--paper-line)" : "none",
                    background: sens === o.k ? "var(--ink)" : "transparent",
                    color: sens === o.k ? "var(--paper)" : "var(--body)",
                    cursor: "pointer", fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{o.l}</div>
                  <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{o.d}</div>
                </button>
              ))}
            </div>
          </div>
          {err && <div style={{ color: "var(--brick)", fontSize: 12.5, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}><Icon.AlertTriangle size={13} />{err}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStage("columns")} className="btn btn-outline btn-sm" style={{ borderColor: "var(--paper-line)", color: "var(--body)" }}>Back</button>
            <button onClick={runScan} className="btn btn-primary" style={{ flex: 1, padding: "10px" }}>
              Detect anomalies <Icon.ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
      {stage === "processing" && (
        <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
          <div style={{ width: 48, height: 48, background: "var(--paper-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <div style={{ width: 20, height: 20, border: "2.5px solid var(--ink)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--ink)", marginBottom: 6 }}>Analysing your data…</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--body-faint)" }}>running z-score, chi-square, and isolation forest</div>
        </div>
      )}
      {stage === "done" && result && (
        <div style={{ ...card, borderTop: `3px solid ${lbl.color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 15 }}>
            <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: lbl.color, minWidth: 56 }}>{score}</div>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--body-faint)", marginBottom: 2, textTransform: "uppercase", letterSpacing: ".04em" }}>health score / 100</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: lbl.color }}>{lbl.text}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--body-dim)", marginBottom: 15, lineHeight: 1.5 }}>
            {(result?.summary?.critical || 0) + (result?.summary?.warnings || 0)} anomal{(result?.summary?.critical || 0) + (result?.summary?.warnings || 0) === 1 ? "y" : "ies"} found across {result?.summary?.total_columns || selCols.length} column{selCols.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--brick)", fontWeight: 600 }}>
            <span style={{ fontSize: 15 }}>↓</span> Full analysis below
          </div>
          <button onClick={reset} className="mono" style={{ marginTop: 12, fontSize: 11.5, color: "var(--body-faint)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Scan another file
          </button>
        </div>
      )}
    </div>
  );
}

// ---- LANDING PAGE ----

function Nav({ onStart, refs, session }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const goTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <nav className={"nav " + (scrolled ? "scrolled" : "")}>
      <div className="container nav-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--ink)", letterSpacing: "-0.005em" }}>
            DriftWatch
          </span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => goTo(refs.problem)}>Why it exists</button>
          <button className="nav-link" onClick={() => goTo(refs.how)}>How it works</button>
          <button className="nav-link" onClick={() => goTo(refs.detection)}>Detection</button>
          <button className="nav-link" onClick={() => goTo(refs.security)}>Security</button>
        </div>
        <div className="nav-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onStart("monitor")}>
            {session ? "Dashboard" : "Sign in"}
          </button>
        </div>
      </div>
    </nav>
  );
}

const CASE_FILE = [
  {
    icon: Icon.Plug,
    title: "Point it at a source",
    desc: "Link a Google Sheet or upload a CSV. No pipeline to build, no engineer to loop in first.",
    note: "takes under a minute",
  },
  {
    icon: Icon.Activity,
    title: "It runs three checks, every cycle",
    desc: "On the schedule you set, each column is tested against its own history: a numeric trend test, a category-shift test, and a row-level outlier test running together.",
    note: "z-score / chi-square / isolation forest",
  },
  {
    icon: Icon.Mail,
    title: "You get one email, only when it matters",
    desc: "The alert names the column, shows today against baseline, and includes a plain-language explanation of what likely happened and what to check first.",
    note: "quiet on normal days",
  },
];

const DETECTORS = [
  {
    tone: "#B5402F",
    tint: "var(--brick-tint)",
    icon: Icon.trendDown,
    tag: "statistical drift · z-score baseline",
    title: "Numeric trend detection",
    desc: "Flags a number that has moved far outside its normal range, measured against a baseline built from that column's own history — not a hardcoded threshold.",
  },
  {
    tone: "#33604A",
    tint: "var(--pine-tint)",
    icon: Icon.barChart,
    tag: "distribution shift · chi-square test",
    title: "Category shift detection",
    desc: "Flags when the mix of values in a column changes shape — a status field that suddenly skews toward one value, or a region field that goes quiet.",
  },
  {
    tone: "#AD7C2A",
    tint: "var(--ochre-tint)",
    icon: Icon.Cpu,
    tag: "multivariate outliers · isolation forest",
    title: "Row-level anomaly detection",
    desc: "Flags rows that look wrong across several columns at once, even when every individual column looks fine on its own.",
  },
];

const SECURITY = [
  { icon: Icon.lock, tag: "PostgreSQL row-level security", title: "Accounts never cross", desc: "Isolation is enforced inside the database itself, not only in application code, ensuring secure separation of user data." },
  { icon: Icon.key, tag: "JWT-based authentication", title: "Every request is checked", desc: "Nothing reaches your data without proving it's really you, on every single call." },
  { icon: Icon.userCheck, tag: "Google OAuth", title: "Sign in your way", desc: "Continue with Google, or email. No separate password for anyone to store or leak." },
  { icon: Icon.Shield, tag: "Stateless processing", title: "One-time scans leave nothing", desc: "A free scan runs entirely in memory and is discarded. Nothing is written to a database." },
];

function LandingPage({ onStart, session }) {
  const problemRef = useRef(null),
    howRef = useRef(null),
    detectionRef = useRef(null),
    securityRef = useRef(null),
    heroScanRef = useRef(null),
    resultsRef = useRef(null);
  const refs = { problem: problemRef, how: howRef, detection: detectionRef, security: securityRef };
  const [scanResult, setScanResult] = useState(null),
    [execTime, setExecTime] = useState(null);
  const scrollToScan = () => heroScanRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const handleScanComplete = (result, ms) => {
    setScanResult(result);
    setExecTime(ms);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 380);
  };

  return (
    <div className="dw">
      <style>{GLOBAL_CSS}</style>
      <Nav onStart={onStart} refs={refs} session={session} />

      <section className="hero-pad" style={{ background: "var(--paper)" }}>
        <div className="container hero-grid">
          <div>
            <h1 className="h1">Your spreadsheet breaks quietly. This tells you when it does.</h1>
            <p className="lede" style={{ marginTop: 22, maxWidth: 460 }}>
              DriftWatch watches a Google Sheet or CSV against its own history and flags the moment a number, a category, or a row stops looking like itself — before it reaches a dashboard someone trusts.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <button className="btn btn-primary" onClick={() => onStart("monitor")}>
                {session ? "Go to dashboard" : "Start monitoring"} <Icon.ArrowRight size={15} />
              </button>
            </div>
            <div className="mono" style={{ display: "flex", gap: 18, marginTop: 30, fontSize: 11.5, color: "var(--body-faint)", flexWrap: "wrap" }}>
              <span>no login for a scan</span>
              <span style={{ color: "var(--paper-line)" }}>/</span>
              <span>nothing stored</span>
              <span style={{ color: "var(--paper-line)" }}>/</span>
              <span>results in seconds</span>
            </div>
          </div>
          <div ref={heroScanRef} id="dw-scan">
            <HeroScanTool onScanComplete={handleScanComplete} />
          </div>
        </div>
      </section>

      {scanResult && (
        <section ref={resultsRef} className="section" style={{ scrollMarginTop: 84, paddingTop: 40, paddingBottom: 40 }}>
          <div className="container">
            <div className="eyebrow" style={{ marginBottom: 18 }}>scan result</div>
            <Reveal>
              <FullResultsDashboard result={scanResult} execTime={execTime} onStart={onStart} />
            </Reveal>
          </div>
        </section>
      )}

      <section ref={problemRef} className="section" style={{ background: "var(--ink)", scrollMarginTop: 84 }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow" style={{ marginBottom: 16, color: "#D9897B" }}>the problem</div>
              <h2 className="h2-light">Most data problems are discovered by accident</h2>
              <p className="lede-light" style={{ marginTop: 14, maxWidth: 560 }}>
                Spreadsheets and CSVs run daily decisions at most companies. Nobody is assigned to watch them, so the first sign something broke is usually a person noticing a chart looks wrong.
              </p>
            </div>
          </Reveal>
          <div className="grid-3">
            {[
              { icon: Icon.Activity, title: "Nobody is watching by default", desc: "A sync fails, a column goes blank, a number triples overnight — and nothing surfaces it until someone happens to look." },
              { icon: Icon.Clock, title: "It surfaces too late", desc: "By the time a stakeholder flags a broken number in a meeting, that number has usually already shaped a decision." },
              { icon: Icon.sliders, title: "Manual checks don't hold up", desc: "Eyeballing every sheet each morning works for a while. Then someone's on leave, or busy, and the checks quietly stop." },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <div className="problem-card">
                  <p.icon size={18} style={{ color: "#D9897B", marginBottom: 16 }} />
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--paper)", marginBottom: 10, lineHeight: 1.3 }}>{p.title}</div>
                  <p style={{ fontSize: 13.5, color: "rgba(246,243,236,.5)", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" ref={howRef} style={{ scrollMarginTop: 84 }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow" style={{ marginBottom: 16 }}>how it works</div>
              <h2 className="h2">Three steps, and then it runs on its own</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 44 }} className="how-grid">
            <div>
              {CASE_FILE.map((s, i) => (
                <Reveal key={s.title} delay={i * 70}>
                  <div className="file-row">
                    <div className="file-num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="file-body">
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <s.icon size={19} style={{ color: "var(--brick)", flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                            <div className="h3">{s.title}</div>
                            <span className="mono" style={{ fontSize: 10.5, color: "var(--body-faint)", whiteSpace: "nowrap" }}>{s.note}</span>
                          </div>
                          <p style={{ fontSize: 14, color: "var(--body-dim)", lineHeight: 1.7, margin: "8px 0 0", maxWidth: 520 }}>{s.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={90}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 12, justifyContent: "center" }}>a reading, in practice</div>
                <Instrument />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-dim)" }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow" style={{ marginBottom: 16 }}>what it does</div>
              <h2 className="h2">Runs quietly. Speaks up when something's off.</h2>
            </div>
          </Reveal>
          <div>
            {[
              { icon: Icon.Activity, title: "Automated monitoring", desc: "Schedule checks from hourly to weekly. DriftWatch runs in the background while you work on everything else." },
              { icon: Icon.fileSheet, title: "One-time scans", desc: "Upload a CSV and get a full anomaly report in seconds. No login, nothing stored, nothing to set up." },
              { icon: Icon.barChart, title: "Run history", desc: "Every check is logged on a timeline, so a pattern shows up as a pattern — not just one isolated incident." },
              { icon: Icon.Cpu, title: "AI-written explanations", desc: "Every alert includes a plain-language read of what changed, likely causes, and what to check first." },
              { icon: Icon.Mail, title: "Alerts, not noise", desc: "You're only emailed when a check actually finds something. Normal days stay silent." },
              { icon: Icon.sliders, title: "Full control, always", desc: "Pause, resume, or delete any monitor in one click. Nothing runs without your say-so." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 60}>
                <div className="feat-row">
                  <f.icon size={18} style={{ color: "var(--ink)", flexShrink: 0, marginTop: 3 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)", marginBottom: 4 }}>{f.title}</div>
                    <p style={{ fontSize: 13.5, color: "var(--body-dim)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--ink)" }} ref={securityRef}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow" style={{ marginBottom: 16, color: "#8FB89C" }}>security</div>
              <h2 className="h2-light">Your data is yours. That's enforced, not promised.</h2>
              <p className="lede-light" style={{ marginTop: 14 }}>
                Every account is isolated at two layers independently — the application and the database — so a bug in one doesn't expose the other.
              </p>
            </div>
          </Reveal>
          <div className="grid-4">
            {SECURITY.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="sec-tile">
                  <s.icon size={17} style={{ color: "#8FB89C", marginBottom: 16 }} />
                  <div className="mono" style={{ fontSize: 10, color: "rgba(246,243,236,.35)", marginBottom: 9, letterSpacing: ".05em" }}>{s.tag}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--paper)", marginBottom: 8, lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(246,243,236,.42)", lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" ref={detectionRef} style={{ scrollMarginTop: 84 }}>
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow" style={{ marginBottom: 16 }}>detection</div>
              <h2 className="h2">Three separate tests, run together</h2>
              <p className="lede" style={{ marginTop: 14 }}>
                Most tools watch for one kind of problem. Each scan runs all three of these against your data, because a real break in a spreadsheet rarely announces itself the same way twice.
              </p>
            </div>
          </Reveal>
          <div className="grid-3" style={{ gap: 1, background: "var(--paper-line)", border: "1px solid var(--paper-line)" }}>
            {DETECTORS.map((d, i) => (
              <Reveal key={d.title} delay={i * 70}>
                <div className="det-card" style={{ "--tone": d.tone, height: "100%" }}>
                  <div style={{ width: 36, height: 36, background: d.tint, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <d.icon size={17} style={{ color: d.tone }} />
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: d.tone, marginBottom: 9, opacity: 0.85 }}>{d.tag}</div>
                  <div className="h3" style={{ marginBottom: 9 }}>{d.title}</div>
                  <p style={{ fontSize: 14, color: "var(--body-dim)", lineHeight: 1.7, margin: 0 }}>{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <div className="eyebrow" style={{ marginBottom: 18, justifyContent: "center", color: "#D9897B" }}>get started</div>
              <h2 className="h2" style={{ color: "var(--paper)" }}>
                Stop finding out about data problems in a meeting
              </h2>
              <p className="lede" style={{ color: "rgba(246,243,236,.6)", maxWidth: 460, margin: "16px auto 0" }}>
                {session ? "Your monitors are one click away." : "Free to start. No credit card. Your first monitor is running in about two minutes."}
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
                <button className="btn btn-on-dark" onClick={() => onStart("monitor")}>
                  {session ? "Go to dashboard" : "Start monitoring"} <Icon.ArrowRight size={15} />
                </button>
                <button className="btn btn-outline-dark" onClick={scrollToScan}>
                  Try the free scan
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer style={{ background: "var(--ink)", padding: "56px 0 28px", borderTop: "2px solid var(--brick)" }}>
        <div className="container">
          <div className="footer-grid" style={{ marginBottom: 36 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Logo />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--paper)" }}>DriftWatch</span>
              </div>
              <p style={{ fontSize: 13.5, color: "rgba(246,243,236,.4)", lineHeight: 1.7, maxWidth: 280, marginBottom: 18 }}>
                Catches anomalies in your data before they turn into business problems.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="https://github.com/user1-prajwal/driftwatch" target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark">
                  <Icon.Github size={14} /> GitHub
                </a>
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(246,243,236,.32)", marginBottom: 14 }}>Product</div>
              {["Automated monitoring", "One-time scans", "Run history", "AI-written explanations", "Alerts, not noise", "Full control"].map((f) => (
                <div key={f} style={{ fontSize: 13, color: "rgba(246,243,236,.4)", marginBottom: 9 }}>{f}</div>
              ))}
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(246,243,236,.32)", marginBottom: 14 }}>Built with</div>
              {["Python + FastAPI", "React", "scikit-learn", "Google Gemini AI", "Supabase + RLS", "APScheduler", "Brevo email API", "Vercel + Render"].map((t) => (
                <div key={t} className="mono" style={{ fontSize: 12.5, color: "rgba(246,243,236,.4)", marginBottom: 9 }}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(246,243,236,.1)", paddingTop: 22, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}>
              built by <span style={{ color: "rgba(246,243,236,.55)" }}>Prajwal</span> — full stack and data platform engineer
            </span>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}>© {new Date().getFullYear()} DriftWatch</span>
              <a href="https://github.com/user1-prajwal/driftwatch" target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}>GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---- ROOT APP ----

export default function App() {
  const [page, setPage] = useState("landing"),
    [session, setSession] = useState(null),
    [showAuthModal, setShowAuthModal] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  const handleStart = (p) => {
    if (p === "scan") {
      if (page !== "landing") setPage("landing");
      setTimeout(
        () => document.getElementById("dw-scan")?.scrollIntoView({ behavior: "smooth", block: "center" }),
        100,
      );
      return;
    }
    if (p === "monitor") {
      if (session) setPage("monitor");
      else setShowAuthModal(true);
    }
  };
  if (page === "monitor")
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
  if (page === "scan") return <ScanPage onBack={() => setPage("landing")} />;
  return (
    <>
      <LandingPage onStart={handleStart} session={session} />
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