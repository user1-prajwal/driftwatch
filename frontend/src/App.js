import { useState, useRef, useEffect, Fragment } from "react";
import MonitorsPage from "./MonitorsPage";
import ScanPage from "./ScanPage";
import AuthModal from "./AuthModal";
import { supabase } from "./supabaseClient";
import axios from "axios";

// const SCAN_API = "http://localhost:8000";
const SCAN_API = "https://driftwatch-backend.onrender.com";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

.dw{
  --white:#FFFFFF;
  --ink:#0B0E14;
  --slate-900:#0F172A;
  --slate-800:#1C2436;
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
.bg-dark{background:var(--ink);}
.bg-navy{background:linear-gradient(135deg,#0f0e2e 0%,#1a1650 50%,#0e1a2e 100%);}
.bg-detection{background:linear-gradient(135deg,#F0F2FF 0%,#F5F3FF 60%,#EDF9F5 100%);}

.h1{font-size:clamp(36px,5.4vw,64px);font-weight:800;letter-spacing:-0.03em;line-height:1.04;color:#1FB6A6;margin:0;}
.h2{font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.025em;line-height:1.16;color:var(--slate-900);margin:0;}
.h2-light{font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.025em;line-height:1.16;color:#fff;margin:0;}
.h3{font-size:19px;font-weight:700;letter-spacing:-0.01em;color:var(--slate-900);margin:0;}
.lede{font-size:clamp(16px,1.6vw,18px);color:var(--slate-500);line-height:1.7;margin:0;}
.lede-light{font-size:clamp(16px,1.6vw,18px);color:rgba(255,255,255,.55);line-height:1.7;margin:0;}
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

/* grids */
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
.card{background:#fff;border:1px solid var(--slate-200);border-radius:16px;box-shadow:0 2px 10px rgba(16,24,40,.06),0 0 0 1px rgba(16,24,40,.02);}
.feature-card{padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;}
.feature-card:hover{transform:translateY(-4px);border-color:var(--indigo-100);box-shadow:0 18px 36px rgba(15,23,42,.06);}
.icon-badge{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}

/* dark glass cards (used on dark sections) */
.glass-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:26px 24px;transition:background .25s ease,border-color .25s ease;}
.glass-card:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.18);}

/* problem cards on dark bg */
.problem-card{padding:28px 24px;border-radius:16px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.04);transition:background .2s ease,transform .2s ease;}
.problem-card:hover{background:rgba(255,255,255,.07);transform:translateY(-3px);}
.problem-icon-wrap{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;}

/* pills */
.pill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:999px;}
.pill-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.pill-emerald{background:var(--emerald-50);color:var(--emerald-600);}
.pill-amber{background:var(--amber-50);color:#B45309;}

/* reveal */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1);}
.reveal.in-view{opacity:1;transform:translateY(0);}

/* hero */
.dot-field{position:absolute;inset:0;background-image:radial-gradient(rgba(79,70,229,.18) 1px,transparent 1px);background-size:26px 26px;mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 30%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 30%,transparent 80%);}
.glow{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(79,70,229,.16),transparent 70%);filter:blur(10px);pointer-events:none;}
.dash-card{position:relative;z-index:2;background:rgba(255,255,255,.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(228,231,236,.9);border-radius:20px;padding:22px;box-shadow:0 24px 64px -12px rgba(31,182,166,.45);}
.float-card{position:absolute;z-index:3;background:#fff;border:1px solid var(--slate-200);border-radius:14px;box-shadow:0 16px 40px -8px rgba(31,182,166,.22);padding:14px 16px;}
.alert-card{top:-18px;right:-6px;width:208px;animation:float 6s ease-in-out infinite;}
.toast-card{bottom:-22px;left:-10px;width:212px;}
@keyframes float{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-9px) rotate(-2deg);}}
@media(max-width:600px){
  .float-card{position:static;width:100%;animation:none;}
}
.chart-line{stroke-dasharray:480;stroke-dashoffset:480;animation:draw 1.5s cubic-bezier(.4,0,.2,1) forwards .5s;}
@keyframes draw{to{stroke-dashoffset:0;}}
.ring-progress{transform:rotate(-90deg);transform-origin:50% 50%;animation:ringfill 1.3s cubic-bezier(.4,0,.2,1) forwards .7s;}
@keyframes ringfill{to{stroke-dashoffset:var(--ring-offset);}}
@keyframes spin{to{transform:rotate(360deg);}}

/* ── marquee strip ── */
.marquee-outer{overflow:hidden;background:#0F0E2A;padding:13px 0;border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04);}
.marquee-track{display:flex;white-space:nowrap;animation:marqueeRoll 30s linear infinite;}
.marquee-track:hover{animation-play-state:paused;}
.marquee-item{display:inline-flex;align-items:center;gap:8px;padding:0 36px;font-size:13px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.01em;}
.marquee-item .mdot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0;}
.marquee-item .mhigh{color:rgba(255,255,255,.75);}
@keyframes marqueeRoll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}


