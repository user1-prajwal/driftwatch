// import { useState, useRef, useEffect } from "react";
// import MonitorsPage from "./MonitorsPage";
// import ScanPage from "./ScanPage";
// import AuthModal from "./AuthModal";
// import { supabase } from "./supabaseClient";
// import axios from "axios";

// // const SCAN_API = "http://localhost:8000";
// const SCAN_API = "https://driftwatch-backend.onrender.com";

// const GLOBAL_CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

// .dw{
//   --paper:#F6F3EC;
//   --paper-dim:#EFEBE0;
//   --paper-line:#DDD7C7;
//   --ink:#15181D;
//   --ink-soft:#2B2E33;
//   --body:#4B4C46;
//   --body-dim:#83817A;
//   --body-faint:#6E6A62;
//   --card:#FCFBF8;
//   --brick:#B5402F;
//   --brick-dim:#8F3225;
//   --brick-tint:#F4E3DE;
//   --pine:#33604A;
//   --pine-tint:#E1EBE2;
//   --ochre:#AD7C2A;
//   --ochre-tint:#F1E6D2;
//   --ink-invert:#F6F3EC;
//   --font-display:'Fraunces',Georgia,serif;
//   --font-sans:'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
//   --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
//   font-family:var(--font-sans);
//   color:var(--body);
//   background:var(--paper);
//   -webkit-font-smoothing:antialiased;
//   -moz-osx-font-smoothing:grayscale;
//   line-height:1.5;
// }
// .dw *{box-sizing:border-box;}
// .dw a{color:inherit;text-decoration:none;}
// .dw button{font-family:inherit;}
// .dw img,.dw svg{display:block;}
// .dw ::selection{background:var(--ink);color:var(--paper);}

// .container{max-width:1180px;margin:0 auto;padding:0 24px;}
// @media(min-width:640px){.container{padding:0 40px;}}
// .container-narrow{max-width:860px;margin:0 auto;padding:0 24px;}
// @media(min-width:640px){.container-narrow{padding:0 40px;}}

// .section{padding:clamp(56px,8vw,112px) 0;}
// .rule{border:none;border-top:1px solid var(--paper-line);margin:0;}
// .mono{font-family:var(--font-mono);}

// .eyebrow{font-family:var(--font-mono);font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--brick);display:flex;align-items:center;gap:9px;}
// .eyebrow::before{content:'';width:15px;height:1px;background:var(--brick);display:inline-block;}

// .h1{font-family:var(--font-display);font-size:clamp(34px,4.4vw,56px);font-weight:600;letter-spacing:-0.015em;line-height:1.08;color:var(--ink);margin:0;}
// .h2{font-family:var(--font-display);font-size:clamp(28px,3.4vw,42px);font-weight:600;letter-spacing:-0.01em;line-height:1.14;color:var(--ink);margin:0;}
// .h2-light{font-family:var(--font-display);font-size:clamp(28px,3.4vw,42px);font-weight:600;letter-spacing:-0.01em;line-height:1.14;color:var(--ink-invert);margin:0;}
// .h3{font-family:var(--font-display);font-size:20px;font-weight:600;letter-spacing:-0.005em;color:var(--ink);margin:0;}
// .lede{font-size:clamp(16px,1.5vw,18.5px);color:var(--body-dim);line-height:1.7;margin:0;}
// .lede-light{font-size:clamp(16px,1.5vw,18.5px);color:rgba(246,243,236,.62);line-height:1.7;margin:0;}
// .section-head{max-width:640px;margin:0 0 48px;}
// .section-head.center{margin-left:auto;margin-right:auto;text-align:center;}

// /* nav */
// .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(246,243,236,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid transparent;transition:border-color .2s ease;}
// .nav.scrolled{border-color:var(--paper-line);}
// .nav-inner{display:flex;align-items:center;height:64px;gap:28px;}
// .nav-links{display:none;align-items:center;gap:26px;flex:1;}
// @media(min-width:880px){.nav-links{display:flex;}}
// .nav-link{font-size:13.5px;font-weight:600;color:var(--body);transition:color .15s ease;background:none;border:none;cursor:pointer;padding:0;}
// .nav-link:hover{color:var(--ink);}
// .nav-actions{display:flex;align-items:center;gap:18px;margin-left:auto;}

// /* buttons — flat, hairline, no lift/bounce */
// .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:600;font-size:14px;border-radius:3px;padding:12px 20px;cursor:pointer;border:1px solid transparent;transition:background .15s ease,border-color .15s ease,color .15s ease;white-space:nowrap;}
// .btn-sm{padding:8px 15px;font-size:13px;}
// .btn-primary{background:var(--ink);color:var(--paper);border-color:var(--ink);}
// .btn-primary:hover{background:var(--brick);border-color:var(--brick);}
// .btn-outline{background:transparent;color:var(--ink);border-color:var(--ink);}
// .btn-outline:hover{background:var(--ink);color:var(--paper);}
// .btn-on-dark{background:var(--paper);color:var(--ink);border-color:var(--paper);}
// .btn-on-dark:hover{background:var(--brick);color:var(--paper);border-color:var(--brick);}
// .btn-outline-dark{background:transparent;color:var(--paper);border-color:rgba(246,243,236,.32);}
// .btn-outline-dark:hover{border-color:var(--paper);}
// .btn:focus-visible,.nav-link:focus-visible,a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--brick);outline-offset:2px;}

// /* grids */
// .hero-pad{padding-top:clamp(104px,16vw,116px);padding-bottom:clamp(40px,7vw,72px);}
// .hero-grid{display:grid;grid-template-columns:1fr;gap:56px;align-items:start;}
// @media(min-width:980px){.hero-grid{grid-template-columns:1.15fr .85fr;gap:48px;align-items:center;}}
// .grid-3{display:grid;grid-template-columns:1fr;gap:0;}
// @media(min-width:780px){.grid-3{grid-template-columns:repeat(3,1fr);}}
// .grid-4{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
// @media(min-width:780px){.grid-4{grid-template-columns:repeat(4,1fr);}}
// .footer-grid{display:grid;grid-template-columns:1fr;gap:40px;}
// @media(min-width:760px){.footer-grid{grid-template-columns:2fr 1fr 1fr;}}
// @media(min-width:940px){.how-grid{grid-template-columns:1.15fr .85fr!important;align-items:start;}}

// /* case-file rows — replaces bento/badge step markers with a ledger device */
// .file-row{display:grid;grid-template-columns:64px 1fr;gap:0;border-top:1px solid var(--paper-line);}
// .file-row:last-child{border-bottom:1px solid var(--paper-line);}
// .file-num{font-family:var(--font-mono);font-size:12px;color:var(--body-faint);padding:26px 0 26px 2px;}
// .file-body{padding:24px 4px 24px 20px;border-left:1px solid var(--paper-line);}
// @media(min-width:640px){.file-body{padding:26px 4px 26px 28px;}}

// /* problem panel — flat hairline card, no border-radius flourish */
// .problem-card{padding:28px 26px;border-top:2px solid var(--ink);background:var(--ink-soft);}
// .problem-card + .problem-card{border-left:1px solid rgba(246,243,236,.08);}
// @media(max-width:779px){.problem-card{border-left:2px solid var(--ink)!important;border-top:none;}.problem-card + .problem-card{border-left:2px solid var(--ink)!important;border-top:1px solid rgba(246,243,236,.1)!important;}}

// /* detector cards */
// .det-card{padding:28px 26px;background:var(--card);border:1px solid var(--paper-line);border-top:3px solid var(--tone,var(--ink));}

// /* feature ledger row */
// .feat-row{display:flex;gap:18px;padding:22px 0;border-top:1px solid var(--paper-line);align-items:flex-start;}
// .feat-row:last-child{border-bottom:1px solid var(--paper-line);}

// /* security tiles */
// .sec-tile{padding:24px 22px;background:#1B1F26;border:1px solid rgba(246,243,236,.08);}

// /* pills / status */
// .pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;font-weight:600;padding:3px 9px;border-radius:2px;letter-spacing:.02em;}
// .pill-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
// .pill-pine{background:var(--pine-tint);color:var(--pine);}
// .pill-ochre{background:var(--ochre-tint);color:var(--ochre);}
// .pill-brick{background:var(--brick-tint);color:var(--brick-dim);}

// /* reveal */
// .reveal{opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1);}
// .reveal.in-view{opacity:1;transform:translateY(0);}

// /* instrument — the signature hero element: a lab-style strip reading */
// .instrument{position:relative;background:var(--card);border:1px solid var(--paper-line);}
// .instrument-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--paper-line);}
// .instrument-body{padding:20px 20px 8px;}
// .instrument-foot{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid var(--paper-line);}
// .instrument-foot > div{padding:14px 18px;}
// .instrument-foot > div + div{border-left:1px solid var(--paper-line);}
// .reading-line{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 1.4s cubic-bezier(.4,0,.2,1) forwards .3s;}
// @keyframes draw{to{stroke-dashoffset:0;}}
// @keyframes spin{to{transform:rotate(360deg);}}
// @keyframes blink{0%,100%{opacity:1;}50%{opacity:.25;}}
// .live-dot{animation:blink 1.8s ease-in-out infinite;}

// /* scan tool chips */
// .col-chip{display:flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid var(--paper-line);cursor:pointer;user-select:none;transition:all .12s ease;background:var(--paper);}
// .col-chip.on{border-color:var(--ink);background:var(--paper-dim);}

// /* cta */
// .cta-section{padding-bottom:clamp(72px,10vw,124px);}
// .cta-panel{position:relative;overflow:hidden;background:var(--ink);padding:clamp(48px,7vw,76px) clamp(24px,6vw,56px);text-align:center;}
// .cta-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--brick);}

// @media(prefers-reduced-motion:reduce){
//   .reveal{transition:none!important;opacity:1!important;transform:none!important;}
//   .reading-line{animation:none!important;stroke-dashoffset:0!important;}
//   .live-dot{animation:none!important;}
// }
// `;

// // ─── ICONS ────

// function makeIcon(children, opts = {}) {
//   const sw = opts.strokeWidth || 1.5;
//   return function Ico({ size = 20, className = "", style = {} }) {
//     return (
//       <svg
//         width={size}
//         height={size}
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth={sw}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         className={className}
//         style={style}
//       >
//         {children}
//       </svg>
//     );
//   };
// }

// const Icon = {
//   Plug: makeIcon(
//     <>
//       <path d="M9 2v4M15 2v4M7.5 8h9a1.5 1.5 0 0 1 1.5 1.5v2A5.5 5.5 0 0 1 12.5 17h-1A5.5 5.5 0 0 1 6 11.5v-2A1.5 1.5 0 0 1 7.5 8Z" />
//       <path d="M12 17v3M9 22h6" />
//     </>,
//   ),
//   Activity: makeIcon(
//     <polyline points="2 14 7.5 14 10 7 14 19 16.5 14 22 14" />,
//   ),
//   Mail: makeIcon(
//     <>
//       <rect x="2.5" y="5" width="19" height="14" rx="1" />
//       <path d="m3 6.5 9 6.5 9-6.5" />
//     </>,
//   ),
//   Cpu: makeIcon(
//     <>
//       <rect x="7" y="7" width="10" height="10" rx="1" />
//       <path d="M10 10h4v4h-4z" />
//     </>,
//   ),
//   Clock: makeIcon(
//     <>
//       <circle cx="12" cy="12" r="9" />
//       <path d="M12 7v5l3.5 2" />
//     </>,
//   ),
//   trendDown: makeIcon(
//     <>
//       <polyline points="3 6 10 13 14 9 21 17" />
//       <polyline points="21 10 21 17 14 17" />
//     </>,
//   ),
//   AlertTriangle: makeIcon(
//     <>
//       <path d="M12 3.5 22 20H2L12 3.5Z" />
//       <path d="M12 10v4" />
//       <circle cx="12" cy="17.2" r="0.4" fill="currentColor" stroke="none" />
//     </>,
//   ),
//   Shield: makeIcon(
//     <path d="M12 3.5 19.5 6.3v5.6c0 4.7-3.1 7.6-7.5 9-4.4-1.4-7.5-4.3-7.5-9V6.3L12 3.5Z" />,
//   ),
//   key: makeIcon(
//     <>
//       <circle cx="8" cy="15" r="4.5" />
//       <path d="M11.2 11.8 19 4M16.2 7l2.8 2.8M19 4l2.5 2.5" />
//     </>,
//   ),
//   lock: makeIcon(
//     <>
//       <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
//       <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
//     </>,
//   ),
//   userCheck: makeIcon(
//     <>
//       <circle cx="9.5" cy="8" r="3.5" />
//       <path d="M3.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
//       <path d="m15.5 12.5 2 2 3.5-3.5" />
//     </>,
//   ),
//   ArrowRight: makeIcon(<path d="M4 12h16M13 5l7 7-7 7" />, {
//     strokeWidth: 1.7,
//   }),
//   ArrowUpRight: makeIcon(<path d="M7 17 17 7M8 7h9v9" />, { strokeWidth: 1.7 }),
//   Github: makeIcon(
//     <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.68-4.57 4.92.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />,
//   ),
//   fileSheet: makeIcon(
//     <>
//       <path d="M6 2.5h8L19 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 6 20V2.5Z" />
//       <path d="M14 2.5V8h5" />
//       <path d="M9 13h6M9 16.5h6M9 9.5h2" />
//     </>,
//   ),
//   barChart: makeIcon(<path d="M4 21V10M11 21V3M18 21v-7" />),
//   sliders: makeIcon(
//     <>
//       <path d="M4 6h9M17 6h3M4 18h3M11 18h9" />
//       <circle cx="14.5" cy="6" r="2.2" />
//       <circle cx="7.5" cy="18" r="2.2" />
//     </>,
//   ),
//   Check: makeIcon(
//     <>
//       <circle cx="12" cy="12" r="9" />
//       <path d="m8 12.5 2.5 2.5L16 9.5" />
//     </>,
//   ),
//   Upload: makeIcon(
//     <>
//       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//       <polyline points="17 8 12 3 7 8" />
//       <line x1="12" y1="3" x2="12" y2="15" />
//     </>,
//   ),
//   Pin: makeIcon(
//     <>
//       <circle cx="12" cy="10.5" r="2.6" />
//       <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21Z" />
//     </>,
//   ),
// };

// function Logo({ size = 26 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
//       <rect
//         x="0.5"
//         y="0.5"
//         width="31"
//         height="31"
//         fill="#15181D"
//         stroke="#15181D"
//       />
//       <path
//         d="M7 20.5 12 13l4 5 4.5-8L25 17"
//         stroke="#F6F3EC"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         fill="none"
//       />
//       <circle cx="16" cy="18" r="1.8" fill="#B5402F" />
//     </svg>
//   );
// }

// // ─── UTILITIES ────

// function smoothPath(points) {
//   if (points.length < 2) return "";
//   let d = `M ${points[0][0]} ${points[0][1]}`;
//   for (let i = 0; i < points.length - 1; i++) {
//     const p0 = points[i === 0 ? 0 : i - 1],
//       p1 = points[i],
//       p2 = points[i + 1],
//       p3 = points[i + 2 < points.length ? i + 2 : i + 1];
//     const cp1x = p1[0] + (p2[0] - p0[0]) / 6,
//       cp1y = p1[1] + (p2[1] - p0[1]) / 6;
//     const cp2x = p2[0] - (p3[0] - p1[0]) / 6,
//       cp2y = p2[1] - (p3[1] - p1[1]) / 6;
//     d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
//   }
//   return d;
// }

// function useReveal(threshold = 0.15) {
//   const ref = useRef(null);
//   const [visible, setVisible] = useState(false);
//   useEffect(() => {
//     const node = ref.current;
//     if (!node) return;
//     if (typeof IntersectionObserver === "undefined") {
//       setVisible(true);
//       return;
//     }
//     const obs = new IntersectionObserver(
//       ([e]) => {
//         if (e.isIntersecting) {
//           setVisible(true);
//           obs.unobserve(node);
//         }
//       },
//       { threshold, rootMargin: "0px 0px -60px 0px" },
//     );
//     obs.observe(node);
//     return () => obs.disconnect();
//   }, [threshold]);
//   return [ref, visible];
// }

// function Reveal({ children, delay = 0, className = "", style = {} }) {
//   const [ref, visible] = useReveal();
//   return (
//     <div
//       ref={ref}
//       className={`reveal ${visible ? "in-view" : ""} ${className}`}
//       style={{ transitionDelay: `${delay}ms`, ...style }}
//     >
//       {children}
//     </div>
//   );
// }

// // function SectionHead({ eyebrow, title, desc, light, center }) {
// //   return (
// //     <div className={`section-head ${center ? "center" : ""}`}>
// //       {eyebrow && <div className="eyebrow" style={{ marginBottom: 14, justifyContent: center ? "center" : "flex-start" }}>{eyebrow}</div>}
// //       {light ? <h2 className="h2-light">{title}</h2> : <h2 className="h2">{title}</h2>}
// //       {desc && (
// //         <p className={light ? "lede-light" : "lede"} style={{ marginTop: 14 }}>
// //           {desc}
// //         </p>
// //       )}
// //     </div>
// //   );
// // }

// // ─── STATUS / SCORING ────

