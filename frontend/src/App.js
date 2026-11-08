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