/* detection cards on white — subtle border tint only */
.det-card-plain{background:#fff;border-radius:16px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease;}
.det-card-plain:hover{transform:translateY(-4px);}
.det-card-indigo-b{border:1.5px solid #C7D2FE;box-shadow:0 2px 12px rgba(79,70,229,.06);}
.det-card-indigo-b:hover{box-shadow:0 18px 36px rgba(79,70,229,.1);}
.det-card-emerald-b{border:1.5px solid #A7F3D0;box-shadow:0 2px 12px rgba(16,185,129,.06);}
.det-card-emerald-b:hover{box-shadow:0 18px 36px rgba(16,185,129,.1);}
.det-card-amber-b{border:1.5px solid #FDE68A;box-shadow:0 2px 12px rgba(245,158,11,.06);}
.det-card-amber-b:hover{box-shadow:0 18px 36px rgba(245,158,11,.1);}

@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* tech / footer */
.tech-col-title{font-family:var(--font-mono);font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--slate-400);margin-bottom:14px;}

/* metrics */
.metrics-row{display:flex;flex-wrap:wrap;gap:32px;margin-top:48px;}
.metric-num{font-size:26px;font-weight:800;color:var(--slate-900);letter-spacing:-0.02em;}
.metric-label{font-size:13px;color:var(--slate-500);margin-top:4px;max-width:140px;}

/* cta */
.cta-section{padding-bottom:clamp(80px,11vw,140px);}
.cta-panel{
  position:relative;overflow:hidden;
  background:linear-gradient(135deg,#1e1b4b 0%,#312e81 35%,#0f4c3a 100%);
  border-radius:28px;
  padding:clamp(48px,7vw,80px) clamp(24px,6vw,56px);
  text-align:center;
  box-shadow:0 32px 80px -16px rgba(49,46,129,.45),0 0 0 1px rgba(255,255,255,.06) inset;
}
.cta-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 30%,rgba(99,102,241,.28),transparent 65%),radial-gradient(ellipse 60% 50% at 80% 70%,rgba(16,185,129,.18),transparent 65%);pointer-events:none;}
.cta-panel::after{content:'';position:absolute;inset:0;border-radius:28px;border:1px solid rgba(255,255,255,.12);pointer-events:none;}

/* scan tool */
.col-chip{display:flex;align-items:center;gap:9px;padding:10px 13px;border-radius:10px;border:1.5px solid var(--slate-200);cursor:pointer;user-select:none;transition:all .15s ease;background:var(--slate-50);}
.col-chip.on{border-color:var(--indigo);background:var(--indigo-50);}

/* showcase panel */
.showcase-panel{position:relative;overflow:hidden;background:linear-gradient(135deg,#FAFBFF 0%,#F5F3FF 45%,#F0FDF9 100%);border:1px solid var(--slate-200);border-radius:32px;padding:clamp(28px,4vw,52px);box-shadow:0 24px 64px -20px rgba(79,70,229,.14);}
.showcase-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto 1fr;gap:40px;align-items:center;}
@media(max-width:900px){.showcase-grid{grid-template-columns:1fr;gap:36px;}.showcase-divider{display:none;}}
.showcase-divider{width:1px;align-self:stretch;background:linear-gradient(to bottom,transparent,var(--slate-200) 15%,var(--slate-200) 85%,transparent);}
.showcase-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;color:#fff;font-size:11px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.18),0 0 0 4px #fff;flex-shrink:0;}
.showcase-badge-label{font-size:11.5px;font-weight:700;background:#fff;padding:3px 9px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.08);white-space:nowrap;}

/* detection cards — colored per tone */
.det-card-indigo{background:linear-gradient(135deg,#EEF2FF,#E0E7FF);border:1px solid #C7D2FE;border-radius:16px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease;}
.det-card-indigo:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(79,70,229,.12);}
.det-card-emerald{background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:1px solid #A7F3D0;border-radius:16px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease;}
.det-card-emerald:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(16,185,129,.12);}
.det-card-amber{background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:1px solid #FDE68A;border-radius:16px;padding:26px 24px;transition:transform .25s ease,box-shadow .25s ease;}
.det-card-amber:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(245,158,11,.12);}

@media(prefers-reduced-motion:reduce){
  .reveal{transition:none!important;opacity:1!important;transform:none!important;}
  .alert-card{animation:none!important;}
  .chart-line,.ring-progress{animation:none!important;stroke-dashoffset:0!important;}
}
`;

// ─── ICONS 

function makeIcon(children, opts = {}) {
  const sw = opts.strokeWidth || 1.6;
  const filled = !!opts.filled;
  return function Ico({ size = 20, className = "", style = {} }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
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
  Activity: makeIcon(
    <polyline points="2 14 7.5 14 10 7 14 19 16.5 14 22 14" />,
  ),
  Mail: makeIcon(
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3 6.5 9 6.5 9-6.5" />
    </>,
  ),
  Cpu: makeIcon(
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
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
  Shield: makeIcon(
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
  Sparkles: makeIcon(
    <>
      <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.5 5.5l1 1M17.5 17.5l1 1M5.5 18.5l1-1M17.5 6.5l1-1" />
      <circle cx="12" cy="12" r="3" />
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
      {light ? (
        <h2 className="h2-light">{title}</h2>
      ) : (
        <h2 className="h2">{title}</h2>
      )}
      {desc && (
        <p className={light ? "lede-light" : "lede"} style={{ marginTop: 14 }}>
          {desc}
        </p>
      )}
    </div>
  );
}

// function FeatureCard({ icon, tone, title, desc, delay = 0 }) {
//   return (
//     <Reveal delay={delay} style={{ height: "100%" }}>
//       <div className="card feature-card" style={{ height: "100%" }}>
//         <IconBadge icon={icon} tone={tone} />
//         <div className="h3" style={{ marginBottom: 8 }}>
//           {title}
//         </div>
//         <p
//           style={{
//             fontSize: 14.5,
//             color: "var(--slate-500)",
//             lineHeight: 1.7,
//             margin: 0,
//           }}
//         >
//           {desc}
//         </p>
//       </div>
//     </Reveal>
//   );
// }

// ─── NAV ─

function Nav({ onStart, refs, onTryScan }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
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
            Detection
          </button>
          <button className="nav-link" onClick={() => goTo(refs.security)}>
            Security
          </button>
          <button
            className="nav-link"
            onClick={onTryScan}
            style={{ color: "var(--indigo)", fontWeight: 600 }}
          >
            Try it now
          </button>
        </div>
        <div className="nav-actions">
          <button className="nav-signin" onClick={() => onStart("monitor")}>
            Sign in
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onStart("monitor")}
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── STATUS UTILITIES ────

function statusMeta(s) {
  const st = s || "";
  if (st.includes("CRITICAL"))
    return {
      color: "#EF4444",
      bg: "rgba(239,68,68,0.08)",
      border: "#EF4444",
      text: "#B91C1C",
      label: "Critical",
    };
  if (st.includes("WARNING"))
    return {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.08)",
      border: "#F59E0B",
      text: "#B45309",
      label: "Warning",
    };
  if (st === "ERROR")
    return {
      color: "#F97316",
      bg: "rgba(249,115,22,0.08)",
      border: "#F97316",
      text: "#C2410C",
      label: "Error",
    };
  return {
    color: "#10B981",
    bg: "rgba(16,185,129,0.06)",
    border: "#A7F3D0",
    text: "#059669",
    label: "Normal",
  };
}
function parseExp(text) {
  if (!text) return null;
  const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
  const c = text.match(
    /POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/,
  );
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
  if (n >= 80) return { text: "Healthy", color: "#10B981" };
  if (n >= 60) return { text: "Fair", color: "#F59E0B" };
  if (n >= 40) return { text: "Degraded", color: "#F97316" };
  return { text: "Critical Drift", color: "#EF4444" };
}

// ─── COLUMN CARD ────

function ColumnCard({ col }) {
  const [rcaOpen, setRcaOpen] = useState(false);
  const meta = statusMeta(col.status),
    exp = col.gemini_explanation ? parseExp(col.gemini_explanation) : null,
    isOk = meta.label === "Normal";
  const today = typeof col.today_value === "number" ? col.today_value : 0;
  const baseline =
    typeof col.baseline_mean === "number" && col.baseline_mean !== 0
      ? col.baseline_mean
      : 1;
  const todayPct = Math.min((today / baseline) * 100, 100),
    diffPct = ((today - baseline) / Math.abs(baseline)) * 100;
  const shortInsight = exp?.what
    ? exp.what.replace(/\n/g, " ").split(/(?<=[.!?])\s+/)[0]
    : null;
  return (
    <div
      style={{
        background: isOk ? "#fff" : meta.bg,
        border: `1px solid ${isOk ? "var(--slate-200)" : meta.border + "40"}`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(16,24,40,.05)",
      }}
    >
      <div style={{ padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
            gap: 8,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--slate-900)",
              lineHeight: 1.3,
            }}
          >
            {col.column === "row_anomaly" ? "Overall row check" : col.column}
          </div>
          <span
            style={{
              background: meta.bg,
              color: meta.text,
              border: `1px solid ${meta.color}40`,
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 11.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {meta.label}
          </span>
        </div>
        {col.change_text && (
          <div
            style={{
              fontSize: 13,
              color: "var(--slate-500)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            {col.change_text}
          </div>
        )}
        {col.type === "numeric" && col.today_value != null && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 7 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  color: "var(--slate-400)",
                  marginBottom: 4,
                }}
              >
                <span>Today</span>
                <span
                  className="mono"
                  style={{ fontWeight: 700, color: meta.text }}
                >
                  {today.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  background: "var(--slate-100)",
                  borderRadius: 999,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${todayPct}%`,
                    background: meta.color,
                    height: 8,
                    borderRadius: 999,
                    transition: "width .7s cubic-bezier(.4,0,.2,1)",
                    minWidth: todayPct > 0 ? 3 : 0,
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11.5,
                  color: "var(--slate-400)",
                  marginBottom: 4,
                }}
              >
                <span>Baseline avg</span>
                <span
                  className="mono"
                  style={{ fontWeight: 700, color: "var(--slate-600)" }}
                >
                  {col.baseline_mean?.toLocaleString?.()}
                </span>
              </div>
              <div
                style={{
                  background: "var(--slate-100)",
                  borderRadius: 999,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "var(--slate-300)",
                    height: 8,
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
            {!isOk && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: meta.bg,
                  padding: "4px 10px",
                  borderRadius: 999,
                }}
              >
                <span
                  style={{ fontSize: 13, color: meta.color, fontWeight: 800 }}
                >
                  {today < baseline ? "▼" : "▲"}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 12, fontWeight: 700, color: meta.text }}
                >
                  {Math.abs(diffPct).toFixed(1)}%{" "}
                  {today < baseline ? "below" : "above"} usual
                </span>
              </div>
            )}
          </div>
        )}
        {shortInsight && (
          <div
            style={{
              background: "var(--indigo-50)",
              borderRadius: 10,
              padding: "10px 13px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--indigo)",
                letterSpacing: ".05em",
                marginBottom: 5,
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              <Icon.Sparkles size={12} /> AI INSIGHT
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--slate-700)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {shortInsight}
            </p>
          </div>
        )}
        {exp && (exp.what || exp.causes?.length > 0 || exp.action) && (
          <div
            style={{ borderTop: "1px solid var(--slate-100)", paddingTop: 10 }}
          >
            <button
              onClick={() => setRcaOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--slate-500)",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 10 }}>{rcaOpen ? "▲" : "▼"}</span>Root
              Cause Analysis
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--slate-400)",
                  fontWeight: 400,
                }}
              >
                {rcaOpen ? "Collapse" : "Expand"}
              </span>
            </button>
            {rcaOpen && (
              <div style={{ marginTop: 12 }}>
                {exp.what && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--slate-700)",
                      lineHeight: 1.65,
                      margin: "0 0 10px",
                    }}
                  >
                    {exp.what}
                  </p>
                )}
                {exp.causes?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--slate-400)",
                        letterSpacing: ".06em",
                        marginBottom: 6,
                      }}
                    >
                      POSSIBLE CAUSES
                    </div>
                    {exp.causes.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--indigo)",
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--slate-600)",
                            lineHeight: 1.6,
                          }}
                        >
                          {c.replace(/^\d+\.\s*/, "")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {exp.action && (
                  <div
                    style={{
                      background: "var(--indigo-50)",
                      borderRadius: 8,
                      padding: "9px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--indigo)",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        →
                      </span>
                      <span
                        style={{
                          fontSize: 12.5,
                          color: "var(--indigo-600)",
                          fontWeight: 500,
                          lineHeight: 1.6,
                        }}
                      >
                        {exp.action}
                      </span>
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

// ─── HEALTH SCORE HEADER ─

function HealthScoreHeader({ result, score, execTime }) {
  const lbl = scoreLabel(score),
    analyzed = result?.summary?.total_columns || (result?.columns || []).length,
    flagged =
      (result?.summary?.critical || 0) + (result?.summary?.warnings || 0);
  const R = 34,
    circ = 2 * Math.PI * R;
  return (
    <div
      style={{
        background: "var(--ink)",
        borderRadius: 18,
        padding: "22px 26px",
        marginBottom: 18,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 22,
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(11,14,20,.3)",
      }}
    >
      <div
        style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,.1)"
            strokeWidth="7"
          />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={lbl.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - score / 100)}
            transform="rotate(-90 40 40)"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontWeight: 900,
              fontSize: 18,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,.35)",
              marginTop: 2,
            }}
          >
            /100
          </span>
        </div>
      </div>
      <div>
        <div
          style={{
            fontWeight: 800,
            fontSize: 17,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          System Health — <span style={{ color: lbl.color }}>{lbl.text}</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 18px",
            fontSize: 13,
            color: "rgba(255,255,255,.55)",
            marginBottom: 10,
          }}
        >
          <span>{analyzed} columns analyzed</span>
          <span style={{ color: "rgba(255,255,255,.2)" }}>|</span>
          <span>{flagged} anomalies flagged</span>
          {execTime && (
            <>
              <span style={{ color: "rgba(255,255,255,.2)" }}>|</span>
              <span>Execution: {execTime}ms</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            {
              label: `${result?.summary?.critical || 0} critical`,
              c: "#EF4444",
            },
            {
              label: `${result?.summary?.warnings || 0} warnings`,
              c: "#F59E0B",
            },
            { label: `${result?.summary?.normal || 0} normal`, c: "#10B981" },
          ].map((p) => (
            <span
              key={p.label}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 999,
                background: `${p.c}20`,
                color: p.c,
                border: `1px solid ${p.c}35`,
              }}
            >
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
    hasBad =
      (result?.summary?.critical || 0) > 0 ||
      (result?.summary?.warnings || 0) > 0;
  return (
    <div style={{ animation: "fadeIn .4s cubic-bezier(.16,1,.3,1)" }}>
      <HealthScoreHeader result={result} score={score} execTime={execTime} />
      {cols.length === 0 && (
        <div
          className="card"
          style={{
            padding: "32px",
            textAlign: "center",
            background: "var(--emerald-50)",
            borderColor: "#A7F3D0",
          }}
        >
          <Icon.Check
            size={32}
            style={{ color: "var(--emerald-600)", margin: "0 auto 12px" }}
          />
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--emerald-600)",
              marginBottom: 4,
            }}
          >
            All columns look normal
          </div>
          <div style={{ fontSize: 13, color: "var(--slate-500)" }}>
            No anomalies detected.
          </div>
        </div>
      )}
      {cols.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14,
            marginBottom: hasBad ? 18 : 0,
          }}
        >
          {cols.map((col, i) => (
            <ColumnCard key={i} col={col} />
          ))}
        </div>
      )}
      {hasBad && (
        <div
          style={{
            background:
              "linear-gradient(135deg,var(--indigo-50),var(--emerald-50))",
            border: "1.5px solid var(--indigo-100)",
            borderRadius: 18,
            padding: "24px 26px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Icon.Activity size={20} style={{ color: "#fff" }} />
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "var(--slate-900)",
              marginBottom: 8,
            }}
          >
            DriftWatch caught something — want it to keep watching?
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--slate-500)",
              maxWidth: 380,
              margin: "0 auto 18px",
              lineHeight: 1.65,
            }}
          >
            Set up automatic monitoring and get emailed the moment this happens
            again.
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize: 13.5, padding: "11px 22px" }}
            onClick={() => onStart && onStart("monitor")}
          >
            Set up automatic monitoring <Icon.ArrowRight size={15} />
          </button>
          <div
            style={{ fontSize: 11.5, color: "var(--slate-400)", marginTop: 9 }}
          >
            Free to start · takes 2 minutes · no credit card
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD DIAGRAM ───