// function statusMeta(s) {
//   const st = s || "";
//   if (st.includes("CRITICAL"))
//     return {
//       color: "#B5402F",
//       bg: "#F4E3DE",
//       border: "#DDBBAF",
//       text: "#8F3225",
//       label: "Critical",
//     };
//   if (st.includes("WARNING"))
//     return {
//       color: "#AD7C2A",
//       bg: "#F1E6D2",
//       border: "#DEC79A",
//       text: "#84611F",
//       label: "Warning",
//     };
//   if (st === "ERROR")
//     return {
//       color: "#95502A",
//       bg: "#F1E2D2",
//       border: "#D9BFA0",
//       text: "#753F20",
//       label: "Error",
//     };
//   return {
//     color: "#33604A",
//     bg: "#E1EBE2",
//     border: "#B9CCBB",
//     text: "#274A38",
//     label: "Normal",
//   };
// }
// function parseExp(text) {
//   if (!text) return null;
//   const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
//   const c = text.match(
//     /POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/,
//   );
//   const a = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
//   return {
//     what: w?.[1]?.trim() || null,
//     causes: c?.[1]?.trim()?.split("\n")?.filter(Boolean) || [],
//     action: a?.[1]?.trim() || null,
//   };
// }
// function calcScore(result) {
//   const cols = result?.columns || [];
//   if (!cols.length) return 100;
//   let p = 0;
//   cols.forEach((c) => {
//     const s = c.status || "";
//     if (s.includes("CRITICAL")) p += 25;
//     else if (s.includes("WARNING")) p += 12;
//     else if (s === "ERROR") p += 20;
//   });
//   return Math.max(0, 100 - p);
// }
// function scoreLabel(n) {
//   if (n >= 80) return { text: "Healthy", color: "#33604A" };
//   if (n >= 60) return { text: "Fair", color: "#AD7C2A" };
//   if (n >= 40) return { text: "Degraded", color: "#95502A" };
//   return { text: "Critical drift", color: "#B5402F" };
// }

// // ─── COLUMN CARD ────

// function ColumnCard({ col }) {
//   const [rcaOpen, setRcaOpen] = useState(false);
//   const meta = statusMeta(col.status),
//     exp = col.gemini_explanation ? parseExp(col.gemini_explanation) : null,
//     isOk = meta.label === "Normal";
//   const today = typeof col.today_value === "number" ? col.today_value : 0;
//   const baseline =
//     typeof col.baseline_mean === "number" && col.baseline_mean !== 0
//       ? col.baseline_mean
//       : 1;
//   const todayPct = Math.min((today / baseline) * 100, 100),
//     diffPct = ((today - baseline) / Math.abs(baseline)) * 100;
//   const shortInsight = exp?.what
//     ? exp.what.replace(/\n/g, " ").split(/(?<=[.!?])\s+/)[0]
//     : null;
//   return (
//     <div
//       style={{
//         background: "var(--card)",
//         border: "1px solid var(--paper-line)",
//         borderLeft: `3px solid ${meta.color}`,
//       }}
//     >
//       <div style={{ padding: "18px 20px" }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             marginBottom: 9,
//             gap: 8,
//           }}
//         >
//           <div
//             className="mono"
//             style={{
//               fontWeight: 600,
//               fontSize: 14,
//               color: "var(--ink)",
//               lineHeight: 1.3,
//             }}
//           >
//             {col.column === "row_anomaly" ? "overall_row_check" : col.column}
//           </div>
//           <span
//             style={{
//               background: meta.bg,
//               color: meta.text,
//               fontFamily: "var(--font-mono)",
//               padding: "2px 8px",
//               fontSize: 10.5,
//               fontWeight: 700,
//               flexShrink: 0,
//               letterSpacing: ".02em",
//               textTransform: "uppercase",
//             }}
//           >
//             {meta.label}
//           </span>
//         </div>
//         {col.change_text && (
//           <div
//             style={{
//               fontSize: 13,
//               color: "var(--body-dim)",
//               marginBottom: 13,
//               lineHeight: 1.5,
//             }}
//           >
//             {col.change_text}
//           </div>
//         )}
//         {col.type === "numeric" && col.today_value != null && (
//           <div style={{ marginBottom: 15 }}>
//             <div style={{ marginBottom: 8 }}>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   fontSize: 11,
//                   color: "var(--body-faint)",
//                   marginBottom: 4,
//                 }}
//               >
//                 <span>today</span>
//                 <span
//                   className="mono"
//                   style={{ fontWeight: 700, color: meta.text }}
//                 >
//                   {today.toLocaleString()}
//                 </span>
//               </div>
//               <div
//                 style={{
//                   background: "var(--paper-dim)",
//                   height: 5,
//                   overflow: "hidden",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: `${todayPct}%`,
//                     background: meta.color,
//                     height: 5,
//                     transition: "width .7s cubic-bezier(.4,0,.2,1)",
//                     minWidth: todayPct > 0 ? 3 : 0,
//                   }}
//                 />
//               </div>
//             </div>
//             <div style={{ marginBottom: 9 }}>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   fontSize: 11,
//                   color: "var(--body-faint)",
//                   marginBottom: 4,
//                 }}
//               >
//                 <span>baseline avg</span>
//                 <span
//                   className="mono"
//                   style={{ fontWeight: 700, color: "var(--body)" }}
//                 >
//                   {col.baseline_mean?.toLocaleString?.()}
//                 </span>
//               </div>
//               <div
//                 style={{
//                   background: "var(--paper-dim)",
//                   height: 5,
//                   overflow: "hidden",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "100%",
//                     background: "var(--paper-line)",
//                     height: 5,
//                   }}
//                 />
//               </div>
//             </div>
//             {!isOk && (
//               <div
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 5,
//                   background: meta.bg,
//                   padding: "3px 9px",
//                 }}
//               >
//                 <span
//                   style={{ fontSize: 12, color: meta.color, fontWeight: 800 }}
//                 >
//                   {today < baseline ? "\u25BC" : "\u25B2"}
//                 </span>
//                 <span
//                   className="mono"
//                   style={{ fontSize: 11.5, fontWeight: 700, color: meta.text }}
//                 >
//                   {Math.abs(diffPct).toFixed(1)}%{" "}
//                   {today < baseline ? "below" : "above"} usual
//                 </span>
//               </div>
//             )}
//           </div>
//         )}
//         {shortInsight && (
//           <div
//             style={{
//               background: "var(--paper-dim)",
//               borderLeft: "2px solid var(--ink)",
//               padding: "10px 13px",
//               marginBottom: 11,
//             }}
//           >
//             <div
//               className="mono"
//               style={{
//                 fontSize: 10,
//                 fontWeight: 700,
//                 color: "var(--body-dim)",
//                 letterSpacing: ".07em",
//                 marginBottom: 5,
//                 textTransform: "uppercase",
//               }}
//             >
//               reading
//             </div>
//             <p
//               style={{
//                 fontSize: 13,
//                 color: "var(--ink-soft)",
//                 margin: 0,
//                 lineHeight: 1.6,
//               }}
//             >
//               {shortInsight}
//             </p>
//           </div>
//         )}
//         {exp && (exp.what || exp.causes?.length > 0 || exp.action) && (
//           <div
//             style={{ borderTop: "1px solid var(--paper-line)", paddingTop: 11 }}
//           >
//             <button
//               onClick={() => setRcaOpen((o) => !o)}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 7,
//                 width: "100%",
//                 background: "transparent",
//                 border: "none",
//                 cursor: "pointer",
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: "var(--body-dim)",
//                 padding: 0,
//                 fontFamily: "inherit",
//               }}
//             >
//               <span style={{ fontSize: 10 }}>
//                 {rcaOpen ? "\u25B2" : "\u25BC"}
//               </span>
//               Root cause analysis
//               <span
//                 style={{
//                   marginLeft: "auto",
//                   fontSize: 11,
//                   color: "var(--body-faint)",
//                   fontWeight: 400,
//                 }}
//               >
//                 {rcaOpen ? "Collapse" : "Expand"}
//               </span>
//             </button>
//             {rcaOpen && (
//               <div style={{ marginTop: 13 }}>
//                 {exp.what && (
//                   <p
//                     style={{
//                       fontSize: 13,
//                       color: "var(--ink-soft)",
//                       lineHeight: 1.65,
//                       margin: "0 0 11px",
//                     }}
//                   >
//                     {exp.what}
//                   </p>
//                 )}
//                 {exp.causes?.length > 0 && (
//                   <div style={{ marginBottom: 11 }}>
//                     <div
//                       className="mono"
//                       style={{
//                         fontSize: 10.5,
//                         fontWeight: 700,
//                         color: "var(--body-faint)",
//                         letterSpacing: ".06em",
//                         marginBottom: 7,
//                         textTransform: "uppercase",
//                       }}
//                     >
//                       possible causes
//                     </div>
//                     {exp.causes.map((c, i) => (
//                       <div
//                         key={i}
//                         style={{
//                           display: "flex",
//                           gap: 8,
//                           alignItems: "flex-start",
//                           marginBottom: 5,
//                         }}
//                       >
//                         <span
//                           className="mono"
//                           style={{
//                             color: "var(--brick)",
//                             fontWeight: 700,
//                             flexShrink: 0,
//                             marginTop: 1,
//                             fontSize: 12,
//                           }}
//                         >
//                           {i + 1}
//                         </span>
//                         <span
//                           style={{
//                             fontSize: 13,
//                             color: "var(--body)",
//                             lineHeight: 1.6,
//                           }}
//                         >
//                           {c.replace(/^\d+\.\s*/, "")}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 {exp.action && (
//                   <div
//                     style={{
//                       background: "var(--paper-dim)",
//                       padding: "10px 13px",
//                       borderLeft: "2px solid var(--brick)",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: 8,
//                         alignItems: "flex-start",
//                       }}
//                     >
//                       <span
//                         style={{
//                           color: "var(--brick)",
//                           fontWeight: 700,
//                           flexShrink: 0,
//                         }}
//                       >
//                         {"\u2192"}
//                       </span>
//                       <span
//                         style={{
//                           fontSize: 12.5,
//                           color: "var(--ink-soft)",
//                           fontWeight: 500,
//                           lineHeight: 1.6,
//                         }}
//                       >
//                         {exp.action}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── HEALTH SCORE HEADER ────

// function HealthScoreHeader({ result, score, execTime }) {
//   const lbl = scoreLabel(score),
//     analyzed = result?.summary?.total_columns || (result?.columns || []).length,
//     flagged =
//       (result?.summary?.critical || 0) + (result?.summary?.warnings || 0);
//   const R = 32,
//     circ = 2 * Math.PI * R;
//   return (
//     <div
//       style={{
//         background: "var(--ink)",
//         padding: "22px 24px",
//         marginBottom: 1,
//         display: "grid",
//         gridTemplateColumns: "auto 1fr",
//         gap: 22,
//         alignItems: "center",
//       }}
//     >
//       <div
//         style={{ position: "relative", width: 74, height: 74, flexShrink: 0 }}
//       >
//         <svg width="74" height="74" viewBox="0 0 74 74">
//           <circle
//             cx="37"
//             cy="37"
//             r={R}
//             fill="none"
//             stroke="rgba(246,243,236,.12)"
//             strokeWidth="5"
//           />
//           <circle
//             cx="37"
//             cy="37"
//             r={R}
//             fill="none"
//             stroke={lbl.color}
//             strokeWidth="5"
//             strokeLinecap="butt"
//             strokeDasharray={circ}
//             strokeDashoffset={circ * (1 - score / 100)}
//             transform="rotate(-90 37 37)"
//             style={{
//               transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)",
//             }}
//           />
//         </svg>
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <span
//             className="mono"
//             style={{
//               fontWeight: 700,
//               fontSize: 17,
//               color: "var(--paper)",
//               lineHeight: 1,
//             }}
//           >
//             {score}
//           </span>
//           <span
//             className="mono"
//             style={{ fontSize: 9, color: "rgba(246,243,236,.4)", marginTop: 2 }}
//           >
//             /100
//           </span>
//         </div>
//       </div>
//       <div>
//         <div
//           style={{
//             fontFamily: "var(--font-display)",
//             fontWeight: 600,
//             fontSize: 18,
//             color: "var(--paper)",
//             marginBottom: 7,
//           }}
//         >
//           System health — <span style={{ color: lbl.color }}>{lbl.text}</span>
//         </div>
//         <div
//           className="mono"
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "5px 16px",
//             fontSize: 12,
//             color: "rgba(246,243,236,.5)",
//             marginBottom: 11,
//           }}
//         >
//           <span>{analyzed} columns analyzed</span>
//           <span style={{ color: "rgba(246,243,236,.2)" }}>/</span>
//           <span>{flagged} anomalies flagged</span>
//           {execTime && (
//             <>
//               <span style={{ color: "rgba(246,243,236,.2)" }}>/</span>
//               <span>{execTime}ms</span>
//             </>
//           )}
//         </div>
//         <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
//           {[
//             {
//               label: `${result?.summary?.critical || 0} critical`,
//               c: "#D9897B",
//             },
//             {
//               label: `${result?.summary?.warnings || 0} warnings`,
//               c: "#D9BC7E",
//             },
//             { label: `${result?.summary?.normal || 0} normal`, c: "#8FB89C" },
//           ].map((p) => (
//             <span
//               key={p.label}
//               className="mono"
//               style={{
//                 fontSize: 11,
//                 fontWeight: 600,
//                 padding: "3px 9px",
//                 background: "rgba(246,243,236,.06)",
//                 color: p.c,
//               }}
//             >
//               {p.label}
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function FullResultsDashboard({ result, execTime, onStart }) {
//   const score = calcScore(result),
//     cols = result?.columns || [],
//     hasBad =
//       (result?.summary?.critical || 0) > 0 ||
//       (result?.summary?.warnings || 0) > 0;
//   return (
//     <div>
//       <HealthScoreHeader result={result} score={score} execTime={execTime} />
//       {cols.length === 0 && (
//         <div
//           style={{
//             padding: "36px 24px",
//             textAlign: "center",
//             background: "var(--pine-tint)",
//             border: "1px solid var(--paper-line)",
//             borderTop: "none",
//           }}
//         >
//           <Icon.Check
//             size={28}
//             style={{ color: "var(--pine)", margin: "0 auto 12px" }}
//           />
//           <div
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 17,
//               color: "var(--pine)",
//               marginBottom: 4,
//             }}
//           >
//             All columns look normal
//           </div>
//           <div style={{ fontSize: 13, color: "var(--body-dim)" }}>
//             No anomalies detected in this scan.
//           </div>
//         </div>
//       )}
//       {cols.length > 0 && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
//             gap: 1,
//             background: "var(--paper-line)",
//             border: "1px solid var(--paper-line)",
//             borderTop: "none",
//             marginBottom: hasBad ? 1 : 0,
//           }}
//         >
//           {cols.map((col, i) => (
//             <ColumnCard key={i} col={col} />
//           ))}
//         </div>
//       )}
//       {hasBad && (
//         <div
//           style={{
//             background: "var(--ink)",
//             padding: "28px 26px",
//             textAlign: "center",
//           }}
//         >
//           <div
//             style={{
//               fontFamily: "var(--font-mono)",
//               fontSize: 11,
//               color: "var(--brick)",
//               letterSpacing: ".07em",
//               textTransform: "uppercase",
//               marginBottom: 12,
//             }}
//           >
//             This is a one-time scan
//           </div>
//           <div
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 19,
//               color: "var(--paper)",
//               marginBottom: 9,
//             }}
//           >
//             DriftWatch caught something. Want it watched continuously?
//           </div>
//           <p
//             style={{
//               fontSize: 13.5,
//               color: "rgba(246,243,236,.55)",
//               maxWidth: 400,
//               margin: "0 auto 22px",
//               lineHeight: 1.65,
//             }}
//           >
//             Set up a monitor on this source and get an email the moment this
//             pattern happens again.
//           </p>
//           <button
//             className="btn btn-on-dark"
//             onClick={() => onStart && onStart("monitor")}
//           >
//             Set up a monitor <Icon.ArrowRight size={15} />
//           </button>
//           <div
//             className="mono"
//             style={{
//               fontSize: 11,
//               color: "rgba(246,243,236,.4)",
//               marginTop: 12,
//             }}
//           >
//             free to start / two minutes / no card required
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── INSTRUMENT — signature hero element ────

// function Instrument() {
//   const points = [
//     [8, 58],
//     [40, 50],
//     [72, 54],
//     [104, 44],
//     [136, 50],
//     [168, 46],
//     [200, 96],
//     [232, 84],
//     [264, 79],
//     [296, 74],
//   ];
//   const linePath = smoothPath(points),
//     baselinePath = smoothPath(
//       points.map(([x], i) => [x, [56, 50, 52, 45, 49, 47, 51, 48, 50, 46][i]]),
//     ),
//     anomaly = points[6];
//   return (
//     <div className="instrument">
//       <div className="instrument-head">
//         <div>
//           <div
//             className="mono"
//             style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}
//           >
//             daily_sales.csv
//           </div>
//           <div
//             className="mono"
//             style={{ fontSize: 10.5, color: "var(--body-faint)", marginTop: 2 }}
//           >
//             google sheet · checked every 24h
//           </div>
//         </div>
//         <span className="pill pill-pine">
//           <span
//             className="pill-dot live-dot"
//             style={{ background: "currentColor" }}
//           />
//           watching
//         </span>
//       </div>
//       <div className="instrument-body">
//         <svg
//           viewBox="0 0 304 118"
//           style={{ width: "100%", height: "auto" }}
//           role="img"
//           aria-label="Strip chart showing daily sales dropping sharply below baseline on day six"
//         >
//           <line
//             x1="0"
//             y1="98"
//             x2="304"
//             y2="98"
//             stroke="var(--paper-line)"
//             strokeWidth="1"
//           />
//           <line
//             x1="0"
//             y1="66"
//             x2="304"
//             y2="66"
//             stroke="var(--paper-line)"
//             strokeWidth="1"
//             strokeDasharray="2 3"
//           />
//           <path
//             d={baselinePath}
//             fill="none"
//             stroke="var(--body-faint)"
//             strokeWidth="1.25"
//             strokeDasharray="3 3"
//             opacity="0.7"
//           />
//           <path
//             d={linePath}
//             fill="none"
//             stroke="var(--ink)"
//             strokeWidth="2"
//             strokeLinecap="round"
//             className="reading-line"
//           />
//           <line
//             x1={anomaly[0]}
//             y1={anomaly[1]}
//             x2={anomaly[0]}
//             y2="98"
//             stroke="var(--brick)"
//             strokeWidth="1"
//             strokeDasharray="2 2"
//             opacity="0.55"
//           />
//           <circle
//             cx={anomaly[0]}
//             cy={anomaly[1]}
//             r="4"
//             fill="var(--card)"
//             stroke="var(--brick)"
//             strokeWidth="2"
//           />
//           <text
//             x={anomaly[0] + 8}
//             y={anomaly[1] - 6}
//             className="mono"
//             fontSize="9.5"
//             fill="#8F3225"
//             fontWeight="600"
//           >
//             -83% vs baseline
//           </text>
//         </svg>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginTop: 2,
//             paddingBottom: 14,
//           }}
//         >
//           <span
//             className="mono"
//             style={{ fontSize: 9.5, color: "var(--body-faint)" }}
//           >
//             mon
//           </span>
//           <span
//             className="mono"
//             style={{ fontSize: 9.5, color: "var(--body-faint)" }}
//           >
//             sun
//           </span>
//         </div>
//       </div>
//       <div className="instrument-foot">
//         <div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 9.5,
//               color: "var(--body-faint)",
//               textTransform: "uppercase",
//               letterSpacing: ".04em",
//             }}
//           >
//             detector
//           </div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 12,
//               fontWeight: 600,
//               color: "var(--ink)",
//               marginTop: 3,
//             }}
//           >
//             trend check
//           </div>
//         </div>
//         <div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 9.5,
//               color: "var(--body-faint)",
//               textTransform: "uppercase",
//               letterSpacing: ".04em",
//             }}
//           >
//             rows scanned
//           </div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 12,
//               fontWeight: 600,
//               color: "var(--ink)",
//               marginTop: 3,
//             }}
//           >
//             12,480
//           </div>
//         </div>
//         <div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 9.5,
//               color: "var(--body-faint)",
//               textTransform: "uppercase",
//               letterSpacing: ".04em",
//             }}
//           >
//             alert sent
//           </div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 12,
//               fontWeight: 600,
//               color: "var(--brick)",
//               marginTop: 3,
//             }}
//           >
//             09:02 am
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function HeroScanTool({ onScanComplete }) {
//   const [stage, setStage] = useState("upload"),
//     [file, setFile] = useState(null),
//     [cols, setCols] = useState([]);
//   const [dateCol, setDateCol] = useState(""),
//     [selCols, setSelCols] = useState([]),
//     [context, setContext] = useState("");
//   const [sens, setSens] = useState("medium"),
//     [drag, setDrag] = useState(false),
//     [err, setErr] = useState("");
//   const [busy, setBusy] = useState(false),
//     [result, setResult] = useState(null);
//   const nonDate = cols.filter((c) => c !== dateCol);
//   const processFile = async (f) => {
//     if (!f?.name?.endsWith(".csv")) {
//       setErr("Upload a .csv file.");
//       return;
//     }
//     setFile(f);
//     setErr("");
//     setBusy(true);
//     const form = new FormData();
//     form.append("file", f);
//     try {
//       const res = await axios.post(SCAN_API + "/columns", form);
//       const c = res.data.columns || [];
//       if (!c.length) {
//         setErr("No columns found.");
//         setBusy(false);
//         return;
//       }
//       setCols(c);
//       const dg = c.find((x) => /date|time/i.test(x)) || c[0];
//       setDateCol(dg || "");
//       setSelCols(c.filter((x) => x !== dg));
//       setStage("columns");
//     } catch {
//       setErr("Could not read file. Is it a valid CSV?");
//     } finally {
//       setBusy(false);
//     }
//   };
//   const runScan = async () => {
//     if (!selCols.length) {
//       setErr("Select at least one column.");
//       return;
//     }
//     setStage("processing");
//     setErr("");
//     const t0 = Date.now();
//     const form = new FormData();
//     form.append("file", file);
//     form.append("date_column", dateCol);
//     form.append("context", context || "data monitoring");
//     form.append("sensitivity", sens);
//     form.append("monitor_columns", selCols.join(","));
//     try {
//       const res = await axios.post(SCAN_API + "/scan", form);
//       const ms = Date.now() - t0;
//       setResult(res.data);
//       setStage("done");
//       onScanComplete(res.data, ms);
//     } catch (e) {
//       setErr(
//         e.response?.data?.detail || "Scan failed. Is the backend running?",
//       );
//       setStage("configure");
//     }
//   };
//   const reset = () => {
//     setStage("upload");
//     setFile(null);
//     setCols([]);
//     setDateCol("");
//     setSelCols([]);
//     setContext("");
//     setResult(null);
//     setErr("");
//   };
//   const score = result ? calcScore(result) : null,
//     lbl = score !== null ? scoreLabel(score) : null;
//   const card = {
//     background: "var(--card)",
//     border: "1px solid var(--paper-line)",
//     padding: "22px 22px",
//   };
//   return (
//     <div style={{ width: "100%" }}>
//       {stage === "upload" && (
//         <div
//           onDragOver={(e) => {
//             e.preventDefault();
//             setDrag(true);
//           }}
//           onDragLeave={() => setDrag(false)}
//           onDrop={(e) => {
//             e.preventDefault();
//             setDrag(false);
//             processFile(e.dataTransfer.files[0]);
//           }}
//           onClick={() => document.getElementById("dw-hero-csv")?.click()}
//           style={{
//             border: `1.5px dashed ${drag ? "var(--ink)" : "var(--body-faint)"}`,
//             padding: "40px 24px",
//             textAlign: "center",
//             cursor: "pointer",
//             background: drag ? "var(--paper-dim)" : "var(--card)",
//             transition: "all .15s ease",
//           }}
//         >
//           {busy ? (
//             <div>
//               <div
//                 style={{
//                   width: 40,
//                   height: 40,
//                   background: "var(--paper-dim)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   margin: "0 auto 14px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 18,
//                     height: 18,
//                     border: "2.5px solid var(--ink)",
//                     borderTopColor: "transparent",
//                     borderRadius: "50%",
//                     animation: "spin 1s linear infinite",
//                   }}
//                 />
//               </div>
//               <div
//                 className="mono"
//                 style={{ fontWeight: 600, color: "var(--body)", fontSize: 13 }}
//               >
//                 reading file…
//               </div>
//             </div>
//           ) : (
//             <>
//               <div
//                 style={{
//                   width: 48,
//                   height: 48,
//                   background: drag ? "var(--paper-line)" : "var(--paper-dim)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   margin: "0 auto 16px",
//                   transition: "background .15s",
//                 }}
//               >
//                 <Icon.Upload
//                   size={22}
//                   style={{ color: drag ? "var(--ink)" : "var(--body-faint)" }}
//                 />
//               </div>
//               <div
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontWeight: 600,
//                   fontSize: 18,
//                   color: "var(--ink)",
//                   marginBottom: 6,
//                 }}
//               >
//                 {drag ? "Drop it here" : "Scan a CSV"}
//               </div>
//               <div
//                 style={{
//                   fontSize: 13.5,
//                   color: "var(--body-faint)",
//                   marginBottom: 18,
//                 }}
//               >
//                 Drag and drop, or click to browse
//               </div>
//               <div
//                 className="mono"
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 6,
//                   background: "var(--paper-dim)",
//                   border: "1px solid var(--paper-line)",
//                   padding: "5px 12px",
//                   fontSize: 11,
//                 }}
//               >
//                 <Icon.Shield size={12} /> stateless — runs in memory, nothing
//                 stored
//               </div>
//             </>
//           )}
//           <input
//             id="dw-hero-csv"
//             type="file"
//             accept=".csv"
//             style={{ display: "none" }}
//             onChange={(e) => processFile(e.target.files[0])}
//           />
//         </div>
//       )}
//       {err && (
//         <div
//           style={{
//             marginTop: 10,
//             padding: "9px 13px",
//             background: "var(--brick-tint)",
//             color: "var(--brick-dim)",
//             fontSize: 13,
//             display: "flex",
//             gap: 7,
//             alignItems: "center",
//           }}
//         >
//           <Icon.AlertTriangle size={13} />
//           {err}
//         </div>
//       )}
//       {stage === "columns" && (
//         <div style={card}>
//           <div
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 16,
//               color: "var(--ink)",
//               marginBottom: 3,
//             }}
//           >
//             Choose what to scan
//           </div>
//           <div
//             className="mono"
//             style={{
//               fontSize: 12,
//               color: "var(--body-faint)",
//               marginBottom: 15,
//             }}
//           >
//             <span style={{ color: "var(--body)" }}>{file?.name}</span> ·{" "}
//             {cols.length} columns
//           </div>
//           <div style={{ marginBottom: 15 }}>
//             <div
//               className="mono"
//               style={{
//                 fontSize: 11,
//                 fontWeight: 600,
//                 color: "var(--body-dim)",
//                 marginBottom: 7,
//                 textTransform: "uppercase",
//                 letterSpacing: ".03em",
//               }}
//             >
//               Date column
//             </div>
//             <select
//               value={dateCol}
//               onChange={(e) => {
//                 setDateCol(e.target.value);
//                 setSelCols(cols.filter((c) => c !== e.target.value));
//               }}
//               style={{
//                 width: "100%",
//                 padding: "9px 12px",
//                 border: "1px solid var(--paper-line)",
//                 fontSize: 13,
//                 outline: "none",
//                 background: "var(--paper)",
//                 fontFamily: "var(--font-mono)",
//               }}
//             >
//               {cols.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div style={{ marginBottom: 17 }}>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 9,
//               }}
//             >
//               <div
//                 className="mono"
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   color: "var(--body-dim)",
//                   textTransform: "uppercase",
//                   letterSpacing: ".03em",
//                 }}
//               >
//                 Columns to scan
//               </div>
//               <button
//                 onClick={() =>
//                   setSelCols(selCols.length === nonDate.length ? [] : nonDate)
//                 }
//                 style={{
//                   fontSize: 11.5,
//                   color: "var(--brick)",
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   fontWeight: 600,
//                   fontFamily: "inherit",
//                 }}
//               >
//                 {selCols.length === nonDate.length
//                   ? "Deselect all"
//                   : "Select all"}
//               </button>
//             </div>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 6,
//               }}
//             >
//               {nonDate.map((col) => {
//                 const on = selCols.includes(col);
//                 return (
//                   <div
//                     key={col}
//                     onClick={() =>
//                       setSelCols((p) =>
//                         on ? p.filter((c) => c !== col) : [...p, col],
//                       )
//                     }
//                     className={`col-chip ${on ? "on" : ""}`}
//                   >
//                     <div
//                       style={{
//                         width: 13,
//                         height: 13,
//                         flexShrink: 0,
//                         border: on
//                           ? "1.5px solid var(--ink)"
//                           : "1.5px solid var(--body-faint)",
//                         background: on ? "var(--ink)" : "transparent",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       {on && (
//                         <span
//                           style={{
//                             color: "var(--paper)",
//                             fontSize: 8,
//                             fontWeight: 900,
//                           }}
//                         >
//                           ✓
//                         </span>
//                       )}
//                     </div>
//                     <span
//                       className="mono"
//                       style={{
//                         fontSize: 11.5,
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                         fontWeight: on ? 600 : 400,
//                         color: on ? "var(--ink)" : "var(--body-dim)",
//                       }}
//                     >
//                       {col}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//             {selCols.length === 0 && (
//               <div
//                 style={{
//                   marginTop: 8,
//                   fontSize: 12.5,
//                   color: "var(--ochre)",
//                   fontWeight: 500,
//                 }}
//               >
//                 Pick at least one column.
//               </div>
//             )}
//           </div>
//           <div style={{ display: "flex", gap: 8 }}>
//             <button
//               onClick={() => {
//                 setStage("upload");
//                 setCols([]);
//                 setFile(null);
//               }}
//               className="btn btn-outline btn-sm"
//               style={{ borderColor: "var(--paper-line)", color: "var(--body)" }}
//             >
//               Back
//             </button>
//             <button
//               onClick={() => {
//                 if (!selCols.length) return setErr("Pick at least one column.");
//                 setErr("");
//                 setStage("configure");
//               }}
//               className="btn btn-primary"
//               style={{ flex: 1, padding: "10px" }}
//             >
//               Continue <Icon.ArrowRight size={14} />
//             </button>
//           </div>
//         </div>
//       )}
//       {stage === "configure" && (
//         <div style={card}>
//           <div
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 16,
//               color: "var(--ink)",
//               marginBottom: 3,
//             }}
//           >
//             Final settings
//           </div>
//           <div
//             style={{
//               fontSize: 13,
//               color: "var(--body-faint)",
//               marginBottom: 15,
//             }}
//           >
//             Scanning {selCols.length} column{selCols.length !== 1 ? "s" : ""}:{" "}
//             <span className="mono">{selCols.join(", ")}</span>
//           </div>
//           <div style={{ marginBottom: 15 }}>
//             <label
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: "var(--body-dim)",
//                 display: "block",
//                 marginBottom: 7,
//               }}
//             >
//               What is this data?{" "}
//               <span style={{ fontWeight: 400, color: "var(--body-faint)" }}>
//                 optional
//               </span>
//             </label>
//             <input
//               type="text"
//               value={context}
//               onChange={(e) => setContext(e.target.value)}
//               placeholder="e.g. daily sales of an online store"
//               style={{
//                 width: "100%",
//                 padding: "9px 12px",
//                 border: "1px solid var(--paper-line)",
//                 fontSize: 13,
//                 outline: "none",
//                 background: "var(--paper)",
//                 fontFamily: "inherit",
//               }}
//             />
//           </div>
//           <div style={{ marginBottom: 18 }}>
//             <div
//               style={{
//                 fontSize: 12,
//                 fontWeight: 600,
//                 color: "var(--body-dim)",
//                 marginBottom: 8,
//               }}
//             >
//               Detection sensitivity
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 gap: 0,
//                 border: "1px solid var(--paper-line)",
//               }}
//             >
//               {[
//                 { k: "low", l: "Low", d: "Big changes only" },
//                 { k: "medium", l: "Medium", d: "Moderate drift" },
//                 { k: "high", l: "High", d: "Small drifts" },
//               ].map((o, i) => (
//                 <button
//                   key={o.k}
//                   onClick={() => setSens(o.k)}
//                   style={{
//                     flex: 1,
//                     padding: "9px 6px",
//                     fontFamily: "inherit",
//                     border: "none",
//                     borderLeft: i > 0 ? "1px solid var(--paper-line)" : "none",
//                     background: sens === o.k ? "var(--ink)" : "transparent",
//                     color: sens === o.k ? "var(--paper)" : "var(--body)",
//                     cursor: "pointer",
//                     fontSize: 12,
//                   }}
//                 >
//                   <div style={{ fontWeight: 700 }}>{o.l}</div>
//                   <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
//                     {o.d}
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>
//           {err && (
//             <div
//               style={{
//                 color: "var(--brick)",
//                 fontSize: 12.5,
//                 marginBottom: 10,
//                 display: "flex",
//                 gap: 6,
//                 alignItems: "center",
//               }}
//             >
//               <Icon.AlertTriangle size={13} />
//               {err}
//             </div>
//           )}
//           <div style={{ display: "flex", gap: 8 }}>
//             <button
//               onClick={() => setStage("columns")}
//               className="btn btn-outline btn-sm"
//               style={{ borderColor: "var(--paper-line)", color: "var(--body)" }}
//             >
//               Back
//             </button>
//             <button
//               onClick={runScan}
//               className="btn btn-primary"
//               style={{ flex: 1, padding: "10px" }}
//             >
//               Detect anomalies <Icon.ArrowRight size={14} />
//             </button>
//           </div>
//         </div>
//       )}
//       {stage === "processing" && (
//         <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
//           <div
//             style={{
//               width: 48,
//               height: 48,
//               background: "var(--paper-dim)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 18px",
//             }}
//           >
//             <div
//               style={{
//                 width: 20,
//                 height: 20,
//                 border: "2.5px solid var(--ink)",
//                 borderTopColor: "transparent",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite",
//               }}
//             />
//           </div>
//           <div
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 17,
//               color: "var(--ink)",
//               marginBottom: 6,
//             }}
//           >
//             Analysing your data…
//           </div>
//           <div
//             className="mono"
//             style={{ fontSize: 12, color: "var(--body-faint)" }}
//           >
//             checking trends, categories, and outliers
//           </div>
//         </div>
//       )}
//       {stage === "done" && result && (
//         <div style={{ ...card, borderTop: `3px solid ${lbl.color}` }}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 16,
//               marginBottom: 15,
//             }}
//           >
//             <div
//               className="mono"
//               style={{
//                 fontSize: 26,
//                 fontWeight: 700,
//                 color: lbl.color,
//                 minWidth: 56,
//               }}
//             >
//               {score}
//             </div>
//             <div>
//               <div
//                 className="mono"
//                 style={{
//                   fontSize: 10,
//                   color: "var(--body-faint)",
//                   marginBottom: 2,
//                   textTransform: "uppercase",
//                   letterSpacing: ".04em",
//                 }}
//               >
//                 health score / 100
//               </div>
//               <div
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontWeight: 600,
//                   fontSize: 17,
//                   color: lbl.color,
//                 }}
//               >
//                 {lbl.text}
//               </div>
//             </div>
//           </div>
//           <div
//             style={{
//               fontSize: 13,
//               color: "var(--body-dim)",
//               marginBottom: 15,
//               lineHeight: 1.5,
//             }}
//           >
//             {(result?.summary?.critical || 0) +
//               (result?.summary?.warnings || 0)}{" "}
//             anomal
//             {(result?.summary?.critical || 0) +
//               (result?.summary?.warnings || 0) ===
//             1
//               ? "y"
//               : "ies"}{" "}
//             found across {result?.summary?.total_columns || selCols.length}{" "}
//             column{selCols.length !== 1 ? "s" : ""}
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               fontSize: 13,
//               color: "var(--brick)",
//               fontWeight: 600,
//             }}
//           >
//             <span style={{ fontSize: 15 }}>↓</span> Full analysis below
//           </div>
//           <button
//             onClick={reset}
//             className="mono"
//             style={{
//               marginTop: 12,
//               fontSize: 11.5,
//               color: "var(--body-faint)",
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               padding: 0,
//               textDecoration: "underline",
//             }}
//           >
//             Scan another file
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ---- LANDING PAGE ----

// function Nav({ onStart, refs, session }) {
//   const [scrolled, setScrolled] = useState(false);
//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 8);
//     fn();
//     window.addEventListener("scroll", fn, { passive: true });
//     return () => window.removeEventListener("scroll", fn);
//   }, []);
//   const goTo = (ref) =>
//     ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   return (
//     <nav className={"nav " + (scrolled ? "scrolled" : "")}>
//       <div className="container nav-inner">
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <Logo />
//           <span
//             style={{
//               fontFamily: "var(--font-display)",
//               fontWeight: 600,
//               fontSize: 17,
//               color: "var(--ink)",
//               letterSpacing: "-0.005em",
//             }}
//           >
//             DriftWatch
//           </span>
//         </div>
//         <div className="nav-links">
//           <button className="nav-link" onClick={() => goTo(refs.problem)}>
//             Why it exists
//           </button>
//           <button className="nav-link" onClick={() => goTo(refs.how)}>
//             How it works
//           </button>
//           <button className="nav-link" onClick={() => goTo(refs.detection)}>
//             Detection
//           </button>
//           <button className="nav-link" onClick={() => goTo(refs.security)}>
//             Security
//           </button>
//         </div>
//         <div className="nav-actions">
//           {session ? (
//             <button
//               className="btn btn-primary btn-sm"
//               onClick={() => onStart("monitor")}
//             >
//               Dashboard
//             </button>
//           ) : (
//             <>
//               <button className="nav-link" onClick={() => onStart("login")}>
//                 Log in
//               </button>
//               <button
//                 className="btn btn-primary btn-sm"
//                 onClick={() => onStart("signup")}
//               >
//                 Sign up
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

// const CASE_FILE = [
//   {
//     icon: Icon.Plug,
//     title: "Point it at a source",
//     desc: "Link a Google Sheet or upload a CSV. No pipeline to build, no engineer to loop in first.",
//     note: "takes under a minute",
//   },
//   {
//     icon: Icon.Activity,
//     title: "It runs three checks, every cycle",
//     desc: "On the schedule you set, each column is tested against its own history: a numeric trend test, a category-shift test, and a check across whole rows at once.",
//     note: "three checks at once",
//   },
//   {
//     icon: Icon.Mail,
//     title: "You get one email, only when it matters",
//     desc: "The alert names the column, shows today against baseline, and includes a plain-language explanation of what likely happened and what to check first.",
//     note: "quiet on normal days",
//   },
// ];

// const DETECTORS = [
//   {
//     tone: "#B5402F",
//     tint: "var(--brick-tint)",
//     icon: Icon.trendDown,
//     tag: "checked against its own history",
//     title: "Numeric trend detection",
//     desc: "Flags a number that has moved far outside its normal range, measured against a baseline built from that column's own history — not a hardcoded threshold.",
//   },
//   {
//     tone: "#33604A",
//     tint: "var(--pine-tint)",
//     icon: Icon.barChart,
//     tag: "spots when the mix changes shape",
//     title: "Category shift detection",
//     desc: "Flags when the mix of values in a column changes shape — a status field that suddenly skews toward one value, or a region field that goes quiet.",
//   },
//   {
//     tone: "#AD7C2A",
//     tint: "var(--ochre-tint)",
//     icon: Icon.Cpu,
//     tag: "compares columns together, not one at a time",
//     title: "Whole-row anomaly detection",
//     desc: "Flags rows that look wrong across several columns at once, even when every individual column looks fine on its own.",
//   },
// ];

// const SECURITY = [
//   {
//     icon: Icon.lock,
//     tag: "Built into the database",
//     title: "Accounts never cross",
//     desc: "Isolation is enforced inside the database itself, not only in application code.",
//   },
//   {
//     icon: Icon.key,
//     tag: "Checked on every request",
//     title: "Every request is checked",
//     desc: "Nothing reaches your data without proving it's really you, on every single call.",
//   },
//   {
//     icon: Icon.userCheck,
//     tag: "Google sign-in",
//     title: "Sign in your way",
//     desc: "Continue with Google, or email. No separate password for anyone to store or leak.",
//   },
//   {
//     icon: Icon.Shield,
//     tag: "Nothing saved",
//     title: "One-time scans leave nothing",
//     desc: "A free scan runs entirely in memory and is discarded. Nothing is written to a database.",
//   },
// ];

// function LandingPage({ onStart, session }) {
//   const problemRef = useRef(null),
//     howRef = useRef(null),
//     detectionRef = useRef(null),
//     securityRef = useRef(null),
//     heroScanRef = useRef(null),
//     resultsRef = useRef(null);
//   const refs = {
//     problem: problemRef,
//     how: howRef,
//     detection: detectionRef,
//     security: securityRef,
//   };
//   const [scanResult, setScanResult] = useState(null),
//     [execTime, setExecTime] = useState(null);
//   const scrollToScan = () =>
//     heroScanRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "center",
//     });
//   const handleScanComplete = (result, ms) => {
//     setScanResult(result);
//     setExecTime(ms);
//     setTimeout(
//       () =>
//         resultsRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         }),
//       380,
//     );
//   };

//   return (
//     <div className="dw">
//       <style>{GLOBAL_CSS}</style>
//       <Nav onStart={onStart} refs={refs} session={session} />

//       <section className="hero-pad" style={{ background: "var(--paper)" }}>
//         <div className="container hero-grid">
//           <div>
//             <h1 className="h1">
//               Your spreadsheet breaks quietly. This tells you when it does.
//             </h1>
//             <p className="lede" style={{ marginTop: 22, maxWidth: 460 }}>
//               DriftWatch watches a Google Sheet or CSV against its own history
//               and flags the moment a number, a category, or a row stops looking
//               like itself — before it reaches a dashboard someone trusts.
//             </p>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: 12,
//                 marginTop: 30,
//               }}
//             >
//               <button
//                 className="btn btn-primary"
//                 onClick={() => onStart(session ? "monitor" : "signup")}
//               >
//                 {session ? "Go to dashboard" : "Start monitoring"}{" "}
//                 <Icon.ArrowRight size={15} />
//               </button>
//             </div>
//             <div
//               className="mono"
//               style={{
//                 display: "flex",
//                 gap: 18,
//                 marginTop: 30,
//                 fontSize: 11.5,
//                 color: "var(--body-faint)",
//                 flexWrap: "wrap",
//               }}
//             >
//               <span>no login for a scan</span>
//               <span style={{ color: "var(--paper-line)" }}>/</span>
//               <span>nothing stored</span>
//               <span style={{ color: "var(--paper-line)" }}>/</span>
//               <span>results in seconds</span>
//             </div>
//           </div>
//           <div ref={heroScanRef} id="dw-scan">
//             <HeroScanTool onScanComplete={handleScanComplete} />
//           </div>
//         </div>
//       </section>

//       {scanResult && (
//         <section
//           ref={resultsRef}
//           className="section"
//           style={{ scrollMarginTop: 84, paddingTop: 40, paddingBottom: 40 }}
//         >
//           <div className="container">
//             <div className="eyebrow" style={{ marginBottom: 18 }}>
//               scan result
//             </div>
//             <Reveal>
//               <FullResultsDashboard
//                 result={scanResult}
//                 execTime={execTime}
//                 onStart={onStart}
//               />
//             </Reveal>
//           </div>
//         </section>
//       )}

//       <section
//         ref={problemRef}
//         className="section"
//         style={{ background: "var(--ink)", scrollMarginTop: 84 }}
//       >
//         <div className="container">
//           <Reveal>
//             <div className="section-head">
//               <div
//                 className="eyebrow"
//                 style={{ marginBottom: 16, color: "#D9897B" }}
//               >
//                 the problem
//               </div>
//               <h2 className="h2-light">
//                 Most data problems are discovered by accident
//               </h2>
//               <p
//                 className="lede-light"
//                 style={{ marginTop: 14, maxWidth: 560 }}
//               >
//                 Spreadsheets and CSVs run daily decisions at most companies.
//                 Nobody is assigned to watch them, so the first sign something
//                 broke is usually a person noticing a chart looks wrong.
//               </p>
//             </div>
//           </Reveal>
//           <div className="grid-3">
//             {[
//               {
//                 icon: Icon.Activity,
//                 title: "Nobody is watching by default",
//                 desc: "A sync fails, a column goes blank, a number triples overnight — and nothing surfaces it until someone happens to look.",
//               },
//               {
//                 icon: Icon.Clock,
//                 title: "It surfaces too late",
//                 desc: "By the time a stakeholder flags a broken number in a meeting, that number has usually already shaped a decision.",
//               },
//               {
//                 icon: Icon.sliders,
//                 title: "Manual checks don't hold up",
//                 desc: "Eyeballing every sheet each morning works for a while. Then someone's on leave, or busy, and the checks quietly stop.",
//               },
//             ].map((p, i) => (
//               <Reveal key={p.title} delay={i * 80}>
//                 <div className="problem-card">
//                   <p.icon
//                     size={18}
//                     style={{ color: "#D9897B", marginBottom: 16 }}
//                   />
//                   <div
//                     style={{
//                       fontFamily: "var(--font-display)",
//                       fontWeight: 600,
//                       fontSize: 17,
//                       color: "var(--paper)",
//                       marginBottom: 10,
//                       lineHeight: 1.3,
//                     }}
//                   >
//                     {p.title}
//                   </div>
//                   <p
//                     style={{
//                       fontSize: 13.5,
//                       color: "rgba(246,243,236,.5)",
//                       lineHeight: 1.7,
//                       margin: 0,
//                     }}
//                   >
//                     {p.desc}
//                   </p>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="section" ref={howRef} style={{ scrollMarginTop: 84 }}>
//         <div className="container">
//           <Reveal>
//             <div className="section-head">
//               <div className="eyebrow" style={{ marginBottom: 16 }}>
//                 how it works
//               </div>
//               <h2 className="h2">Three steps, and then it runs on its own</h2>
//             </div>
//           </Reveal>
//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr", gap: 44 }}
//             className="how-grid"
//           >
//             <div>
//               {CASE_FILE.map((s, i) => (
//                 <Reveal key={s.title} delay={i * 70}>
//                   <div className="file-row">
//                     <div className="file-num">
//                       {String(i + 1).padStart(2, "0")}
//                     </div>
//                     <div className="file-body">
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "flex-start",
//                           gap: 14,
//                         }}
//                       >
//                         <s.icon
//                           size={19}
//                           style={{
//                             color: "var(--brick)",
//                             flexShrink: 0,
//                             marginTop: 2,
//                           }}
//                         />
//                         <div style={{ flex: 1 }}>
//                           <div
//                             style={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               alignItems: "baseline",
//                               gap: 12,
//                               flexWrap: "wrap",
//                             }}
//                           >
//                             <div className="h3">{s.title}</div>
//                             <span
//                               className="mono"
//                               style={{
//                                 fontSize: 10.5,
//                                 color: "var(--body-faint)",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               {s.note}
//                             </span>
//                           </div>
//                           <p
//                             style={{
//                               fontSize: 14,
//                               color: "var(--body-dim)",
//                               lineHeight: 1.7,
//                               margin: "8px 0 0",
//                               maxWidth: 520,
//                             }}
//                           >
//                             {s.desc}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Reveal>
//               ))}
//             </div>
//             <Reveal delay={90}>
//               <div>
//                 <div
//                   className="eyebrow"
//                   style={{ marginBottom: 12, justifyContent: "center" }}
//                 >
//                   a reading, in practice
//                 </div>
//                 <Instrument />
//               </div>
//             </Reveal>
//           </div>
//         </div>
//       </section>

//       <section className="section" style={{ background: "var(--paper-dim)" }}>
//         <div className="container">
//           <Reveal>
//             <div className="section-head">
//               <div className="eyebrow" style={{ marginBottom: 16 }}>
//                 what it does
//               </div>
//               <h2 className="h2">
//                 Runs quietly. Speaks up when something's off.
//               </h2>
//             </div>
//           </Reveal>
//           <div>
//             {[
//               {
//                 icon: Icon.Activity,
//                 title: "Automated monitoring",
//                 desc: "Schedule checks from hourly to weekly. DriftWatch runs in the background while you work on everything else.",
//               },
//               {
//                 icon: Icon.fileSheet,
//                 title: "One-time scans",
//                 desc: "Upload a CSV and get a full anomaly report in seconds. No login, nothing stored, nothing to set up.",
//               },
//               {
//                 icon: Icon.barChart,
//                 title: "Run history",
//                 desc: "Every check is logged on a timeline, so a pattern shows up as a pattern — not just one isolated incident.",
//               },
//               {
//                 icon: Icon.Cpu,
//                 title: "AI-written explanations",
//                 desc: "Every alert includes a plain-language read of what changed, likely causes, and what to check first.",
//               },
//               {
//                 icon: Icon.Mail,
//                 title: "Alerts, not noise",
//                 desc: "You're only emailed when a check actually finds something. Normal days stay silent.",
//               },
//               {
//                 icon: Icon.sliders,
//                 title: "Full control, always",
//                 desc: "Pause, resume, or delete any monitor in one click. Nothing runs without your say-so.",
//               },
//             ].map((f, i) => (
//               <Reveal key={f.title} delay={(i % 3) * 60}>
//                 <div className="feat-row">
//                   <f.icon
//                     size={18}
//                     style={{ color: "var(--ink)", flexShrink: 0, marginTop: 3 }}
//                   />
//                   <div>
//                     <div
//                       style={{
//                         fontWeight: 700,
//                         fontSize: 14.5,
//                         color: "var(--ink)",
//                         marginBottom: 4,
//                       }}
//                     >
//                       {f.title}
//                     </div>
//                     <p
//                       style={{
//                         fontSize: 13.5,
//                         color: "var(--body-dim)",
//                         lineHeight: 1.65,
//                         margin: 0,
//                       }}
//                     >
//                       {f.desc}
//                     </p>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section
//         className="section"
//         style={{ background: "var(--ink)" }}
//         ref={securityRef}
//       >
//         <div className="container">
//           <Reveal>
//             <div className="section-head">
//               <div
//                 className="eyebrow"
//                 style={{ marginBottom: 16, color: "#8FB89C" }}
//               >
//                 security
//               </div>
//               <h2 className="h2-light">
//                 Your data is yours. That's enforced, not promised.
//               </h2>
//               <p className="lede-light" style={{ marginTop: 14 }}>
//                 Every account is isolated at two layers independently — the
//                 application and the database — so a bug in one doesn't expose
//                 the other.
//               </p>
//             </div>
//           </Reveal>
//           <div className="grid-4">
//             {SECURITY.map((s, i) => (
//               <Reveal key={s.title} delay={i * 60}>
//                 <div className="sec-tile" style={{ height: "100%" }}>
//                   <s.icon
//                     size={17}
//                     style={{ color: "#8FB89C", marginBottom: 16 }}
//                   />
//                   <div
//                     className="mono"
//                     style={{
//                       fontSize: 10,
//                       color: "rgba(246,243,236,.35)",
//                       marginBottom: 9,
//                       letterSpacing: ".05em",
//                     }}
//                   >
//                     {s.tag}
//                   </div>
//                   <div
//                     style={{
//                       fontWeight: 700,
//                       fontSize: 14,
//                       color: "var(--paper)",
//                       marginBottom: 8,
//                       lineHeight: 1.4,
//                     }}
//                   >
//                     {s.title}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 13,
//                       color: "rgba(246,243,236,.42)",
//                       lineHeight: 1.65,
//                     }}
//                   >
//                     {s.desc}
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section
//         className="section"
//         ref={detectionRef}
//         style={{ scrollMarginTop: 84 }}
//       >
//         <div className="container">
//           <Reveal>
//             <div className="section-head">
//               <div className="eyebrow" style={{ marginBottom: 16 }}>
//                 detection
//               </div>
//               <h2 className="h2">Three separate tests, run together</h2>
//               <p className="lede" style={{ marginTop: 14 }}>
//                 Most tools watch for one kind of problem. Each scan runs all
//                 three of these against your data, because a real break in a
//                 spreadsheet rarely announces itself the same way twice.
//               </p>
//             </div>
//           </Reveal>
//           <div
//             className="grid-3"
//             style={{
//               gap: 1,
//               background: "var(--paper-line)",
//               border: "1px solid var(--paper-line)",
//             }}
//           >
//             {DETECTORS.map((d, i) => (
//               <Reveal key={d.title} delay={i * 70}>
//                 <div
//                   className="det-card"
//                   style={{ "--tone": d.tone, height: "100%" }}
//                 >
//                   <div
//                     style={{
//                       width: 36,
//                       height: 36,
//                       background: d.tint,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginBottom: 18,
//                     }}
//                   >
//                     <d.icon size={17} style={{ color: d.tone }} />
//                   </div>
//                   <div
//                     className="mono"
//                     style={{
//                       fontSize: 10.5,
//                       color: d.tone,
//                       marginBottom: 9,
//                       opacity: 0.85,
//                     }}
//                   >
//                     {d.tag}
//                   </div>
//                   <div className="h3" style={{ marginBottom: 9 }}>
//                     {d.title}
//                   </div>
//                   <p
//                     style={{
//                       fontSize: 14,
//                       color: "var(--body-dim)",
//                       lineHeight: 1.7,
//                       margin: 0,
//                     }}
//                   >
//                     {d.desc}
//                   </p>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="section cta-section">
//         <div className="container">
//           <Reveal>
//             <div className="cta-panel">
//               <div
//                 className="eyebrow"
//                 style={{
//                   marginBottom: 18,
//                   justifyContent: "center",
//                   color: "#D9897B",
//                 }}
//               >
//                 get started
//               </div>
//               <h2 className="h2" style={{ color: "var(--paper)" }}>
//                 Stop finding out about data problems in a meeting
//               </h2>
//               <p
//                 className="lede"
//                 style={{
//                   color: "rgba(246,243,236,.6)",
//                   maxWidth: 460,
//                   margin: "16px auto 0",
//                 }}
//               >
//                 {session
//                   ? "Your monitors are one click away."
//                   : "Free to start. No credit card. Your first monitor is running in about two minutes."}
//               </p>
//               <div
//                 style={{
//                   display: "flex",
//                   gap: 14,
//                   justifyContent: "center",
//                   flexWrap: "wrap",
//                   marginTop: 34,
//                 }}
//               >
//                 <button
//                   className="btn btn-on-dark"
//                   onClick={() => onStart(session ? "monitor" : "signup")}
//                 >
//                   {session ? "Go to dashboard" : "Start monitoring"}{" "}
//                   <Icon.ArrowRight size={15} />
//                 </button>
//                 <button className="btn btn-outline-dark" onClick={scrollToScan}>
//                   Try the free scan
//                 </button>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       <footer
//         style={{
//           background: "var(--ink)",
//           padding: "56px 0 28px",
//           borderTop: "2px solid var(--brick)",
//         }}
//       >
//         <div className="container">
//           <div className="footer-grid" style={{ marginBottom: 36 }}>
//             <div>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                   marginBottom: 16,
//                 }}
//               >
//                 <Logo />
//                 <span
//                   style={{
//                     fontFamily: "var(--font-display)",
//                     fontWeight: 600,
//                     fontSize: 17,
//                     color: "var(--paper)",
//                   }}
//                 >
//                   DriftWatch
//                 </span>
//               </div>
//               <p
//                 style={{
//                   fontSize: 13.5,
//                   color: "rgba(246,243,236,.4)",
//                   lineHeight: 1.7,
//                   maxWidth: 280,
//                   marginBottom: 18,
//                 }}
//               >
//                 Catches anomalies in your data before they turn into business
//                 problems.
//               </p>
//               <div style={{ display: "flex", gap: 10 }}>
//                 <a
//                   href="https://github.com/user1-prajwal/driftwatch"
//                   target="_blank"
//                   rel="noreferrer"
//                   className="btn btn-sm btn-outline-dark"
//                 >
//                   <Icon.Github size={14} /> GitHub
//                 </a>
//               </div>
//             </div>
//             <div>
//               <div
//                 className="mono"
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: ".07em",
//                   textTransform: "uppercase",
//                   color: "rgba(246,243,236,.32)",
//                   marginBottom: 14,
//                 }}
//               >
//                 Product
//               </div>
//               {[
//                 "Automated monitoring",
//                 "One-time scans",
//                 "Run history",
//                 "AI-written explanations",
//                 "Alerts, not noise",
//                 "Full control",
//               ].map((f) => (
//                 <div
//                   key={f}
//                   style={{
//                     fontSize: 13,
//                     color: "rgba(246,243,236,.4)",
//                     marginBottom: 9,
//                   }}
//                 >
//                   {f}
//                 </div>
//               ))}
//             </div>
//             <div>
//               <div
//                 className="mono"
//                 style={{
//                   fontSize: 11,
//                   fontWeight: 600,
//                   letterSpacing: ".07em",
//                   textTransform: "uppercase",
//                   color: "rgba(246,243,236,.32)",
//                   marginBottom: 14,
//                 }}
//               >
//                 Built with
//               </div>
//               {[
//                 "Python + FastAPI",
//                 "React",
//                 "scikit-learn",
//                 "Google Gemini AI",
//                 "Supabase + RLS",
//                 "APScheduler",
//                 "Brevo email API",
//                 "Vercel + Render",
//               ].map((t) => (
//                 <div
//                   key={t}
//                   className="mono"
//                   style={{
//                     fontSize: 12.5,
//                     color: "rgba(246,243,236,.4)",
//                     marginBottom: 9,
//                   }}
//                 >
//                   {t}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div
//             style={{
//               borderTop: "1px solid rgba(246,243,236,.1)",
//               paddingTop: 22,
//               display: "flex",
//               justifyContent: "space-between",
//               flexWrap: "wrap",
//               gap: 12,
//               alignItems: "center",
//             }}
//           >
//             <span
//               className="mono"
//               style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}
//             >
//               built by{" "}
//               <span style={{ color: "rgba(246,243,236,.55)" }}>Prajwal</span> —
//               full stack and data platform engineer
//             </span>
//             <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
//               <span
//                 className="mono"
//                 style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}
//               >
//                 © {new Date().getFullYear()} DriftWatch
//               </span>
//               <a
//                 href="https://github.com/user1-prajwal/driftwatch"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="mono"
//                 style={{ fontSize: 12, color: "rgba(246,243,236,.3)" }}
//               >
//                 GitHub
//               </a>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ---- ROOT APP ----

// export default function App() {
//   const [page, setPage] = useState("landing"),
//     [session, setSession] = useState(null),
//     [showAuthModal, setShowAuthModal] = useState(false),
//     [authMode, setAuthMode] = useState("login");
//   useEffect(() => {
//     supabase.auth
//       .getSession()
//       .then(({ data: { session } }) => setSession(session));
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
//     return () => subscription.unsubscribe();
//   }, []);
//   const handleStart = (p) => {
//     if (p === "scan") {
//       if (page !== "landing") setPage("landing");
//       setTimeout(
//         () =>
//           document
//             .getElementById("dw-scan")
//             ?.scrollIntoView({ behavior: "smooth", block: "center" }),
//         100,
//       );
//       return;
//     }
//     if (p === "monitor") {
//       if (session) setPage("monitor");
//       else {
//         setAuthMode("login");
//         setShowAuthModal(true);
//       }
//       return;
//     }
//     if (p === "login" || p === "signup") {
//       setAuthMode(p);
//       setShowAuthModal(true);
//     }
//   };
//   if (page === "monitor")
//     return (
//       <MonitorsPage
//         session={session}
//         onBack={() => setPage("landing")}
//         onLogout={async () => {
//           await supabase.auth.signOut();
//           setSession(null);
//           setPage("landing");
//         }}
//       />
//     );
//   if (page === "scan") return <ScanPage onBack={() => setPage("landing")} />;
//   return (
//     <>
//       <LandingPage onStart={handleStart} session={session} />
//       {showAuthModal && (
//         <AuthModal
//           initialMode={authMode}
//           onClose={() => setShowAuthModal(false)}
//           onSuccess={(session) => {
//             setSession(session);
//             setShowAuthModal(false);
//             setPage("monitor");
//           }}
//         />
//       )}
//     </>
//   );
// }




import { useState, useRef, useEffect } from "react";
import MonitorsPage from "./MonitorsPage";
import ScanPage from "./ScanPage";
import AuthModal from "./AuthModal";
import { supabase } from "./supabaseClient";
import axios from "axios";

// const SCAN_API = "http://localhost:8000";
const SCAN_API = "https://driftwatch-backend.onrender.com";
const REPO_URL = "https://github.com/user1-prajwal/driftwatch";
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";

/* ──────────────────────────────────────────────────────────────────────────
   DESIGN SYSTEM
   One idea: the page is neutral, and colour only appears where data has
   drifted. Ink and greys carry everything else. Mono is reserved for data
   (column names, values, method names); labels and copy are sans.
   Everything is scoped under .dw so nothing leaks into the other pages.
   ────────────────────────────────────────────────────────────────────────── */

const GLOBAL_CSS = `
html{scroll-behavior:auto;scroll-padding-top:64px;}
@media(prefers-reduced-motion:no-preference){html{scroll-behavior:smooth;}}

.dw{
  --bg:#FFFFFF;
  --bg-subtle:#F6F7F9;
  --bg-sunken:#ECEEF1;
  --line:#E1E4E9;
  --line-strong:#C8CDD5;
  --ink:#0D1117;
  --text:#2B323B;
  --text-dim:#4A5360;
  --text-faint:#636C78;
  --signal:#C7351D;
  --signal-ink:#9B2714;
  --signal-tint:#FCECE8;
  --warn:#9A5B00;
  --warn-bar:#D9930D;
  --warn-tint:#FFF3DC;
  --ok:#17693F;
  --ok-tint:#E5F3EA;
  --font-sans:'IBM Plex Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --font-mono:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  font-family:var(--font-sans);
  font-size:16px;
  line-height:1.55;
  color:var(--text);
  background:var(--bg);
  min-height:100vh;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.dw *,.dw *::before,.dw *::after{box-sizing:border-box;}
.dw h1,.dw h2,.dw h3,.dw p,.dw dl,.dw dd,.dw ul,.dw ol,.dw figure{margin:0;padding:0;}
.dw ul,.dw ol{list-style:none;}
.dw a{color:inherit;text-decoration:none;}
.dw button,.dw input,.dw select{font:inherit;color:inherit;}
.dw button{cursor:pointer;}
.dw svg{display:block;}
.dw ::selection{background:var(--ink);color:#fff;}
.dw :focus-visible{outline:2px solid var(--ink);outline-offset:2px;}
.dw .mono{font-family:var(--font-mono);}

/* tone: one switch that colours tags, bars and dots consistently */
.dw [data-tone="critical"]{--tone:var(--signal);--tone-bg:var(--signal-tint);--tone-text:var(--signal-ink);}
.dw [data-tone="warning"]{--tone:var(--warn-bar);--tone-bg:var(--warn-tint);--tone-text:var(--warn);}
.dw [data-tone="error"]{--tone:#5B6572;--tone-bg:var(--bg-sunken);--tone-text:var(--text-dim);}
.dw [data-tone="normal"]{--tone:var(--ok);--tone-bg:var(--ok-tint);--tone-text:var(--ok);}

.dw .container{max-width:1200px;margin:0 auto;padding:0 20px;}
@media(min-width:640px){.dw .container{padding:0 40px;}}

/* ── type ── */
.dw .h1{font-size:clamp(34px,5.2vw,60px);line-height:1.05;letter-spacing:-.03em;font-weight:600;color:var(--ink);text-wrap:balance;}
.dw .h2{font-size:clamp(26px,3vw,36px);line-height:1.15;letter-spacing:-.025em;font-weight:600;color:var(--ink);text-wrap:balance;}
.dw .lede{margin-top:16px;font-size:17px;line-height:1.65;color:var(--text-dim);max-width:38em;text-wrap:pretty;}
.dw .note{margin-top:16px;font-size:13px;color:var(--text-faint);}

/* ── buttons ── */
.dw .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;font-size:14px;font-weight:500;line-height:1;border-radius:4px;border:1px solid transparent;white-space:nowrap;transition:background-color .12s ease,border-color .12s ease,color .12s ease;}
.dw .btn-lg{height:46px;padding:0 20px;font-size:15px;}
.dw .btn-sm{height:36px;padding:0 12px;font-size:13.5px;}
.dw .btn-primary{background:var(--ink);color:#fff;border-color:var(--ink);}
.dw .btn-primary:hover{background:var(--text);border-color:var(--text);}
.dw .btn-secondary{background:var(--bg);color:var(--ink);border-color:var(--line-strong);}
.dw .btn-secondary:hover{background:var(--bg-subtle);border-color:var(--ink);}
.dw .btn-text{background:transparent;color:var(--text-dim);}
.dw .btn-text:hover{color:var(--ink);}
.dw .btn[disabled]{opacity:.5;cursor:not-allowed;}

/* ── nav ── */
.dw .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,.92);backdrop-filter:saturate(1.4) blur(10px);-webkit-backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--line);}
.dw .nav-inner{display:flex;align-items:center;height:56px;gap:32px;}
.dw .brand{display:inline-flex;align-items:center;gap:10px;font-size:16px;font-weight:600;letter-spacing:-.01em;color:var(--ink);}
.dw .nav-links{display:none;gap:28px;}
.dw .nav-links a{font-size:14px;color:var(--text-dim);}
.dw .nav-links a:hover{color:var(--ink);}
.dw .nav-actions{margin-left:auto;display:flex;align-items:center;gap:8px;}
.dw .nav-login{display:none;}
.dw .menu-btn{display:inline-grid;place-items:center;width:36px;height:36px;border:1px solid var(--line-strong);border-radius:4px;background:var(--bg);color:var(--ink);}
.dw .mobile-menu{border-top:1px solid var(--line);background:var(--bg);}
.dw .mobile-menu .container{display:flex;flex-direction:column;padding-top:4px;padding-bottom:12px;}
.dw .mobile-menu a,.dw .mobile-menu button{display:flex;align-items:center;min-height:48px;padding:0;font-size:16px;color:var(--ink);background:none;border:0;border-bottom:1px solid var(--line);text-align:left;}
@media(min-width:880px){
  .dw .nav-links{display:flex;}
  .dw .nav-login{display:inline-flex;}
  .dw .menu-btn,.dw .mobile-menu{display:none;}
}

/* ── hero ── */
.dw .hero{padding:calc(56px + clamp(40px,6vw,88px)) 0 clamp(48px,6vw,80px);}
.dw .hero-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:48px;align-items:start;}
@media(min-width:1000px){.dw .hero-grid{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:72px;}}
.dw .hero-sub{margin-top:22px;font-size:clamp(16px,1.6vw,18px);line-height:1.65;color:var(--text-dim);max-width:34em;text-wrap:pretty;}
.dw .hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px;}
@media(max-width:480px){.dw .hero-actions .btn{flex:1 1 100%;}}

/* drift strip: the one illustration the page is built around */
.dw .strip{margin-top:clamp(40px,6vw,72px);}
.dw .strip-plot{position:relative;height:clamp(120px,14vw,168px);border:1px solid var(--line);border-radius:6px;background:var(--bg);overflow:hidden;}
.dw .strip-band{position:absolute;left:0;right:0;top:36%;height:28%;background:var(--bg-subtle);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.dw .strip-mean{position:absolute;left:0;right:0;top:50%;border-top:1px dashed var(--line-strong);}
.dw .strip-plot svg{position:absolute;inset:0;width:100%;height:100%;}
.dw .strip-line{fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;}
.dw .strip-line-dev{stroke:var(--signal);}
.dw .strip-dot{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:var(--bg);border:2px solid var(--signal);}
.dw .strip-tag{position:absolute;font-size:12.5px;line-height:1.3;}
.dw .strip-tag-base{left:14px;top:calc(36% - 24px);color:var(--text-faint);}
.dw .strip-tag-dev{text-align:right;color:var(--signal-ink);font-weight:500;}
.dw .strip-cap{margin-top:10px;font-size:13px;color:var(--text-faint);}

/* ── panel + scan tool ── */
.dw .panel{background:var(--bg);border:1px solid var(--line-strong);border-radius:6px;overflow:hidden;}
.dw .panel-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--bg-subtle);}
.dw .panel-title{font-size:14px;font-weight:600;color:var(--ink);}
.dw .steps{display:flex;gap:14px;font-size:12.5px;color:var(--text-faint);}
.dw .steps li{display:flex;gap:6px;align-items:center;}
.dw .steps li span{font-family:var(--font-mono);font-size:11.5px;}
.dw .steps li.done{color:var(--text-dim);}
.dw .steps li[aria-current="step"]{color:var(--ink);font-weight:600;}
.dw .panel-body{padding:20px;}
.dw .panel-foot{padding:10px 16px;border-top:1px solid var(--line);background:var(--bg-subtle);font-size:12.5px;color:var(--text-faint);}

.dw .dropzone{border:1.5px dashed var(--line-strong);border-radius:4px;padding:40px 20px;text-align:center;cursor:pointer;background:var(--bg);transition:border-color .12s ease,background-color .12s ease;}
.dw .dropzone:hover,.dw .dropzone.is-drag{border-color:var(--ink);background:var(--bg-subtle);}
.dw .dz-icon{width:40px;height:40px;margin:0 auto 14px;display:grid;place-items:center;border:1px solid var(--line-strong);border-radius:4px;background:var(--bg);color:var(--ink);}
.dw .dz-title{font-size:16px;font-weight:600;color:var(--ink);}
.dw .dz-sub{margin-top:4px;font-size:13.5px;color:var(--text-dim);}
.dw .center{text-align:center;padding:28px 12px;}
.dw .spinner{width:20px;height:20px;margin:0 auto 14px;border:2px solid var(--ink);border-top-color:transparent;border-radius:50%;animation:dw-spin .8s linear infinite;}
@keyframes dw-spin{to{transform:rotate(360deg);}}
@media(prefers-reduced-motion:reduce){.dw .spinner{animation-duration:2s;}}
.dw .center-title{font-size:16px;font-weight:600;color:var(--ink);}
.dw .center-sub{margin-top:4px;font-size:13.5px;color:var(--text-dim);}
.dw .slow{margin-top:12px;font-size:13px;color:var(--text-faint);}

.dw .panel-heading{font-size:16px;font-weight:600;color:var(--ink);}
.dw .panel-meta{margin-top:3px;margin-bottom:18px;font-size:13px;color:var(--text-dim);overflow-wrap:anywhere;}
.dw .field{margin-bottom:18px;}
.dw .label{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;font-size:13px;font-weight:500;color:var(--ink);}
.dw .label small{font-size:12px;font-weight:400;color:var(--text-faint);}
.dw .label button{padding:0;background:none;border:0;font-size:12.5px;font-weight:500;color:var(--ink);text-decoration:underline;text-underline-offset:3px;}
.dw .input,.dw .select{width:100%;height:38px;padding:0 12px;border:1px solid var(--line-strong);border-radius:4px;background:var(--bg);font-size:14px;color:var(--ink);}
.dw .select{font-family:var(--font-mono);font-size:13px;}
.dw .input::placeholder{color:var(--text-faint);}
.dw .input:hover,.dw .select:hover{border-color:var(--text-faint);}

.dw .chips{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;max-height:224px;overflow:auto;padding:2px;}
.dw .chip{position:relative;display:flex;align-items:center;gap:8px;min-height:36px;padding:8px 10px;border:1px solid var(--line);border-radius:4px;background:var(--bg);cursor:pointer;}
.dw .chip:hover{border-color:var(--line-strong);}
.dw .chip.on{border-color:var(--ink);background:var(--bg-subtle);}
.dw .chip input{position:absolute;opacity:0;pointer-events:none;}
.dw .chip-box{width:14px;height:14px;flex:none;display:grid;place-items:center;border:1.5px solid var(--text-faint);border-radius:2px;color:#fff;}
.dw .chip.on .chip-box{background:var(--ink);border-color:var(--ink);}
.dw .chip input:focus-visible + .chip-box{outline:2px solid var(--ink);outline-offset:2px;}
.dw .chip-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;}
.dw .chip.on .chip-text{font-weight:500;color:var(--ink);}

.dw .seg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border:1px solid var(--line-strong);border-radius:4px;}
.dw .seg label{position:relative;cursor:pointer;}
.dw .seg label + label{border-left:1px solid var(--line-strong);}
.dw .seg input{position:absolute;opacity:0;pointer-events:none;}
.dw .seg span{display:block;padding:9px 6px;text-align:center;font-size:13px;font-weight:600;color:var(--text);}
.dw .seg label:first-child span{border-radius:3px 0 0 3px;}
.dw .seg label:last-child span{border-radius:0 3px 3px 0;}
.dw .seg small{display:block;margin-top:1px;font-size:11px;font-weight:400;color:var(--text-faint);}
.dw .seg input:checked + span{background:var(--ink);color:#fff;}
.dw .seg input:checked + span small{color:rgba(255,255,255,.72);}
.dw .seg input:focus-visible + span{outline:2px solid var(--ink);outline-offset:2px;}

.dw .actions{display:flex;gap:8px;margin-top:20px;}
.dw .actions .btn-primary{flex:1;}
.dw .msg{display:flex;gap:8px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:4px;background:var(--signal-tint);color:var(--signal-ink);font-size:13px;line-height:1.5;}
.dw .msg svg{flex:none;margin-top:2px;}
.dw .hint-warn{margin-top:8px;font-size:12.5px;color:var(--warn);}

.dw .done-text{margin:14px 0 4px;font-size:13.5px;color:var(--text-dim);line-height:1.5;}

/* ── scan results ── */
.dw .results{padding:clamp(40px,5vw,64px) 0;background:var(--bg-subtle);border-top:1px solid var(--line);}
.dw .results-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 16px;margin-bottom:16px;}
.dw .results-head h2{font-size:22px;font-weight:600;letter-spacing:-.015em;color:var(--ink);}
.dw .results-file{font-size:12.5px;color:var(--text-faint);overflow-wrap:anywhere;}
.dw .board{border:1px solid var(--line-strong);border-radius:6px;overflow:hidden;background:var(--bg);}
.dw .score{display:grid;gap:14px;padding:20px;border-bottom:1px solid var(--line);}
.dw .score-main{display:flex;align-items:center;gap:16px;}
.dw .score-num{font-family:var(--font-mono);font-size:40px;font-weight:600;line-height:1;letter-spacing:-.02em;color:var(--tone-text);}
.dw .score-num small{margin-left:3px;font-size:14px;font-weight:400;letter-spacing:0;color:var(--text-faint);}
.dw .score-k{font-size:12.5px;color:var(--text-faint);}
.dw .score-label{margin-top:1px;font-size:18px;font-weight:600;color:var(--ink);}
.dw .score-stats{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--text-dim);}
.dw .score-stats li{display:flex;align-items:center;gap:7px;}
.dw .dot{width:8px;height:8px;flex:none;border-radius:50%;background:var(--tone);}
.dw .score-bar{height:4px;border-radius:2px;background:var(--bg-sunken);overflow:hidden;}
.dw .score-bar span{display:block;height:100%;background:var(--tone);}
.dw .rc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));}
.dw .rc{padding:18px 20px;background:var(--bg);border-left:3px solid var(--tone);box-shadow:1px 0 0 var(--line),0 1px 0 var(--line);}
.dw .rc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;}
.dw .rc-name{font-family:var(--font-mono);font-size:13.5px;font-weight:600;line-height:1.35;color:var(--ink);overflow-wrap:anywhere;}
.dw .tag{flex:none;padding:2px 7px;border-radius:2px;background:var(--tone-bg);color:var(--tone-text);font-size:12px;font-weight:600;}
.dw .rc-change{margin-bottom:14px;font-size:13px;line-height:1.5;color:var(--text-dim);}
.dw .meters{display:grid;gap:10px;margin-bottom:14px;}
.dw .meter-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;font-size:12px;color:var(--text-faint);}
.dw .meter-row b{font-family:var(--font-mono);font-size:12.5px;font-weight:600;color:var(--ink);}
.dw .meter-row b.is-tone{color:var(--tone-text);}
.dw .meter-track{height:5px;border-radius:1px;background:var(--bg-sunken);overflow:hidden;}
.dw .meter-fill{display:block;height:100%;background:var(--tone);}
.dw .meter-fill.is-base{background:var(--line-strong);}
.dw .delta{display:inline-flex;align-items:center;gap:6px;justify-self:start;padding:3px 8px;border-radius:2px;background:var(--tone-bg);color:var(--tone-text);font-family:var(--font-mono);font-size:12px;font-weight:600;}
.dw .reading{margin-bottom:12px;padding:10px 12px;background:var(--bg-subtle);border-left:2px solid var(--ink);}
.dw .reading-k{margin-bottom:3px;font-size:12px;font-weight:600;color:var(--text-faint);}
.dw .reading p{font-size:13px;line-height:1.6;color:var(--ink);}
.dw .rca{padding-top:10px;border-top:1px solid var(--line);}
.dw .rca-toggle{display:flex;align-items:center;gap:8px;width:100%;padding:4px 0;background:none;border:0;font-size:13px;font-weight:500;color:var(--text-dim);text-align:left;}
.dw .rca-toggle:hover{color:var(--ink);}
.dw .rca-toggle svg{transition:transform .15s ease;}
.dw .rca-toggle[aria-expanded="true"] svg{transform:rotate(180deg);}
.dw .rca-hint{margin-left:auto;font-size:12px;font-weight:400;color:var(--text-faint);}
.dw .rca-body{margin-top:12px;}
.dw .rca-body > p{margin-bottom:12px;font-size:13px;line-height:1.65;color:var(--ink);}
.dw .rca-k{margin-bottom:6px;font-size:12px;font-weight:600;color:var(--text-faint);}
.dw .cause{display:flex;gap:8px;margin-bottom:6px;font-size:13px;line-height:1.6;color:var(--text);}
.dw .cause i{flex:none;font-style:normal;font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--text-faint);}
.dw .action{margin-top:12px;padding:10px 12px;background:var(--bg-subtle);border-left:2px solid var(--tone);font-size:13px;font-weight:500;line-height:1.6;color:var(--ink);}
.dw .empty{display:flex;align-items:center;justify-content:center;gap:10px;padding:36px 24px;background:var(--ok-tint);color:var(--ok);font-weight:600;}
.dw .result-cta{display:grid;gap:18px;padding:24px 20px;border-top:1px solid var(--line-strong);background:var(--bg-subtle);}
@media(min-width:760px){.dw .result-cta{grid-template-columns:minmax(0,1fr) auto;align-items:center;padding:24px 28px;}}
.dw .result-cta h3{font-size:18px;font-weight:600;letter-spacing:-.01em;line-height:1.3;color:var(--ink);}
.dw .result-cta p{margin-top:6px;max-width:44em;font-size:14px;line-height:1.6;color:var(--text-dim);}
.dw .cta-note{margin-top:8px;font-size:12.5px;color:var(--text-faint);text-align:center;}

/* ── sections ── */
.dw .sec{padding:clamp(56px,8vw,104px) 0;border-top:1px solid var(--line);}
.dw .sec-subtle{background:var(--bg-subtle);}
.dw .stack .sec-content{margin-top:clamp(32px,4vw,48px);}
.dw .split{display:grid;grid-template-columns:minmax(0,1fr);gap:32px;}
@media(min-width:960px){
  .dw .split{grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:64px;}
  .dw .split .sec-head{position:sticky;top:96px;align-self:start;}
}

/* problem: two timelines */
.dw .flows{display:grid;grid-template-columns:minmax(0,1fr);gap:40px;}
@media(min-width:640px){.dw .flows{grid-template-columns:repeat(2,minmax(0,1fr));gap:32px;}}
.dw .flow-k{margin-bottom:18px;font-size:14px;font-weight:600;color:var(--ink);}
.dw .tl li{position:relative;margin-left:4px;padding:0 0 22px 24px;border-left:1px solid var(--line-strong);}
.dw .tl li:last-child{padding-bottom:0;border-left-color:transparent;}
.dw .tl li::before{content:"";position:absolute;left:-5.5px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--bg);border:1.5px solid var(--ink);}
.dw .tl li.is-break::before{background:var(--signal);border-color:var(--signal);}
.dw .tl li.is-end::before{background:var(--ink);}
.dw .tl li.is-late::before{border-color:var(--text-faint);}
.dw .tl-t{font-size:15px;font-weight:600;line-height:1.35;color:var(--ink);}
.dw .tl-d{margin-top:3px;font-size:14px;line-height:1.55;color:var(--text-dim);}

/* how it works */
.dw .how{display:grid;grid-template-columns:minmax(0,1fr);gap:40px;}
@media(min-width:1000px){.dw .how{grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:64px;align-items:start;}}
.dw .step{display:grid;grid-template-columns:36px minmax(0,1fr);padding:22px 0;border-top:1px solid var(--line-strong);}
.dw .step:last-child{border-bottom:1px solid var(--line-strong);}
.dw .step-n{font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-faint);padding-top:2px;}
.dw .step h3{font-size:17px;font-weight:600;letter-spacing:-.01em;color:var(--ink);}
.dw .step p{margin-top:6px;font-size:15px;line-height:1.65;color:var(--text-dim);}
.dw .example{border:1px solid var(--line-strong);border-radius:6px;background:var(--bg);}
.dw .example-head{display:flex;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);background:var(--bg-subtle);font-size:13px;font-weight:500;color:var(--ink);}
.dw .example-head span + span{font-weight:400;color:var(--text-faint);}
.dw .example-body{padding:16px;}
.dw .example .rc{border:1px solid var(--line);border-left:3px solid var(--tone);box-shadow:none;}
.dw .example-note{padding:0 16px 14px;font-size:13px;line-height:1.55;color:var(--text-faint);}

/* detection */
.dw .cells{display:grid;grid-template-columns:minmax(0,1fr);gap:1px;border:1px solid var(--line);border-radius:6px;background:var(--line);overflow:hidden;}
@media(min-width:880px){.dw .cells.cols-3{grid-template-columns:repeat(3,minmax(0,1fr));}}
@media(min-width:640px){.dw .cells.cols-2{grid-template-columns:repeat(2,minmax(0,1fr));}}
.dw .cell{padding:24px;background:var(--bg);}
.dw .fig{margin-bottom:20px;padding:12px;border:1px solid var(--line);border-radius:4px;background:var(--bg-subtle);}
.dw .fig svg{width:100%;height:auto;}
.dw .cell-tag{font-family:var(--font-mono);font-size:12.5px;font-weight:500;color:var(--text-faint);}
.dw .cell h3{margin-top:6px;font-size:18px;font-weight:600;letter-spacing:-.01em;color:var(--ink);}
.dw .cell p{margin-top:8px;font-size:15px;line-height:1.65;color:var(--text-dim);}
.dw .fig-band{fill:var(--bg-sunken);}
.dw .fig-mean{stroke:var(--line-strong);stroke-width:1;stroke-dasharray:3 3;}
.dw .fig-line{fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round;}
.dw .fig-line-dev{stroke:var(--signal);}
.dw .fig-dot{fill:var(--bg);stroke:var(--signal);stroke-width:2;}
.dw .fig-axis{stroke:var(--line-strong);stroke-width:1;}
.dw .fig-proj{stroke:var(--signal);stroke-width:1;stroke-dasharray:2 3;opacity:.6;}
.dw .fig-pt{fill:var(--text-dim);}
.dw .fig-text{font-family:var(--font-sans);font-size:10px;fill:var(--text-faint);}
.dw .fig-text-dev{fill:var(--signal-ink);font-weight:600;}
.dw .fig-s0{fill:var(--ink);}
.dw .fig-s1{fill:var(--text-dim);}
.dw .fig-s2{fill:#8D96A3;}
.dw .fig-s3{fill:var(--line-strong);}
.dw .fig-seg{stroke:var(--bg-subtle);stroke-width:1;}
.dw .fig-flag{stroke:var(--signal);stroke-width:2;}

/* product */
.dw .defs{border-top:1px solid var(--line-strong);}
.dw .def{padding:22px 0;border-bottom:1px solid var(--line);}
.dw .def-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 16px;}
.dw .def dt{font-size:17px;font-weight:600;letter-spacing:-.01em;color:var(--ink);}
.dw .def-tag{font-size:13px;color:var(--text-faint);}
.dw .def dd{margin-top:6px;font-size:15px;line-height:1.65;color:var(--text-dim);max-width:36em;}

/* closing */
.dw .closing{padding:clamp(56px,8vw,104px) 0;border-top:1px solid var(--line);}
.dw .closing-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:32px;align-items:end;}
@media(min-width:900px){.dw .closing-grid{grid-template-columns:minmax(0,1fr) auto;gap:64px;}}
.dw .closing .h2{font-size:clamp(28px,3.6vw,44px);max-width:16em;}
.dw .closing-actions{display:flex;flex-wrap:wrap;gap:12px;}
@media(max-width:480px){.dw .closing-actions .btn{flex:1 1 100%;}}

/* footer */
.dw .footer{padding:48px 0 28px;border-top:1px solid var(--line);background:var(--bg-subtle);}
.dw .footer-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:36px;}
@media(min-width:640px){.dw .footer-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(min-width:960px){.dw .footer-grid{grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr));gap:48px;}}
.dw .footer-blurb{margin-top:14px;max-width:26em;font-size:14px;line-height:1.65;color:var(--text-dim);}
.dw .footer h3{margin-bottom:10px;font-size:13px;font-weight:600;color:var(--ink);}
.dw .footer-col a,.dw .footer-col button,.dw .footer-col li{display:block;padding:4px 0;background:none;border:0;font-size:14px;color:var(--text-dim);text-align:left;}
.dw .footer-col a:hover,.dw .footer-col button:hover{color:var(--ink);}
.dw .footer-base{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 24px;margin-top:40px;padding-top:20px;border-top:1px solid var(--line);font-size:13px;color:var(--text-faint);}
`;

/* ── icons ── */

function makeIcon(children, strokeWidth = 1.6) {
  return function Ico({ size = 18, className = "", style }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-hidden="true"
        focusable="false"
      >
        {children}
      </svg>
    );
  };
}

const Icon = {
  Upload: makeIcon(
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>,
  ),
  Alert: makeIcon(
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4" />
      <path d="M12 17.2v.1" />
    </>,
  ),
  Check: makeIcon(<path d="m5 12.5 4.5 4.5L19 7.5" />, 2.2),
  Chevron: makeIcon(<path d="m6 9 6 6 6-6" />),
  Menu: makeIcon(<path d="M4 7h16M4 12h16M4 17h16" />),
  Close: makeIcon(<path d="M6 6l12 12M18 6 6 18" />),
  Circle: makeIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </>,
  ),
};

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0D1117" />
      <path
        d="M5 15.5H19"
        stroke="#F6F7F9"
        strokeOpacity=".4"
        strokeWidth="1.25"
        strokeDasharray="1.5 2"
      />
      <path
        d="M5 15.5H11.5L19 7.5"
        stroke="#F6F7F9"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="7.5" r="2" fill="#E5533A" />
    </svg>
  );
}