function DashboardDiagram() {
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
  const linePath = smoothPath(points),
    areaPath = `${linePath} L 300 134 L 10 134 Z`,
    anomaly = points[6];
  const R = 28,
    C = 2 * Math.PI * R,
    score = 86,
    offset = C - (score / 100) * C;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 440,
        margin: "0 auto",
        paddingBottom: 56,
      }}
    >
      <div
        className="glow"
        style={{ width: 320, height: 320, top: -40, right: -30, opacity: 0.6 }}
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
                fontSize: 14,
                color: "var(--slate-900)",
              }}
            >
              Daily Sales Monitor
            </div>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 3 }}
            >
              Google Sheet · every 24h
            </div>
          </div>
          <span className="pill pill-emerald">
            <span className="pill-dot" style={{ background: "currentColor" }} />
            Active
          </span>
        </div>
        <svg
          viewBox="0 0 310 134"
          style={{ width: "100%", height: "auto", marginTop: 14 }}
        >
          <defs>
            <linearGradient id="dgAreaFill" x1="0" y1="0" x2="0" y2="1">
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
          <path d={areaPath} fill="url(#dgAreaFill)" stroke="none" />
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
            opacity="0.5"
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
            style={{ fontSize: 10, color: "var(--slate-400)" }}
          >
            Mon
          </span>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--slate-400)" }}
          >
            Sun
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--slate-100)",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="var(--slate-100)"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke="#4F46E5"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C}
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
                  fontSize: 13,
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
                fontSize: 12,
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
                fontSize: 13,
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
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--amber-50)",
              color: "#B45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.AlertTriangle size={14} />
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--slate-900)",
              }}
            >
              Anomaly detected
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--slate-500)",
                marginTop: 1,
                lineHeight: 1.4,
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
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--indigo-50)",
              color: "var(--indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon.Mail size={13} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--slate-900)",
              }}
            >
              Alert email sent
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--slate-400)", marginTop: 1 }}
            >
              09:02 AM · ops@company.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HERO SCAN TOOL ─

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
      setErr(
        e.response?.data?.detail || "Scan failed. Is the backend running?",
      );
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
  const card = {
    background: "rgba(255,255,255,.88)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--slate-200)",
    borderRadius: 18,
    padding: "22px 24px",
    boxShadow: "0 16px 48px rgba(11,14,20,.1)",
  };
  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
      {stage === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            processFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("dw-hero-csv")?.click()}
          style={{
            border: `2px dashed ${drag ? "var(--indigo)" : "rgba(79,70,229,.35)"}`,
            borderRadius: 18,
            padding: "44px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? "var(--indigo-50)" : "rgba(255,255,255,.92)",
            backdropFilter: "blur(12px)",
            boxShadow:
              "0 0 0 1.5px rgba(79,70,229,.22), 0 24px 64px rgba(79,70,229,.18), 0 4px 16px rgba(0,0,0,.06)",
            transition: "all .2s ease",
            transform: drag ? "scale(1.015)" : "scale(1)",
          }}
        >
          {busy ? (
            <div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--indigo-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "3px solid var(--indigo)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--slate-700)",
                  fontSize: 15,
                }}
              >
                Reading file…
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: drag ? "var(--indigo-100)" : "var(--slate-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  transition: "background .2s",
                }}
              >
                <Icon.Upload
                  size={24}
                  style={{ color: drag ? "var(--indigo)" : "var(--slate-400)" }}
                />
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--slate-900)",
                  marginBottom: 8,
                }}
              >
                {drag ? "Drop it here" : "Scan your CSV"}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--slate-400)",
                  marginBottom: 20,
                }}
              >
                Drag & drop or click to browse
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--slate-50)",
                  border: "1px solid var(--slate-200)",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  color: "var(--slate-500)",
                }}
              >
                <Icon.Shield size={12} /> Stateless · runs in-memory · nothing
                stored
              </div>
            </>
          )}
          <input
            id="dw-hero-csv"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={(e) => processFile(e.target.files[0])}
          />
        </div>
      )}
      {err && (
        <div
          style={{
            marginTop: 10,
            padding: "9px 13px",
            background: "var(--red-50)",
            color: "var(--red)",
            fontSize: 13,
            borderRadius: 9,
            display: "flex",
            gap: 7,
            alignItems: "center",
          }}
        >
          <Icon.AlertTriangle size={13} />
          {err}
        </div>
      )}
      {stage === "columns" && (
        <div style={card}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--slate-900)",
              marginBottom: 3,
            }}
          >
            Choose what to scan
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--slate-500)",
              marginBottom: 14,
            }}
          >
            <strong style={{ color: "var(--slate-700)" }}>{file?.name}</strong>{" "}
            · {cols.length} columns
          </div>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--slate-600)",
                marginBottom: 6,
              }}
            >
              Date column
            </div>
            <select
              value={dateCol}
              onChange={(e) => {
                setDateCol(e.target.value);
                setSelCols(cols.filter((c) => c !== e.target.value));
              }}
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid var(--slate-200)",
                borderRadius: 9,
                fontSize: 13,
                outline: "none",
                background: "#fff",
                fontFamily: "inherit",
              }}
            >
              {cols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--slate-600)",
                }}
              >
                Columns to scan
              </div>
              <button
                onClick={() =>
                  setSelCols(selCols.length === nonDate.length ? [] : nonDate)
                }
                style={{
                  fontSize: 11.5,
                  color: "var(--indigo)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                {selCols.length === nonDate.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
            >
              {nonDate.map((col) => {
                const on = selCols.includes(col);
                return (
                  <div
                    key={col}
                    onClick={() =>
                      setSelCols((p) =>
                        on ? p.filter((c) => c !== col) : [...p, col],
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "8px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `1.5px solid ${on ? "var(--indigo)" : "var(--slate-200)"}`,
                      background: on ? "var(--indigo-50)" : "var(--slate-50)",
                      transition: "all .12s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        flexShrink: 0,
                        border: on
                          ? "2px solid var(--indigo)"
                          : "2px solid var(--slate-300)",
                        background: on ? "var(--indigo)" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {on && (
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 8,
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: on ? 600 : 400,
                        color: on ? "var(--indigo-600)" : "var(--slate-600)",
                      }}
                    >
                      {col}
                    </span>
                  </div>
                );
              })}
            </div>
            {selCols.length === 0 && (
              <div
                style={{
                  marginTop: 7,
                  fontSize: 12.5,
                  color: "var(--amber)",
                  fontWeight: 500,
                }}
              >
                Pick at least one column.
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setStage("upload");
                setCols([]);
                setFile(null);
              }}
              style={{
                padding: "9px 16px",
                background: "var(--slate-50)",
                color: "var(--slate-600)",
                border: "1.5px solid var(--slate-200)",
                borderRadius: 9,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (!selCols.length) return setErr("Pick at least one column.");
                setErr("");
                setStage("configure");
              }}
              style={{
                flex: 1,
                padding: "9px",
                background: "var(--indigo)",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
      {stage === "configure" && (
        <div style={card}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--slate-900)",
              marginBottom: 3,
            }}
          >
            Final settings
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--slate-500)",
              marginBottom: 14,
            }}
          >
            Scanning {selCols.length} column{selCols.length !== 1 ? "s" : ""}:{" "}
            {selCols.join(", ")}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--slate-600)",
                display: "block",
                marginBottom: 6,
              }}
            >
              What is this data?{" "}
              <span style={{ fontWeight: 400, color: "var(--slate-400)" }}>
                optional
              </span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. daily sales of an online store"
              style={{
                width: "100%",
                padding: "9px 12px",
                border: "1.5px solid var(--slate-200)",
                borderRadius: 9,
                fontSize: 13,
                outline: "none",
                background: "#fff",
                fontFamily: "inherit",
              }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--slate-600)",
                marginBottom: 8,
              }}
            >
              Detection sensitivity
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              {[
                { k: "low", l: "Low", d: "Big changes" },
                { k: "medium", l: "Medium", d: "Moderate" },
                { k: "high", l: "High", d: "Small drifts" },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setSens(o.k)}
                  style={{
                    flex: 1,
                    padding: "9px 6px",
                    borderRadius: 9,
                    fontFamily: "inherit",
                    border:
                      sens === o.k
                        ? "2px solid var(--indigo)"
                        : "1.5px solid var(--slate-200)",
                    background: sens === o.k ? "var(--indigo-50)" : "#fff",
                    color:
                      sens === o.k ? "var(--indigo-600)" : "var(--slate-600)",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{o.l}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                    {o.d}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {err && (
            <div
              style={{
                color: "var(--red)",
                fontSize: 12.5,
                marginBottom: 10,
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <Icon.AlertTriangle size={13} />
              {err}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setStage("columns")}
              style={{
                padding: "9px 16px",
                background: "var(--slate-50)",
                color: "var(--slate-600)",
                border: "1.5px solid var(--slate-200)",
                borderRadius: 9,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
            <button
              onClick={runScan}
              style={{
                flex: 1,
                padding: "9px",
                background: "var(--indigo)",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <Icon.Sparkles size={13} /> Detect anomalies
            </button>
          </div>
        </div>
      )}
      {stage === "processing" && (
        <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--indigo-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: "3px solid var(--indigo)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "var(--slate-900)",
              marginBottom: 6,
            }}
          >
            Analysing your data…
          </div>
          <div style={{ fontSize: 13, color: "var(--slate-400)" }}>
            Running 3 detection models in-memory
          </div>
        </div>
      )}
      {stage === "done" && result && (
        <div style={{ ...card, border: `1.5px solid ${lbl.color}40` }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `${lbl.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: lbl.color }}>
                {score}
              </span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--slate-400)",
                  marginBottom: 2,
                }}
              >
                HEALTH SCORE / 100
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: lbl.color }}>
                {lbl.text}
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--slate-500)",
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            {(result?.summary?.critical || 0) +
              (result?.summary?.warnings || 0)}{" "}
            anomal
            {(result?.summary?.critical || 0) +
              (result?.summary?.warnings || 0) ===
            1
              ? "y"
              : "ies"}{" "}
            found across {result?.summary?.total_columns || selCols.length}{" "}
            column{selCols.length !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--indigo)",
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 16 }}>↓</span> Full analysis below
          </div>
          <button
            onClick={reset}
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "var(--slate-400)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Scan another file
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MARQUEE STRIP ────

const MARQUEE_ITEMS = [
  { text: "z-score baseline", hi: false },
  { text: "chi-square test", hi: false },
  { text: "isolation forest", hi: false },
  { text: "Google Sheets", hi: true },
  { text: "CSV upload", hi: true },
  { text: "AI-generated insights", hi: true },
  { text: "Gemini AI", hi: false },
  { text: "email alerts", hi: false },
  { text: "FastAPI backend", hi: false },
  { text: "scikit-learn", hi: false },
  { text: "Supabase RLS", hi: false },
  { text: "anomaly detection", hi: true },
  { text: "data drift monitoring", hi: true },
  { text: "APScheduler", hi: false },
  { text: "row-level isolation", hi: false },
  { text: "24 / 7 monitoring", hi: true },
];

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-outer">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="mdot" />
            <span className={item.hi ? "mhigh" : ""}>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── LANDING PAGE 

function LandingPage({ onStart }) {
  const howRef = useRef(null),
    featuresRef = useRef(null),
    detectionRef = useRef(null),
    securityRef = useRef(null),
    heroScanRef = useRef(null),
    resultsRef = useRef(null);
  const refs = {
    how: howRef,
    features: featuresRef,
    detection: detectionRef,
    security: securityRef,
  };
  const [scanResult, setScanResult] = useState(null),
    [execTime, setExecTime] = useState(null);
  const scrollToScan = () =>
    heroScanRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  const handleScanComplete = (result, ms) => {
    setScanResult(result);
    setExecTime(ms);
    setTimeout(
      () =>
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      380,
    );
  };

  const problems = [
    {
      icon: Icon.Activity,
      color: "#EF4444",
      bg: "rgba(239,68,68,.15)",
      title: "Nobody is watching",
      desc: "A sync fails, a column goes blank, a number triples overnight — and nothing tells you until someone notices the report looks wrong.",
    },
    {
      icon: Icon.Clock,
      color: "#F59E0B",
      bg: "rgba(245,158,11,.15)",
      title: "Caught too late",
      desc: "By the time a stakeholder flags a broken chart in a meeting, the bad data has already shaped a decision.",
    },
    {
      icon: Icon.sliders,
      color: "#A78BFA",
      bg: "rgba(167,139,250,.15)",
      title: "Manual checks don't scale",
      desc: "Eyeballing every sheet every morning works for a while — until it doesn't, and the checks quietly stop happening.",
    },
  ];

  const steps = [
    {
      n: "01",
      icon: Icon.Plug,
      tone: "indigo",
      title: "Connect your source",
      desc: "Link a Google Sheet or upload a CSV. No code, no integration work, no waiting on engineering.",
    },
    {
      n: "02",
      icon: Icon.Activity,
      tone: "emerald",
      title: "DriftWatch watches continuously",
      desc: "On your schedule, every dataset is checked against its own history for unusual trends and outliers.",
    },
    {
      n: "03",
      icon: Icon.Mail,
      tone: "indigo",
      title: "Get a clear alert",
      desc: "When something looks off, you get an email explaining what changed, why it matters, and what to check first.",
    },
  ];

  // const features = [
  //   {
  //     icon: Icon.Activity,
  //     tone: "indigo",
  //     title: "Automated monitoring",
  //     desc: "Schedule checks from hourly to weekly. DriftWatch runs in the background so you don't have to remember to look.",
  //   },
  //   {
  //     icon: Icon.fileSheet,
  //     tone: "emerald",
  //     title: "One-time scans",
  //     desc: "Upload a CSV and get a full anomaly report in seconds. No login, nothing stored.",
  //   },
  //   {
  //     icon: Icon.barChart,
  //     tone: "indigo",
  //     title: "Run history",
  //     desc: "Every check is logged on a timeline, so you can spot a pattern, not just a single incident.",
  //   },
  //   {
  //     icon: Icon.Cpu,
  //     tone: "amber",
  //     title: "AI-generated explanations",
  //     desc: "Every alert comes with a clear explanation of what changed and why it likely happened.",
  //   },
  //   {
  //     icon: Icon.Mail,
  //     tone: "emerald",
  //     title: "Smart email alerts",
  //     desc: "You're only emailed when something needs attention. Normal days stay quiet.",
  //   },
  //   {
  //     icon: Icon.sliders,
  //     tone: "slate",
  //     title: "Full control, anytime",
  //     desc: "Pause, resume, or delete any monitor in a click. Nothing runs without your say.",
  //   },
  // ];

  const detectors = [
    {
      cls: "det-card-indigo",
      icon: Icon.trendDown,
      iconColor: "var(--indigo)",
      monoColor: "#818CF8",
      tag: "Statistical drift · z-score baseline",
      title: "Numeric trend detection",
      desc: "Flags when a number moves far outside its normal range, using a baseline built from that column's own history.",
    },
    {
      cls: "det-card-emerald",
      icon: Icon.barChart,
      iconColor: "var(--emerald-600)",
      monoColor: "#34D399",
      tag: "Distribution shift · chi-square test",
      title: "Category shift detection",
      desc: "Flags when the mix of values in a column changes shape — like a status field suddenly skewing toward one value.",
    },
    {
      cls: "det-card-amber",
      icon: Icon.Cpu,
      iconColor: "#B45309",
      monoColor: "#F59E0B",
      tag: "Multivariate outliers · isolation forest",
      title: "Row-level anomaly detection",
      desc: "Flags rows that look suspicious across several columns at once, even when each column looks normal individually.",
    },
  ];

  const securityItems = [
    {
      icon: Icon.lock,
      tag: "PostgreSQL Row-Level Security",
      title: "Your data never crosses accounts",
      desc: "Isolation enforced inside the database itself, not just in app code.",
    },
    {
      icon: Icon.key,
      tag: "JWT-based authentication",
      title: "Every request is verified",
      desc: "Nothing reaches your data without proving it's really you on every single call.",
    },
    {
      icon: Icon.userCheck,
      tag: "Google OAuth",
      title: "Sign in your way",
      desc: "Continue with Google or email. No separate password for us to store.",
    },
    {
      icon: Icon.Shield,
      tag: "Stateless processing",
      title: "Scans leave nothing behind",
      desc: "One-time scans run entirely in memory. Nothing is written to any database.",
    },
  ];

  return (
    <div className="dw">
      <style>{GLOBAL_CSS}</style>
      <Nav onStart={onStart} refs={refs} onTryScan={scrollToScan} />

      {/* ── HERO (unchanged — user confirmed good) */}
      <section
        className="hero-pad"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg,#FAFBFF 0%,#EEF2FF 45%,#F0FDF9 100%)",
        }}
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
                onClick={() => onStart("monitor")}
              >
                Sign in to dashboard
              </button>
            </div>
          </div>
          <div ref={heroScanRef} id="dw-scan">
            <HeroScanTool onScanComplete={handleScanComplete} />
          </div>
        </div>
      </section>

      <MarqueeStrip />

      {/* ── RESULTS */}
      {scanResult && (
        <section
          ref={resultsRef}
          className="section"
          style={{ scrollMarginTop: 84, paddingTop: 48 }}
        >
          <div className="container">
            <Reveal>
              <FullResultsDashboard
                result={scanResult}
                execTime={execTime}
                onStart={onStart}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── PROBLEM — DARK INK background, breaks visual monotony */}
      <section
        className="section"
        style={{
          background: "linear-gradient(180deg,#0F0E2A 0%,#0B0C1E 100%)",
          marginTop: 0,
        }}
      >
        <div className="container">
          <Reveal>
            <div className="section-head">
              <h2 className="h2-light">The cost of unmonitored data</h2>
              <p className="lede-light" style={{ marginTop: 14 }}>
                Spreadsheets and CSVs are the backbone of daily decisions — and
                the easiest place for something to quietly go wrong.
              </p>
            </div>
          </Reveal>
          <div className="grid-3">
            {problems.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} style={{ height: "100%" }}>
                <div className="problem-card" style={{ height: "100%" }}>
                  <div
                    className="problem-icon-wrap"
                    style={{ background: p.bg }}
                  >
                    <p.icon size={20} style={{ color: p.color }} />
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      color: "#fff",
                      marginBottom: 10,
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,.5)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — white, NO title (diagram tells the story) */}
      <section className="section" ref={howRef} style={{ scrollMarginTop: 84 }}>
        <div className="container">
          <Reveal delay={60}>
            <div className="showcase-panel">
              <div
                className="glow"
                style={{
                  width: 340,
                  height: 340,
                  top: -100,
                  left: -80,
                  opacity: 0.5,
                }}
              />
              <div
                className="glow"
                style={{
                  width: 300,
                  height: 300,
                  bottom: -100,
                  right: -60,
                  opacity: 0.4,
                  background:
                    "radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)",
                }}
              />
              <div className="showcase-grid">
                <div style={{ position: "relative" }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--indigo)",
                      letterSpacing: ".08em",
                      marginBottom: 14,
                      textAlign: "center",
                    }}
                  >
                    LIVE MONITOR PREVIEW
                  </div>
                  <DashboardDiagram />
                  <div
                    style={{
                      position: "absolute",
                      top: 50,
                      left: 14,
                      zIndex: 5,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span
                      className="showcase-badge"
                      style={{ background: "var(--indigo)" }}
                    >
                      1
                    </span>
                    <span
                      className="showcase-badge-label"
                      style={{ color: "var(--indigo)" }}
                    >
                      Source connected
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: 218,
                      left: "50%",
                      marginLeft: -10,
                      zIndex: 5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span
                      className="showcase-badge-label"
                      style={{ color: "var(--emerald-600)" }}
                    >
                      Drift caught
                    </span>
                    <span
                      className="showcase-badge"
                      style={{ background: "var(--emerald)" }}
                    >
                      2
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 30,
                      left: 212,
                      zIndex: 5,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span
                      className="showcase-badge"
                      style={{ background: "var(--indigo)" }}
                    >
                      3
                    </span>
                    <span
                      className="showcase-badge-label"
                      style={{ color: "var(--indigo)" }}
                    >
                      Alert sent
                    </span>
                  </div>
                </div>
                <div className="showcase-divider" />
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 23,
                      top: 24,
                      bottom: 24,
                      width: 2,
                      background:
                        "linear-gradient(to bottom,var(--indigo),var(--emerald),var(--indigo))",
                      borderRadius: 999,
                      opacity: 0.4,
                    }}
                  />
                  {steps.map((s, i) => {
                    const accent =
                      s.tone === "emerald" ? "var(--emerald)" : "var(--indigo)";
                    const accentBg =
                      s.tone === "emerald"
                        ? "var(--emerald-50)"
                        : "var(--indigo-50)";
                    return (
                      <div
                        key={s.n}
                        style={{
                          position: "relative",
                          paddingLeft: 56,
                          marginBottom: i < steps.length - 1 ? 30 : 0,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: accent,
                            zIndex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 0 0 5px #fff, 0 0 0 7px ${accent}30`,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 10.5,
                              fontWeight: 800,
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 7,
                                background: accentBg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <s.icon size={13} style={{ color: accent }} />
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 15,
                                color: "var(--slate-900)",
                              }}
                            >
                              {s.title}
                            </div>
                          </div>
                          <p
                            style={{
                              fontSize: 13.5,
                              color: "var(--slate-500)",
                              lineHeight: 1.65,
                              margin: 0,
                              paddingLeft: 34,
                            }}
                          >
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES — white (flows with How it works, same zone) */}
      <section
        className="section"
        ref={featuresRef}
        style={{ scrollMarginTop: 84, background: "#F8F9FF" }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Everything you need"
              desc="DriftWatch is built to run quietly in the background and only ask for your attention when it matters."
            />
          </Reveal>
          {/* Bento grid — breaks "same box" monotony */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {/* Wide featured card — spans 2 cols */}
            <Reveal delay={0} style={{ gridColumn: "1 / span 2" }}>
              <div
                style={{
                  background: "linear-gradient(135deg,var(--indigo),#6366F1)",
                  borderRadius: 20,
                  padding: "28px 32px",
                  height: "100%",
                  display: "flex",
                  gap: 28,
                  alignItems: "center",
                  boxShadow: "0 8px 32px rgba(79,70,229,.28)",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "rgba(255,255,255,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon.Activity size={26} style={{ color: "#fff" }} />
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 19,
                      color: "#fff",
                      marginBottom: 8,
                    }}
                  >
                    Automated monitoring
                  </div>
                  <p
                    style={{
                      fontSize: 14.5,
                      color: "rgba(255,255,255,.72)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    Schedule checks from hourly to weekly. DriftWatch runs in
                    the background — watching your data while you focus on
                    everything else.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Card 2 — compact right */}
            <Reveal delay={90}>
              <div className="card feature-card" style={{ height: "100%" }}>
                <IconBadge icon={Icon.fileSheet} tone="emerald" />
                <div className="h3" style={{ marginBottom: 8 }}>
                  One-time scans
                </div>
                <p
                  style={{
                    fontSize: 14.5,
                    color: "var(--slate-500)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Upload a CSV and get a full anomaly report in seconds. No
                  login, nothing stored.
                </p>
              </div>
            </Reveal>

            {/* Cards 3-6 — normal 3-col row */}
            {[
              {
                icon: Icon.barChart,
                tone: "indigo",
                title: "Run history",
                desc: "Every check is logged on a timeline, so you can spot a pattern, not just a single incident.",
              },
              {
                icon: Icon.Cpu,
                tone: "amber",
                title: "AI explanations",
                desc: "Every alert comes with a clear written explanation of what changed and why it likely happened.",
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
                title: "Full control",
                desc: "Pause, resume, or delete any monitor in a click. Nothing runs without your say.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="card feature-card" style={{ height: "100%" }}>
                  <IconBadge icon={f.icon} tone={f.tone} />
                  <div className="h3" style={{ marginBottom: 8 }}>
                    {f.title}
                  </div>
                  <p
                    style={{
                      fontSize: 14.5,
                      color: "var(--slate-500)",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY — dark navy background, glass cards */}
      <section
        className="section bg-navy"
        ref={securityRef}
        style={{ scrollMarginTop: 84 }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Your data is yours. Always."
              desc="Every account is fully isolated — enforced independently at the app layer and the database layer."
              light
            />
          </Reveal>
          <div className="grid-4">
            {securityItems.map((s, i) => (
              <Reveal key={s.title} delay={i * 80} style={{ height: "100%" }}>
                <div className="glass-card" style={{ height: "100%" }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "rgba(79,70,229,.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <s.icon size={17} style={{ color: "#818CF8" }} />
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: "rgba(255,255,255,.3)",
                      marginBottom: 8,
                      letterSpacing: ".06em",
                    }}
                  >
                    {s.tag}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: "#fff",
                      marginBottom: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "rgba(255,255,255,.45)",
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

      {/* ── DETECTION — indigo-tinted gradient, colored cards per detector */}
      <section
        className="section"
        ref={detectionRef}
        style={{ background: "#fff", scrollMarginTop: 84 }}
      >
        <div className="container">
          <Reveal>
            <SectionHead
              title="Three ways of detecting drift"
              desc="Most tools watch for one type of problem. DriftWatch checks from three angles at once."
            />
          </Reveal>
          <div className="grid-3">
            {detectors.map((d, i) => (
              <Reveal key={d.title} delay={i * 100} style={{ height: "100%" }}>
                <div className={d.cls} style={{ height: "100%" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${d.iconColor}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <d.icon size={19} style={{ color: d.iconColor }} />
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: d.monoColor,
                      marginBottom: 8,
                      opacity: 0.8,
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
                      color: "var(--slate-600)",
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

      {/* ── CTA */}
      <section className="section cta-section">
        <div className="container">
          <Reveal>
            <div className="cta-panel">
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 className="h2" style={{ color: "#fff" }}>
                  Stop finding out about data problems too late
                </h2>
                <p
                  className="lede"
                  style={{
                    color: "rgba(255,255,255,.68)",
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
                    onClick={scrollToScan}
                  >
                    Try the free scan
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER */}
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
                  API Docs <Icon.ArrowRight size={13} />
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
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "#5d6577" }}>
              Built by <strong style={{ color: "#8a93a6" }}>Prajwal</strong> —
              Full Stack &amp; Data Platform Engineer
            </span>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#5d6577" }}>
                © {new Date().getFullYear()} DriftWatch
              </span>
              <a
                href="https://github.com/user1-prajwal/driftwatch"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 13,
                  color: "#5d6577",
                  textDecoration: "none",
                }}
              >
                GitHub
              </a>
              <a
                href="https://driftwatch-backend.onrender.com/docs"
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 13,
                  color: "#5d6577",
                  textDecoration: "none",
                }}
              >
                API Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── ROOT APP ─

export default function App() {
  const [page, setPage] = useState("landing"),
    [session, setSession] = useState(null),
    [showAuthModal, setShowAuthModal] = useState(false);
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  const handleStart = (p) => {
    if (p === "scan") {
      if (page !== "landing") setPage("landing");
      setTimeout(
        () =>
          document
            .getElementById("dw-scan")
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
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