/* ── hooks ── */

// Loads the typefaces once, with preconnect. Moving these three tags into
// index.html is slightly better still (no flash before the effect runs).
function useFonts() {
  useEffect(() => {
    if (document.getElementById("dw-fonts")) return;
    const a = document.createElement("link");
    a.rel = "preconnect";
    a.href = "https://fonts.googleapis.com";
    const b = document.createElement("link");
    b.rel = "preconnect";
    b.href = "https://fonts.gstatic.com";
    b.crossOrigin = "anonymous";
    const c = document.createElement("link");
    c.id = "dw-fonts";
    c.rel = "stylesheet";
    c.href = FONTS_HREF;
    document.head.append(a, b, c);
  }, []);
}

// True once `active` has been true for `ms` — used to explain slow requests.
function useSlowHint(active, ms = 8000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!active) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), ms);
    return () => clearTimeout(t);
  }, [active, ms]);
  return slow;
}

/* ── scoring (unchanged logic) ── */

function statusMeta(s) {
  const st = s || "";
  if (st.includes("CRITICAL")) return { tone: "critical", label: "Critical" };
  if (st.includes("WARNING")) return { tone: "warning", label: "Warning" };
  if (st === "ERROR") return { tone: "error", label: "Error" };
  return { tone: "normal", label: "Normal" };
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
  if (n >= 80) return { text: "Healthy", tone: "normal" };
  if (n >= 60) return { text: "Fair", tone: "warning" };
  if (n >= 40) return { text: "Degraded", tone: "critical" };
  return { text: "Critical drift", tone: "critical" };
}

// First sentence of a block of text, without regex lookbehind (older Safari).
function firstSentence(text) {
  const flat = text.replace(/\n/g, " ").trim();
  const m = flat.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : flat;
}

/* ── result components ── */

let rcaSeq = 0;

function ColumnCard({ col }) {
  const [open, setOpen] = useState(false);
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = "dw-rca-" + ++rcaSeq;

  const meta = statusMeta(col.status);
  const exp = col.gemini_explanation ? parseExp(col.gemini_explanation) : null;
  const isOk = meta.tone === "normal";
  const today = typeof col.today_value === "number" ? col.today_value : 0;
  const hasBase = typeof col.baseline_mean === "number";
  const base = hasBase ? col.baseline_mean : 0;
  // Both bars share one scale so a spike above baseline is visible as a spike.
  const scale = Math.max(Math.abs(today), Math.abs(base)) || 1;
  const diffPct =
    base !== 0 ? ((today - base) / Math.abs(base)) * 100 : null;
  const insight = exp?.what ? firstSentence(exp.what) : null;
  const hasDetail =
    exp && (exp.what || exp.causes.length > 0 || exp.action);

  return (
    <div className="rc" data-tone={meta.tone}>
      <div className="rc-head">
        <div className="rc-name">
          {col.column === "row_anomaly" ? "overall_row_check" : col.column}
        </div>
        <span className="tag">{meta.label}</span>
      </div>
      {col.change_text && <div className="rc-change">{col.change_text}</div>}
      {col.type === "numeric" && col.today_value != null && (
        <div className="meters">
          <div>
            <div className="meter-row">
              <span>Today</span>
              <b className="is-tone">{today.toLocaleString()}</b>
            </div>
            <div className="meter-track">
              <span
                className="meter-fill"
                style={{
                  width: `${Math.max((Math.abs(today) / scale) * 100, today ? 1.5 : 0)}%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="meter-row">
              <span>Baseline average</span>
              <b>{hasBase ? base.toLocaleString() : "\u2014"}</b>
            </div>
            <div className="meter-track">
              <span
                className="meter-fill is-base"
                style={{ width: `${(Math.abs(base) / scale) * 100}%` }}
              />
            </div>
          </div>
          {!isOk && (
            <div className="delta">
              <span aria-hidden="true">{today < base ? "\u25BC" : "\u25B2"}</span>
              {diffPct !== null
                ? `${Math.abs(diffPct).toFixed(1)}% ${today < base ? "below" : "above"} usual`
                : `${today < base ? "Below" : "Above"} usual`}
            </div>
          )}
        </div>
      )}
      {insight && (
        <div className="reading">
          <div className="reading-k">Summary</div>
          <p>{insight}</p>
        </div>
      )}
      {hasDetail && (
        <div className="rca">
          <button
            className="rca-toggle"
            aria-expanded={open}
            aria-controls={idRef.current}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon.Chevron size={14} />
            Root cause analysis
            <span className="rca-hint">{open ? "Collapse" : "Expand"}</span>
          </button>
          {open && (
            <div className="rca-body" id={idRef.current}>
              {exp.what && <p>{exp.what}</p>}
              {exp.causes.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  <div className="rca-k">Possible causes</div>
                  {exp.causes.map((c, i) => (
                    <div className="cause" key={i}>
                      <i>{i + 1}</i>
                      <span>{c.replace(/^\d+\.\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              )}
              {exp.action && (
                <div className="action">
                  <div className="rca-k" style={{ marginBottom: 2 }}>
                    Suggested first check
                  </div>
                  {exp.action}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreSummary({ result }) {
  const score = calcScore(result);
  const lbl = scoreLabel(score);
  const analyzed =
    result?.summary?.total_columns || (result?.columns || []).length;
  const critical = result?.summary?.critical || 0;
  const warnings = result?.summary?.warnings || 0;
  const normal = result?.summary?.normal || 0;
  return (
    <div className="score" data-tone={lbl.tone}>
      <div className="score-main">
        <div className="score-num">
          {score}
          <small>/100</small>
        </div>
        <div>
          <div className="score-k">Health score</div>
          <div className="score-label">{lbl.text}</div>
        </div>
      </div>
      <ul className="score-stats">
        <li>
          <span className="dot" data-tone="critical" />
          {critical} critical
        </li>
        <li>
          <span className="dot" data-tone="warning" />
          {warnings} {warnings === 1 ? "warning" : "warnings"}
        </li>
        <li>
          <span className="dot" data-tone="normal" />
          {normal} normal
        </li>
        <li>{analyzed} columns analyzed</li>
      </ul>
      <div className="score-bar" aria-hidden="true">
        <span style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ResultsBoard({ result, onStart }) {
  const cols = result?.columns || [];
  const flagged =
    (result?.summary?.critical || 0) + (result?.summary?.warnings || 0);
  return (
    <div className="board">
      <ScoreSummary result={result} />
      {cols.length === 0 ? (
        <div className="empty">
          <Icon.Circle size={20} />
          All columns look normal. No anomalies were detected.
        </div>
      ) : (
        <div className="rc-grid">
          {cols.map((col, i) => (
            <ColumnCard key={i} col={col} />
          ))}
        </div>
      )}
      <div className="result-cta">
        <div>
          <h3>
            {flagged > 0
              ? "This was a one-time scan. Watch this source continuously?"
              : "Nothing flagged in this file. Want to know the day that changes?"}
          </h3>
          <p>
            {flagged > 0
              ? "Set up a monitor and you'll get an email the next time a check finds an anomaly."
              : "A monitor re-checks your source on a schedule and emails you only when something moves."}
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => onStart && onStart("monitor")}
          >
            Set up a monitor
          </button>
          <div className="cta-note">No credit card required</div>
        </div>
      </div>
    </div>
  );
}

/* ── hero: drift strip ── */

const STRIP_N = 48;
const STRIP_X_MAX = 97;
const STRIP_DEV = [66, 79, 91]; // last three points leave the baseline band
const STRIP_Y = Array.from({ length: STRIP_N }, (_, i) => {
  if (i >= STRIP_N - STRIP_DEV.length)
    return STRIP_DEV[i - (STRIP_N - STRIP_DEV.length)];
  const noise =
    Math.sin(i * 1.7) * 6 + Math.sin(i * 0.63 + 1) * 5 + Math.sin(i * 3.1) * 2;
  return Math.round((50 + noise) * 100) / 100;
});
const STRIP_PTS = STRIP_Y.map((y, i) => [
  Math.round((i / (STRIP_N - 1)) * STRIP_X_MAX * 100) / 100,
  y,
]);
const STRIP_SPLIT = STRIP_N - STRIP_DEV.length - 1;
const toPoints = (pts) => pts.map((p) => p.join(",")).join(" ");

function DriftStrip() {
  const last = STRIP_PTS[STRIP_PTS.length - 1];
  return (
    <figure className="strip">
      <div
        className="strip-plot"
        role="img"
        aria-label="Illustrative chart. A column's values stay inside a shaded baseline band, then the latest value falls far below it."
      >
        <div className="strip-band" />
        <div className="strip-mean" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            className="strip-line"
            points={toPoints(STRIP_PTS.slice(0, STRIP_SPLIT + 1))}
          />
          <polyline
            className="strip-line strip-line-dev"
            points={toPoints(STRIP_PTS.slice(STRIP_SPLIT))}
          />
        </svg>
        <span className="strip-tag strip-tag-base">Baseline range</span>
        <span
          className="strip-dot"
          style={{ left: `${last[0]}%`, top: `${last[1]}%` }}
        />
        <span
          className="strip-tag strip-tag-dev"
          style={{ right: `calc(${100 - last[0]}% + 16px)`, top: `calc(${last[1]}% - 10px)` }}
        >
          Outside baseline range
        </span>
      </div>
      <figcaption className="strip-cap">
        Illustrative data. DriftWatch compares each column with its own
        history.
      </figcaption>
    </figure>
  );
}

/* ── hero: working scan tool ── */

const SCAN_STEPS = ["File", "Columns", "Settings"];
const SENS_OPTIONS = [
  { k: "low", l: "Low", d: "Big changes only" },
  { k: "medium", l: "Medium", d: "Moderate drift" },
  { k: "high", l: "High", d: "Small drifts" },
];

function HeroScanTool({ onScanComplete }) {
  const [stage, setStage] = useState("upload");
  const [file, setFile] = useState(null);
  const [cols, setCols] = useState([]);
  const [dateCol, setDateCol] = useState("");
  const [selCols, setSelCols] = useState([]);
  const [context, setContext] = useState("");
  const [sens, setSens] = useState("medium");
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const slow = useSlowHint(busy || stage === "processing");
  const nonDate = cols.filter((c) => c !== dateCol);
  const stepIndex = { upload: 0, columns: 1, configure: 2 }[stage];

  const processFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith(".csv")) {
      setErr("Choose a .csv file.");
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
        setErr("No columns were found in this file.");
        setBusy(false);
        return;
      }
      setCols(c);
      const dg = c.find((x) => /date|time/i.test(x)) || c[0];
      setDateCol(dg || "");
      setSelCols(c.filter((x) => x !== dg));
      setStage("columns");
    } catch {
      setErr("Could not read this file. Check that it is a valid CSV and try again.");
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
    const form = new FormData();
    form.append("file", file);
    form.append("date_column", dateCol);
    form.append("context", context || "data monitoring");
    form.append("sensitivity", sens);
    form.append("monitor_columns", selCols.join(","));
    try {
      const res = await axios.post(SCAN_API + "/scan", form);
      setResult(res.data);
      setStage("done");
      onScanComplete(res.data, { fileName: file?.name });
    } catch (e) {
      // FastAPI validation errors return `detail` as an array of objects;
      // rendering that directly would crash React, so only show strings.
      const detail = e.response?.data?.detail;
      setErr(
        typeof detail === "string" && detail
          ? detail
          : "The scan could not be completed. Please try again.",
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

  const toggleCol = (col) =>
    setSelCols((p) => (p.includes(col) ? p.filter((c) => c !== col) : [...p, col]));

  const score = result ? calcScore(result) : null;
  const lbl = score !== null ? scoreLabel(score) : null;
  const flagged =
    (result?.summary?.critical || 0) + (result?.summary?.warnings || 0);
  const total = result?.summary?.total_columns || selCols.length;

  return (
    <div className="panel">
      <div className="panel-head">
        <h2 className="panel-title">One-time scan</h2>
        {stepIndex !== undefined ? (
          <ol className="steps" aria-label="Progress">
            {SCAN_STEPS.map((s, i) => (
              <li
                key={s}
                className={i < stepIndex ? "done" : ""}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        ) : (
          <span className="steps">
            {stage === "processing" ? "Scanning" : "Complete"}
          </span>
        )}
      </div>

      <div className="panel-body">
        {stage === "upload" && (
          <div
            className={`dropzone ${drag ? "is-drag" : ""}`}
            role="button"
            tabIndex={0}
            aria-label="Upload a CSV file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
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
          >
            {busy ? (
              <div role="status">
                <div className="spinner" />
                <div className="center-title">Reading file</div>
                {slow && (
                  <div className="slow">
                    Still working. This can take longer than usual if the server
                    has been idle.
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="dz-icon">
                  <Icon.Upload size={20} />
                </div>
                <div className="dz-title">
                  {drag ? "Drop the file to scan it" : "Drop a CSV here, or browse"}
                </div>
                <div className="dz-sub">
                  You'll choose the date column and which columns to check next.
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => {
                processFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {stage === "columns" && (
          <>
            <div className="panel-heading">Choose what to scan</div>
            <div className="panel-meta">
              <span className="mono">{file?.name}</span>, {cols.length} columns
            </div>
            <div className="field">
              <label className="label" htmlFor="dw-date-col">
                Date column
              </label>
              <select
                id="dw-date-col"
                className="select"
                value={dateCol}
                onChange={(e) => {
                  setDateCol(e.target.value);
                  setSelCols(cols.filter((c) => c !== e.target.value));
                }}
              >
                {cols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <div className="label">
                <span id="dw-cols-label">Columns to scan</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelCols(selCols.length === nonDate.length ? [] : nonDate)
                  }
                >
                  {selCols.length === nonDate.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="chips" role="group" aria-labelledby="dw-cols-label">
                {nonDate.map((col) => {
                  const on = selCols.includes(col);
                  return (
                    <label key={col} className={`chip ${on ? "on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleCol(col)}
                      />
                      <span className="chip-box" aria-hidden="true">
                        {on && <Icon.Check size={10} />}
                      </span>
                      <span className="chip-text mono" title={col}>
                        {col}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selCols.length === 0 && (
                <div className="hint-warn">Pick at least one column.</div>
              )}
            </div>
            <div className="actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStage("upload");
                  setCols([]);
                  setFile(null);
                  setErr("");
                }}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!selCols.length) return setErr("Pick at least one column.");
                  setErr("");
                  setStage("configure");
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {stage === "configure" && (
          <>
            <div className="panel-heading">Final settings</div>
            <div className="panel-meta">
              Scanning {selCols.length} column{selCols.length !== 1 ? "s" : ""}:{" "}
              <span className="mono">{selCols.join(", ")}</span>
            </div>
            <div className="field">
              <label className="label" htmlFor="dw-context">
                What is this data? <small>Optional</small>
              </label>
              <input
                id="dw-context"
                className="input"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. daily sales of an online store"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <div className="label" id="dw-sens-label">
                Detection sensitivity
              </div>
              <div className="seg" role="radiogroup" aria-labelledby="dw-sens-label">
                {SENS_OPTIONS.map((o) => (
                  <label key={o.k}>
                    <input
                      type="radio"
                      name="dw-sens"
                      value={o.k}
                      checked={sens === o.k}
                      onChange={() => setSens(o.k)}
                    />
                    <span>
                      {o.l}
                      <small>{o.d}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStage("columns");
                  setErr("");
                }}
              >
                Back
              </button>
              <button className="btn btn-primary" onClick={runScan}>
                Detect anomalies
              </button>
            </div>
          </>
        )}

        {stage === "processing" && (
          <div className="center" role="status">
            <div className="spinner" />
            <div className="center-title">Analyzing your data</div>
            <div className="center-sub">
              Checking numeric trends, category mix, and unusual rows.
            </div>
            {slow && (
              <div className="slow">
                Still working. This can take longer than usual if the server has
                been idle.
              </div>
            )}
          </div>
        )}

        {stage === "done" && result && (
          <div data-tone={lbl.tone}>
            <div className="score-main">
              <div className="score-num">
                {score}
                <small>/100</small>
              </div>
              <div>
                <div className="score-k">Health score</div>
                <div className="score-label">{lbl.text}</div>
              </div>
            </div>
            <p className="done-text">
              {flagged} anomal{flagged === 1 ? "y" : "ies"} found across {total}{" "}
              column{total !== 1 ? "s" : ""}.
            </p>
            <div className="actions">
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: "none" }}
                onClick={() =>
                  document
                    .getElementById("dw-results")
                    ?.scrollIntoView({ block: "start" })
                }
              >
                View full analysis
              </button>
              <button className="btn btn-text btn-sm" onClick={reset}>
                Scan another file
              </button>
            </div>
          </div>
        )}

        {err && (
          <div className="msg" role="alert">
            <Icon.Alert size={14} />
            <span>{err}</span>
          </div>
        )}
      </div>

      <div className="panel-foot">
        No account needed. Files are processed in memory and not saved.
      </div>
    </div>
  );
}

/* ── landing page ── */

const NAV_LINKS = [
  { id: "how", label: "How it works" },
  { id: "detection", label: "Detection" },
  { id: "product", label: "Product" },
  { id: "security", label: "Security" },
];

function Nav({ onStart, session }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="brand" aria-label="DriftWatch, back to top">
          <Logo />
          DriftWatch
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={"#" + l.id}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {session ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onStart("monitor")}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                className="btn btn-text btn-sm nav-login"
                onClick={() => onStart("login")}
              >
                Log in
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onStart("signup")}
              >
                Sign up
              </button>
            </>
          )}
          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="dw-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Icon.Close size={18} /> : <Icon.Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div id="dw-mobile-menu" className="mobile-menu">
          <nav className="container" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a key={l.id} href={"#" + l.id} onClick={close}>
                {l.label}
              </a>
            ))}
            {!session && (
              <button
                onClick={() => {
                  close();
                  onStart("login");
                }}
              >
                Log in
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Section({ id, layout = "stack", tone, title, lede, children }) {
  return (
    <section id={id} className={`sec ${tone === "subtle" ? "sec-subtle" : ""}`}>
      <div className={`container ${layout}`}>
        <div className="sec-head">
          <h2 className="h2">{title}</h2>
          {lede && <p className="lede">{lede}</p>}
        </div>
        <div className="sec-content">{children}</div>
      </div>
    </section>
  );
}

const FLOW_WITHOUT = [
  {
    t: "A source breaks",
    d: "A sync stalls, a column goes blank, or a value jumps.",
    k: "is-break",
  },
  { t: "Reports update", d: "Dashboards and exports carry the bad data forward." },
  { t: "A decision uses it", d: "Someone acts on the number." },
  { t: "A person notices", d: "Usually because a chart looks wrong.", k: "is-late" },
];
const FLOW_WITH = [
  { t: "A source breaks", d: "The same failure, at the same moment.", k: "is-break" },
  {
    t: "The next check flags it",
    d: "Each column is compared with its own history.",
  },
  {
    t: "You get an email",
    d: "It names the column and suggests what to check first.",
    k: "is-end",
  },
];

function Timeline({ label, items }) {
  return (
    <div>
      <div className="flow-k">{label}</div>
      <ol className="tl" aria-label={label}>
        {items.map((s) => (
          <li key={s.t} className={s.k || ""}>
            <div className="tl-t">{s.t}</div>
            <div className="tl-d">{s.d}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const STEPS = [
  {
    t: "Connect a source",
    d: "Link a Google Sheet or upload a CSV, then choose the date column and the columns to watch. There is no pipeline to build.",
  },
  {
    t: "Checks run on your schedule",
    d: "On every check, each watched column is compared with its own history by three detectors, and the run is logged.",
  },
  {
    t: "Get an email when something moves",
    d: "The alert names the column, shows today's value against its baseline, and explains what likely happened and what to check first. Clean runs stay quiet.",
  },
];

const EXAMPLE_COLUMN = {
  column: "orders",
  type: "numeric",
  status: "CRITICAL",
  today_value: 412,
  baseline_mean: 2430,
  change_text: "Latest value is far below this column's usual range.",
  gemini_explanation:
    "WHAT HAPPENED:\nDaily orders fell to 412 against a typical 2,430. No other watched column changed shape, so the drop looks isolated to this one.\n" +
    "POSSIBLE CAUSES:\n1. The upstream export or sync stopped partway through the day.\n2. Rows from one sales channel were not loaded.\n3. A filter or formula in the source sheet was changed.\n" +
    "RECOMMENDED ACTION:\nCheck when the source sheet last updated, then compare row counts per channel with yesterday.",
};

/* Detector figures: small, illustrative, signal colour only on the anomaly. */

function FigNumeric() {
  const pts = [
    [8, 60], [34, 54], [60, 66], [86, 58], [112, 64],
    [138, 56], [164, 62], [190, 68], [214, 58],
  ];
  const last = [232, 108];
  return (
    <svg
      viewBox="0 0 240 128"
      role="img"
      aria-label="Illustrative line chart. Values stay inside a shaded baseline range, then the latest value drops far below it."
    >
      <rect className="fig-band" x="0" y="42" width="240" height="38" />
      <line className="fig-mean" x1="0" y1="61" x2="240" y2="61" />
      <text className="fig-text" x="4" y="36">Baseline range</text>
      <polyline className="fig-line" points={toPoints(pts)} />
      <line
        className="fig-line fig-line-dev"
        x1={pts[pts.length - 1][0]}
        y1={pts[pts.length - 1][1]}
        x2={last[0]}
        y2={last[1]}
      />
      <circle className="fig-dot" cx={last[0]} cy={last[1]} r="4" />
      <text className="fig-text fig-text-dev" x="222" y="112" textAnchor="end">
        Latest
      </text>
    </svg>
  );
}

function BarRow({ y, parts }) {
  let x = 56;
  return parts.map((p, i) => {
    const w = (p / 100) * 176;
    const rect = (
      <rect
        key={i}
        className={`fig-s${i} fig-seg`}
        x={x}
        y={y}
        width={w}
        height="22"
      />
    );
    x += w;
    return rect;
  });
}

function FigCategory() {
  const base = [38, 27, 21, 14];
  const today = [78, 10, 8, 4];
  return (
    <svg
      viewBox="0 0 240 128"
      role="img"
      aria-label="Illustrative stacked bars. The share of one category in today's data is much larger than in the baseline."
    >
      <text className="fig-text" x="0" y="41">Baseline</text>
      <BarRow y={26} parts={base} />
      <text className="fig-text" x="0" y="87">Today</text>
      <BarRow y={72} parts={today} />
      <line className="fig-flag" x1="56" y1="102" x2={56 + 0.78 * 176} y2="102" />
      <text className="fig-text fig-text-dev" x="56" y="118">Mix has shifted</text>
    </svg>
  );
}

const jitter = (i) => {
  const r = Math.sin((i + 1) * 127.1) * 43758.5453;
  return (r - Math.floor(r)) * 2 - 1;
};
const SCATTER = Array.from({ length: 24 }, (_, i) => {
  const x = 40 + i * 7.6;
  const y = 100 - (x - 40) * 0.42 + jitter(i) * 8;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
});

function FigMultivariate() {
  const out = [66, 34];
  return (
    <svg
      viewBox="0 0 240 128"
      role="img"
      aria-label="Illustrative scatter plot. Most points follow a diagonal pattern. One point sits off the pattern, even though each of its two values is within the usual range."
    >
      <line className="fig-axis" x1="24" y1="112" x2="232" y2="112" />
      <line className="fig-axis" x1="24" y1="12" x2="24" y2="112" />
      {SCATTER.map(([x, y], i) => (
        <circle key={i} className="fig-pt" cx={x} cy={y} r="2.2" />
      ))}
      <line className="fig-proj" x1={out[0]} y1={out[1]} x2={out[0]} y2="112" />
      <line className="fig-proj" x1={out[0]} y1={out[1]} x2="24" y2={out[1]} />
      <circle className="fig-dot" cx={out[0]} cy={out[1]} r="4" />
      <text className="fig-text fig-text-dev" x="76" y="30">Unusual together</text>
      <text className="fig-text" x="232" y="124" textAnchor="end">Column A</text>
      <text className="fig-text" x="30" y="20">Column B</text>
    </svg>
  );
}

const DETECTORS = [
  {
    fig: <FigNumeric />,
    tag: "Z-score",
    title: "Numeric drift",
    desc: "Each numeric column is scored against the mean and spread of its own history. A value that lands far outside its usual range is flagged and graded as a warning or critical.",
  },
  {
    fig: <FigCategory />,
    tag: "Distribution shift",
    title: "Category shift",
    desc: "Compares the mix of values in a category column with its baseline. It catches a status field that suddenly skews to one value, or a region that goes quiet.",
  },
  {
    fig: <FigMultivariate />,
    tag: "Isolation Forest",
    title: "Multivariate anomalies",
    desc: "Scores each row across the selected columns together, so an unusual combination is flagged even when every value looks normal on its own.",
  },
];

const PRODUCT_ITEMS = [
  {
    t: "Automated monitoring",
    tag: "Google Sheets and CSV",
    d: "Connect a source and choose a schedule. DriftWatch checks it in the background and compares every watched column with its own history.",
  },
  {
    t: "One-time scans",
    tag: "No account needed",
    d: "Upload a CSV and read the anomaly report in your browser. Nothing is written to a database.",
  },
  {
    t: "Run history",
    tag: "Per monitor",
    d: "Every check is logged on a timeline, so a recurring pattern reads as a pattern instead of a single incident.",
  },
  {
    t: "Written explanations",
    tag: "Generated with Google Gemini",
    d: "Each flagged column comes with a plain-language summary of what changed, possible causes, and a suggested first check. Treat the causes as leads to verify, not conclusions.",
  },
  {
    t: "Email alerts",
    tag: "Only when something is found",
    d: "You are emailed when a check finds an anomaly. Runs with nothing to report send nothing.",
  },
  {
    t: "Monitor controls",
    tag: "You decide",
    d: "Pause, resume, or delete a monitor whenever you want. Nothing runs that you did not set up.",
  },
];

const SECURITY_ITEMS = [
  {
    tag: "Row-level security",
    t: "Accounts are isolated",
    d: "Each user can only read and write their own monitors and run history. The rule is enforced inside the database, not only in application code.",
  },
  {
    tag: "Every request",
    t: "Requests are verified",
    d: "Requests for your saved data are checked against your signed-in session on every call.",
  },
  {
    tag: "Google or email",
    t: "Standard sign-in",
    d: "Continue with Google or with an email address. Authentication is handled by Supabase Auth.",
  },
  {
    tag: "In memory",
    t: "One-time scans are not stored",
    d: "A file uploaded for a one-time scan is processed in memory and is not written to a database.",
  },
];

function LandingPage({ onStart, session }) {
  useFonts();
  const scanRef = useRef(null);
  const resultsRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanMeta, setScanMeta] = useState(null);

  const scrollToScan = () =>
    scanRef.current?.scrollIntoView({ block: "center" });

  const handleScanComplete = (result, meta) => {
    setScanResult(result);
    setScanMeta(meta || null);
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ block: "start" }),
      380,
    );
  };

  const primaryLabel = session ? "Go to dashboard" : "Start monitoring";
  const primaryAction = () => onStart(session ? "monitor" : "signup");

  return (
    <div className="dw" id="top">
      <style>{GLOBAL_CSS}</style>
      <Nav onStart={onStart} session={session} />

      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-grid">
              <div>
                <h1 className="h1">
                  Catch bad data before anyone makes a decision on it.
                </h1>
                <p className="hero-sub">
                  DriftWatch monitors Google Sheets and CSV files against their
                  own history. When a value, a category mix, or a whole row
                  stops matching its pattern, it emails you what changed and
                  what to check first.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={primaryAction}
                  >
                    {primaryLabel}
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={scrollToScan}
                  >
                    Scan a CSV
                  </button>
                </div>
              </div>
              <div ref={scanRef} id="dw-scan">
                <HeroScanTool onScanComplete={handleScanComplete} />
              </div>
            </div>
            <DriftStrip />
          </div>
        </section>

        {scanResult && (
          <section
            ref={resultsRef}
            id="dw-results"
            className="results"
            aria-label="Scan result"
          >
            <div className="container">
              <div className="results-head">
                <h2>Scan result</h2>
                {scanMeta?.fileName && (
                  <span className="results-file mono">{scanMeta.fileName}</span>
                )}
              </div>
              <ResultsBoard result={scanResult} onStart={onStart} />
            </div>
          </section>
        )}

        <Section
          id="problem"
          layout="split"
          title="Most data problems are found by whoever notices first."
          lede="Spreadsheets and CSV exports quietly feed reports and decisions. Usually no one is assigned to watch them, so a stalled sync or a column that goes blank shows up as a chart that looks wrong in a meeting, after the number has already been used."
        >
          <div className="flows">
            <Timeline label="Without monitoring" items={FLOW_WITHOUT} />
            <Timeline label="With DriftWatch" items={FLOW_WITH} />
          </div>
          <p className="note">
            Illustrative sequence. How soon a problem is caught depends on the
            schedule you set.
          </p>
        </Section>

        <Section
          id="how"
          tone="subtle"
          title="From a connected source to an explained alert."
        >
          <div className="how">
            <ol>
              {STEPS.map((s, i) => (
                <li className="step" key={s.t}>
                  <span className="step-n">{i + 1}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <figure className="example">
              <figcaption className="example-head">
                <span>Example column result</span>
                <span>Sample data</span>
              </figcaption>
              <div className="example-body">
                <ColumnCard col={EXAMPLE_COLUMN} />
              </div>
              <p className="example-note">
                An alert reports the column, today's value against its baseline,
                and an explanation. Open Root cause analysis to read the full
                text.
              </p>
            </figure>
          </div>
        </Section>

        <Section
          id="detection"
          title="Three detectors run on every check."
          lede="A break in a spreadsheet rarely looks the same way twice, so each check runs all three."
        >
          <div className="cells cols-3">
            {DETECTORS.map((d) => (
              <div className="cell" key={d.title}>
                <div className="fig">{d.fig}</div>
                <div className="cell-tag">{d.tag}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
          <p className="note">
            Diagrams are illustrative and do not show real data.
          </p>
        </Section>

        <Section
          id="product"
          layout="split"
          tone="subtle"
          title="What's in the product."
        >
          <dl className="defs">
            {PRODUCT_ITEMS.map((p) => (
              <div className="def" key={p.t}>
                <div className="def-head">
                  <dt>{p.t}</dt>
                  <span className="def-tag">{p.tag}</span>
                </div>
                <dd>{p.d}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          id="security"
          layout="split"
          title="How your data is handled."
          lede="Account data is isolated in both the application and the database, so isolation does not depend on a single layer."
        >
          <div className="cells cols-2">
            {SECURITY_ITEMS.map((s) => (
              <div className="cell" key={s.t}>
                <div className="cell-tag">{s.tag}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="closing">
          <div className="container closing-grid">
            <div>
              <h2 className="h2">
                Find out about data problems before the meeting.
              </h2>
              <p className="lede">
                Scan a file now without an account, or set up a monitor that
                keeps checking on its own.
                {!session && " No credit card required."}
              </p>
            </div>
            <div className="closing-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={primaryAction}
              >
                {primaryLabel}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={scrollToScan}
              >
                Scan a CSV
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#top" className="brand">
                <Logo />
                DriftWatch
              </a>
              <p className="footer-blurb">
                Monitoring for Google Sheets and CSV files. Flags unusual
                changes against each column's own history.
              </p>
            </div>
            <nav className="footer-col" aria-label="Product">
              <h3>Product</h3>
              {NAV_LINKS.map((l) => (
                <a key={l.id} href={"#" + l.id}>
                  {l.label}
                </a>
              ))}
            </nav>
            <nav className="footer-col" aria-label="Get started">
              <h3>Get started</h3>
              <button onClick={scrollToScan}>Scan a CSV</button>
              {session ? (
                <button onClick={() => onStart("monitor")}>Dashboard</button>
              ) : (
                <>
                  <button onClick={() => onStart("signup")}>Sign up</button>
                  <button onClick={() => onStart("login")}>Log in</button>
                </>
              )}
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </nav>
            <div className="footer-col">
              <h3>Built with</h3>
              <ul>
                <li>React</li>
                <li>Python and FastAPI</li>
                <li>scikit-learn</li>
                <li>Supabase</li>
                <li>Google Gemini</li>
                <li>APScheduler</li>
                <li>Brevo email API</li>
                <li>Vercel and Render</li>
              </ul>
            </div>
          </div>
          <div className="footer-base">
            <span>&copy; {new Date().getFullYear()} DriftWatch</span>
            <span>Built by Prajwal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── root app (routing and auth behaviour unchanged) ── */

export default function App() {
  const [page, setPage] = useState("landing"),
    [session, setSession] = useState(null),
    [showAuthModal, setShowAuthModal] = useState(false),
    [authMode, setAuthMode] = useState("login");
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
      else {
        setAuthMode("login");
        setShowAuthModal(true);
      }
      return;
    }
    if (p === "login" || p === "signup") {
      setAuthMode(p);
      setShowAuthModal(true);
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
          initialMode={authMode}
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