import { useState, useEffect, useMemo, Fragment } from "react";
import axios from "axios";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const API = "http://localhost:8000";
// const API = "https://driftwatch-backend.onrender.com";

const authHeaders = (session) => ({
  headers: { Authorization: `Bearer ${session.access_token}` },
});

const INTERVAL_OPTIONS = [
  { value: 1,   label: "Every 1 hour" },
  { value: 3,   label: "Every 3 hours" },
  { value: 6,   label: "Every 6 hours" },
  { value: 12,  label: "Every 12 hours" },
  { value: 24,  label: "Every day" },
  { value: 48,  label: "Every 2 days" },
  { value: 168, label: "Every week" },
];

// GLOBAL STYLES

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

.dwapp{
  --white:#FFFFFF;
  --ink:#0B0E14;
  --slate-900:#0F172A;
  --slate-700:#344054;
  --slate-600:#475467;
  --slate-500:#667085;
  --slate-400:#98A2B3;
  --slate-300:#D0D5DD;
  --slate-200:#E4E7EC;
  --slate-100:#F2F4F7;
  --slate-50:#F9FAFB;
  --surface-alt:#F0F2F7;
  --indigo:#4F46E5;
  --indigo-600:#4338CA;
  --indigo-50:#EEF2FF;
  --indigo-100:#E0E7FF;
  --emerald:#10B981;
  --emerald-50:#ECFDF5;
  --emerald-600:#059669;
  --amber:#F59E0B;
  --amber-50:#FFFBEB;
  --amber-600:#B45309;
  --red:#EF4444;
  --red-50:#FEF2F2;
  --red-600:#B91C1C;
  --font-sans:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace;
  font-family:var(--font-sans);
  color:var(--slate-700);
  background:var(--white);
  height:100vh;
  width:100%;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
.dwapp *{box-sizing:border-box;}
.dwapp button{font-family:inherit;}
.dwapp input,.dwapp select{font-family:inherit;}
.mono{font-family:var(--font-mono);}

/* topbar */
.topbar{height:58px;flex-shrink:0;display:flex;align-items:center;gap:12px;padding:0 18px;border-bottom:1px solid var(--slate-200);background:#fff;z-index:50;}
.iconbtn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;border:1px solid var(--slate-200);background:#fff;color:var(--slate-600);cursor:pointer;transition:all .15s ease;flex-shrink:0;}
.iconbtn:hover{border-color:var(--slate-300);color:var(--slate-900);background:var(--slate-50);}
.drawer-toggle{display:none;}

/* shell */
.shell{flex:1;display:flex;min-height:0;position:relative;}

/* sidebar */
.sidebar{width:300px;flex-shrink:0;border-right:1px solid var(--slate-200);display:flex;flex-direction:column;background:#fff;min-height:0;}
.sidebar-head{padding:14px 12px 10px;flex-shrink:0;}
.sidebar-list{flex:1;overflow-y:auto;padding:2px 8px;}
.sidebar-foot{padding:10px;border-top:1px solid var(--slate-200);flex-shrink:0;}

.search-box{position:relative;}
.search-box input{width:100%;padding:9px 12px 9px 34px;border:1.5px solid var(--slate-200);border-radius:10px;font-size:13px;outline:none;background:var(--slate-50);color:var(--slate-900);transition:border-color .15s ease,background .15s ease;}
.search-box input:focus{border-color:var(--indigo);background:#fff;}
.search-box input::placeholder{color:var(--slate-400);}
.search-box .icn{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--slate-400);pointer-events:none;}

.monitor-item{display:block;width:100%;text-align:left;padding:10px 11px;border-radius:11px;border:1px solid transparent;cursor:pointer;margin-bottom:3px;background:transparent;transition:background .15s ease,border-color .15s ease;}
.monitor-item:hover{background:var(--slate-50);}
.monitor-item.active{background:var(--indigo-50);border-color:var(--indigo-100);}
.status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.mini-pill{font-size:9.5px;font-weight:700;letter-spacing:.02em;color:var(--slate-500);background:var(--slate-100);padding:2px 7px;border-radius:999px;flex-shrink:0;}

/* main */
.main{flex:1;min-width:0;overflow-y:auto;background:var(--surface-alt);}
.main-inner{max-width:1160px;margin:0 auto;padding:24px 24px 60px;}

/* panel */
.panel{background:#fff;border:1px solid var(--slate-200);border-radius:16px;box-shadow:0 2px 10px rgba(16,24,40,.05);}

/* kpi */
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:860px){.kpi-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:500px){.kpi-grid{grid-template-columns:repeat(2,1fr);}}
.kpi-card{padding:15px 16px;}
.kpi-label{font-size:11.5px;color:var(--slate-500);font-weight:600;display:flex;align-items:center;gap:6px;}
.kpi-value{font-size:24px;font-weight:800;color:var(--slate-900);margin-top:7px;letter-spacing:-.02em;}
.kpi-sub{font-size:11.5px;color:var(--slate-400);margin-top:4px;}

/* charts row */
.charts-row{display:grid;grid-template-columns:1.6fr 1fr;gap:12px;}
@media(max-width:860px){.charts-row{grid-template-columns:1fr;}}

/* timeline */
.timeline-track{display:flex;gap:3px;align-items:stretch;height:34px;}
.timeline-bar{flex:1;border-radius:5px;min-width:4px;cursor:pointer;transition:opacity .12s ease;}
.timeline-bar:hover{opacity:.75;}

/* badges */
.badge{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;flex-shrink:0;}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:13.5px;border-radius:9px;padding:9px 15px;cursor:pointer;border:1px solid transparent;transition:all .15s ease;white-space:nowrap;}
.btn-sm{padding:7px 12px;font-size:12.5px;}
.btn-primary{background:var(--indigo);color:#fff;}
.btn-primary:hover:not(:disabled){background:var(--indigo-600);}
.btn-outline{background:#fff;color:var(--slate-700);border-color:var(--slate-200);}
.btn-outline:hover:not(:disabled){border-color:var(--slate-300);background:var(--slate-50);}
.btn-outline-danger{background:#fff;color:var(--red);border-color:#FECACA;}
.btn-outline-danger:hover:not(:disabled){background:var(--red-50);}
.btn:disabled{opacity:.5;cursor:not-allowed;}
.btn:focus-visible,.iconbtn:focus-visible,.monitor-item:focus-visible{outline:2px solid var(--indigo);outline-offset:2px;}

/* form */
.field-label{font-size:12.5px;color:var(--slate-600);font-weight:600;display:block;margin-bottom:7px;}
.field-input{width:100%;padding:10px 13px;border:1.5px solid var(--slate-200);border-radius:10px;font-size:13.5px;outline:none;background:#fff;color:var(--slate-900);transition:border-color .15s ease;}
.field-input:focus{border-color:var(--indigo);}
.field-hint{font-size:11.5px;color:var(--slate-400);margin-top:5px;}
.step-dot{width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;transition:all .2s ease;}
.select-sm{font-size:12px;padding:5px 10px;border:1px solid var(--slate-200);border-radius:8px;color:var(--slate-700);background:#fff;outline:none;cursor:pointer;}
.select-sm:focus{border-color:var(--indigo);}

/* filter pills */
.filter-pill{font-size:12px;font-weight:600;padding:5px 11px;border-radius:999px;border:1px solid var(--slate-200);background:#fff;color:var(--slate-500);cursor:pointer;transition:all .15s ease;}
.filter-pill.active{background:var(--indigo);border-color:var(--indigo);color:#fff;}
.filter-pill:hover:not(.active){border-color:var(--slate-300);color:var(--slate-700);}

/* table */
.dw-table{width:100%;border-collapse:collapse;font-size:13px;}
.dw-table th{text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--slate-400);font-weight:700;padding:0 12px 10px;border-bottom:1px solid var(--slate-200);}
.dw-table td{padding:11px 12px;border-bottom:1px solid var(--slate-100);vertical-align:middle;}
.dw-table tr:last-child>td{border-bottom:none;}
.row-hover{cursor:pointer;transition:background .1s ease;}
.row-hover:hover{background:var(--slate-50);}

/* skeleton */
.skel{background:linear-gradient(90deg,var(--slate-100) 25%,var(--slate-50) 37%,var(--slate-100) 63%);background-size:400% 100%;animation:shimmer 1.4s ease infinite;border-radius:7px;display:block;}
@keyframes shimmer{0%{background-position:100% 50%;}100%{background-position:0 50%;}}
@keyframes spin{to{transform:rotate(360deg);}}

/* toast */
.toast-stack{position:fixed;top:68px;right:16px;z-index:400;display:flex;flex-direction:column;gap:9px;max-width:320px;}
.toast{background:#fff;border:1px solid var(--slate-200);border-radius:12px;padding:11px 13px;box-shadow:0 14px 34px rgba(16,24,40,.14);display:flex;gap:9px;align-items:flex-start;animation:toastIn .22s cubic-bezier(.16,1,.3,1);}
@keyframes toastIn{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}

/* empty */
.empty-wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px;}

/* fade-in for panels */
.fade-in{animation:fadeIn .32s cubic-bezier(.16,1,.3,1);}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* responsive drawer */
@media(max-width:860px){
  .drawer-toggle{display:inline-flex;}
  .sidebar{position:fixed;top:58px;bottom:0;left:0;z-index:220;transform:translateX(-100%);transition:transform .25s ease;box-shadow:20px 0 44px rgba(0,0,0,.12);}
  .sidebar.open{transform:translateX(0);}
  .drawer-overlay{position:fixed;top:58px;left:0;right:0;bottom:0;background:rgba(15,23,42,.32);z-index:210;}
  .main-inner{padding:16px 14px 48px;}
}

@media(prefers-reduced-motion:reduce){
  .fade-in,.toast,.skel{animation:none!important;}
}
`;

// ICONS

function mkIcon(children, opts={}) {
  const sw = opts.strokeWidth || 1.7;
  const filled = !!opts.filled;
  return function Ico({ size=16, style={}, className="" }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24"
        fill={filled?"currentColor":"none"} stroke={filled?"none":"currentColor"}
        strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
        style={style} className={className}>
        {children}
      </svg>
    );
  };
}

const Ico = {
  Search:   mkIcon(<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.3-4.3"/></>),
  x:        mkIcon(<path d="M5 5l14 14M19 5 5 19"/>),
  Plus:     mkIcon(<path d="M12 5v14M5 12h14"/>),
  Chev:     mkIcon(<path d="m6 9 6 6 6-6"/>),
  Play:     mkIcon(<path d="M7 4.5v15l13-7.5Z"/>,{filled:true}),
  Pause:    mkIcon(<><rect x="6" y="4.5" width="4.5" height="15" rx="1"/><rect x="13.5" y="4.5" width="4.5" height="15" rx="1"/></>,{filled:true}),
  Trash:    mkIcon(<><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></>),
  Refresh:  mkIcon(<><path d="M3.5 12a8.5 8.5 0 0 1 14.7-5.8M20.5 12a8.5 8.5 0 0 1-14.7 5.8"/><path d="M18.2 3v4h-4M5.8 21v-4h4"/></>),
  Menu:     mkIcon(<path d="M4 7h16M4 12h16M4 17h16"/>),
  Back:     mkIcon(<path d="M20 12H4M10 6l-6 6 6 6"/>),
  Mail:     mkIcon(<><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/></>),
  Alert:    mkIcon(<><path d="M12 3.5 22 20H2L12 3.5Z"/><path d="M12 10v4"/><circle cx="12" cy="17.2" r=".4" fill="currentColor" stroke="none"/></>),
  Check:    mkIcon(<><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></>),
  info:     mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.7" r=".4" fill="currentColor" stroke="none"/></>),
  Activity: mkIcon(<polyline points="2 14 7.5 14 10 7 14 19 16.5 14 22 14"/>),
  Clock:    mkIcon(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>),
  User:     mkIcon(<><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6"/></>),
  Logout:   mkIcon(<><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M16 16l4-4-4-4"/><path d="M20 12H9"/></>),
  Plug:     mkIcon(<><path d="M9 2v4M15 2v4M7.5 8h9a1.5 1.5 0 0 1 1.5 1.5v2A5.5 5.5 0 0 1 12.5 17h-1A5.5 5.5 0 0 1 6 11.5v-2A1.5 1.5 0 0 1 7.5 8Z"/><path d="M12 17v3M9 22h6"/></>),
  Bar:      mkIcon(<path d="M4 21V10M11 21V3M18 21v-7"/>),
};

function Spinner({ size=13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{animation:"spin .7s linear infinite",flexShrink:0}}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" opacity=".25"/>
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function Logo({ size=24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="#0B0E14"/>
      <path d="M7 20.5 12 13l4 5 4.5-8L25 17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="18" r="2" fill="#4F46E5"/>
    </svg>
  );
}

// STATUS HELPERS

function statusMeta(s) {
  const st = s || "";
  if (st==="CRITICAL"||st.includes("CRITICAL")) return {color:"#EF4444",bg:"#FEF2F2",text:"#B91C1C",label:"Critical"};
  if (st==="WARNING" ||st.includes("WARNING"))  return {color:"#F59E0B",bg:"#FFFBEB",text:"#B45309",label:"Warning"};
  if (st==="ERROR")                              return {color:"#F97316",bg:"#FFF7ED",text:"#C2410C",label:"Error"};
  return {color:"#10B981",bg:"#ECFDF5",text:"#059669",label:"Normal"};
}
const isNormal = (s) => !s || (s||"").includes("NORMAL");

function parseExp(text) {
  if (!text) return null;
  const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
  const a = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
  return { what: w?.[1]?.trim(), action: a?.[1]?.trim() };
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
}
function fmtShort(d) {
  return new Date(d).toLocaleString(undefined,{month:"short",day:"numeric"});
}
function rel(d) {
  if (!d) return "Never";
  const m = Math.floor((Date.now()-new Date(d))/60000);
  if (m<1) return "Just now";
  if (m<60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h<24) return `${h}h ago`;
  const dy = Math.floor(h/24); if (dy<30) return `${dy}d ago`;
  return new Date(d).toLocaleDateString();
}
// function fmtInterval(h) {
//   if (h===24) return "day"; if (h===48) return "2 days"; if (h===168) return "week";
//   return h ? `${h}h` : "—";
// }
function healthScore(history, monitor) {
  if (history?.length) {
    const w = (s) => isNormal(s)?1: statusMeta(s).label==="Warning"?0.5:0;
    return Math.round((history.reduce((a,r)=>a+w(r.overall_status),0)/history.length)*100);
  }
  if (monitor?.total_runs) {
    return Math.round(Math.max(0,Math.min(1,1-(monitor.total_alerts||0)/monitor.total_runs))*100);
  }
  return null;
}

// TOASTS

function useToasts() {
  const [toasts,setToasts] = useState([]);
  const push = (type,message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t=>[...t,{id,type,message}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4500);
  };
  const dismiss = (id) => setToasts(t=>t.filter(x=>x.id!==id));
  return {toasts,push,dismiss};
}

function ToastStack({toasts,onDismiss}) {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t=>{
        const color = t.type==="error"?"var(--red)":t.type==="success"?"var(--emerald)":"var(--indigo)";
        const I = t.type==="error"?Ico.Alert:t.type==="success"?Ico.Check:Ico.info;
        return (
          <div key={t.id} className="toast">
            <div style={{color,flexShrink:0,marginTop:1}}><I size={15}/></div>
            <div style={{flex:1,fontSize:13,color:"var(--slate-700)",lineHeight:1.5}}>{t.message}</div>
            <button onClick={()=>onDismiss(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--slate-300)",padding:0}}>
              <Ico.x size={13}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// SKELETONS

function Skel({w="100%",h=14,r=7,style={}}) {
  return <span className="skel" style={{width:w,height:h,borderRadius:r,display:"block",...style}}/>;
}

function MonitorItemSkeleton() {
  return (
    <div style={{padding:"10px 11px",marginBottom:3}}>
      <Skel w="60%" h={12}/>
      <div style={{display:"flex",gap:8,marginTop:9}}><Skel w={44} h={9}/><Skel w={36} h={9}/><Skel w={42} h={9}/></div>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="kpi-grid" style={{marginBottom:12}}>
      {[0,1,2,3].map(i=>(
        <div key={i} className="panel kpi-card">
          <Skel w={72} h={10}/>
          <Skel w={52} h={22} style={{marginTop:9}}/>
          <Skel w={88} h={9} style={{marginTop:7}}/>
        </div>
      ))}
    </div>
  );
}

function EmptyMini({text,height=140}) {
  return (
    <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--slate-400)",fontSize:13,textAlign:"center",padding:"0 20px"}}>
      {text}
    </div>
  );
}

// SIDEBAR

function MonitorItem({monitor,active,onClick}) {
  const meta = statusMeta(monitor.last_status);
  const paused = monitor.status !== "active";
  return (
    <button className={`monitor-item ${active?"active":""}`} onClick={onClick}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span className="status-dot" style={{background:paused?"var(--slate-300)":meta.color}}/>
        <span style={{fontWeight:600,fontSize:13.5,color:"var(--slate-900)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {monitor.name}
        </span>
        {paused && <span className="mini-pill">PAUSED</span>}
      </div>
      <div style={{display:"flex",gap:8,marginTop:7,fontSize:11.5,color:"var(--slate-400)"}}>
        <span>{rel(monitor.last_run)}</span>
        <span>·</span><span>{monitor.total_runs??0} runs</span>
        <span>·</span><span>{monitor.total_alerts??0} alerts</span>
      </div>
    </button>
  );
}

function Sidebar({monitors,loading,selectedId,onSelect,search,onSearch,onCreate,open}) {
  return (
    <aside className={`sidebar ${open?"open":""}`}>
      <div className="sidebar-head">
        <div style={{fontWeight:800,fontSize:14,color:"var(--slate-900)",marginBottom:10}}>Monitors</div>
        <div className="search-box">
          <span className="icn"><Ico.Search size={14}/></span>
          <input placeholder="Search…" value={search} onChange={e=>onSearch(e.target.value)}/>
        </div>
      </div>

      <div className="sidebar-list">
        {loading && Array.from({length:4}).map((_,i)=><MonitorItemSkeleton key={i}/>)}
        {!loading && monitors.length===0 && (
          <div style={{fontSize:13,color:"var(--slate-400)",textAlign:"center",padding:"28px 12px",lineHeight:1.6}}>
            {search?"No monitors match.":"Create your first monitor below."}
          </div>
        )}
        {!loading && monitors.map(m=>(
          <MonitorItem key={m.id} monitor={m} active={m.id===selectedId} onClick={()=>onSelect(m.id)}/>
        ))}
      </div>

      <div className="sidebar-foot">
        <button className="btn btn-primary" style={{width:"100%"}} onClick={onCreate}>
          <Ico.Plus size={15}/> Create monitor
        </button>
      </div>
    </aside>
  );
}

// EMPTY STATE

function EmptyState({onCreate,hasMonitors}) {
  return (
    <div className="empty-wrap fade-in">
      <svg width="200" height="156" viewBox="0 0 200 156" fill="none" style={{marginBottom:24}}>
        <rect x="10" y="12" width="180" height="132" rx="20" fill="#F0F2F7"/>
        <path d="M34 104 64 80 92 94 126 50 168 72" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="126" cy="50" r="6" fill="#fff" stroke="#EF4444" strokeWidth="2.5"/>
        <circle cx="38" cy="44" r="4" fill="#E0E7FF"/>
        <circle cx="168" cy="120" r="5.5" fill="#D1FAE5"/>
        <circle cx="174" cy="36" r="3.5" fill="#FEF3C7"/>
      </svg>
      <div style={{fontWeight:800,fontSize:18,color:"var(--slate-900)",marginBottom:8}}>
        {hasMonitors?"Select a monitor":"No monitors yet"}
      </div>
      <p style={{fontSize:14,color:"var(--slate-500)",maxWidth:320,lineHeight:1.65,marginBottom:22}}>
        Pick a monitor from the left to see its health score, trends, and scan history — or create a new one in minutes.
      </p>
      <button className="btn btn-primary" onClick={onCreate}><Ico.Plus size={15}/> Create monitor</button>
    </div>
  );
}

// KPI CARD

function KPICard({icon,label,value,sub,accent}) {
  return (
    <div className="panel kpi-card">
      <div className="kpi-label" style={accent?{color:accent}:{}}>{icon}{label}</div>
      <div className="kpi-value" style={accent?{color:accent}:{}}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// RECHARTS CUSTOM TOOLTIP

function ChartTip({active,payload,label}) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:"var(--ink)",color:"#fff",padding:"9px 12px",borderRadius:10,fontSize:12,boxShadow:"0 12px 28px rgba(0,0,0,.25)"}}>
      <div className="mono" style={{color:"rgba(255,255,255,.5)",marginBottom:4}}>{label}</div>
      {payload.filter(p=>p.value!=null).map(p=>(
        <div key={p.dataKey} style={{display:"flex",justifyContent:"space-between",gap:16}}>
          <span style={{color:"rgba(255,255,255,.7)"}}>{p.dataKey==="value"?"Value":"Baseline"}</span>
          <span style={{fontWeight:700}}>{typeof p.value==="number"?p.value.toLocaleString():"—"}</span>
        </div>
      ))}
    </div>
  );
}

// METRIC TREND CHART

function MetricTrendChart({history}) {
  const numericCols = useMemo(()=>{
    const s = new Set();
    history.forEach(r=>(r.column_results||[]).forEach(c=>{
      if (c.type==="numeric"&&c.column!=="row_anomaly") s.add(c.column);
    }));
    return Array.from(s);
  },[history]);

  const [metric,setMetric] = useState(null);
  useEffect(()=>{
    if (!numericCols.length){setMetric(null);return;}
    if (!metric||!numericCols.includes(metric)) setMetric(numericCols[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[numericCols]);

  const data = useMemo(()=>{
    if (!metric) return [];
    return [...history].reverse().map(r=>{
      const col = (r.column_results||[]).find(c=>c.column===metric);
      return {
        label: fmtShort(r.scanned_at),
        value: col&&typeof col.today_value==="number"?col.today_value:null,
        baseline: col&&typeof col.baseline_mean==="number"?col.baseline_mean:null,
      };
    });
  },[history,metric]);

  const hasData = metric && data.some(d=>d.value!=null);

  return (
    <div className="panel" style={{padding:"16px 16px 8px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontWeight:700,fontSize:13.5,color:"var(--slate-900)"}}>Metric trend</div>
        {numericCols.length>1 && (
          <select className="select-sm" value={metric||""} onChange={e=>setMetric(e.target.value)}>
            {numericCols.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {numericCols.length===1 && (
          <span className="mono" style={{fontSize:11.5,color:"var(--slate-400)"}}>{metric}</span>
        )}
      </div>

      {!hasData
        ? <EmptyMini text="No numeric data yet — run a scan to see the trend." height={220}/>
        : (
          <div style={{height:228,marginTop:4}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{top:6,right:6,bottom:0,left:-18}}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.22}/>
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF0F4" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:11,fill:"#98A2B3"}} axisLine={{stroke:"#E4E7EC"}} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"#98A2B3"}} axisLine={false} tickLine={false} width={40}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="baseline" stroke="#CBD2DE" strokeWidth={1.5}
                  strokeDasharray="4 4" fill="none" connectNulls/>
                <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2.2}
                  fill="url(#trendFill)" connectNulls
                  dot={{r:3,fill:"#4F46E5",strokeWidth:0}} activeDot={{r:5}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )
      }
    </div>
  );
}

// STATUS DONUT

function StatusDonut({history}) {
  const data = useMemo(()=>{
    const c={Normal:0,Warning:0,Critical:0};
    history.forEach(r=>{
      if (isNormal(r.overall_status)) c.Normal++;
      else if (statusMeta(r.overall_status).label==="Warning") c.Warning++;
      else c.Critical++;
    });
    return [
      {name:"Normal",value:c.Normal,color:"#10B981"},
      {name:"Warning",value:c.Warning,color:"#F59E0B"},
      {name:"Critical",value:c.Critical,color:"#EF4444"},
    ];
  },[history]);

  const total = data.reduce((a,d)=>a+d.value,0);

  return (
    <div className="panel" style={{padding:16}}>
      <div style={{fontWeight:700,fontSize:13.5,color:"var(--slate-900)",marginBottom:4}}>Scan distribution</div>
      {!total
        ? <EmptyMini text="No scans yet." height={196}/>
        : (
          <>
            <div style={{height:164,position:"relative",marginTop:4}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name"
                    innerRadius={50} outerRadius={70} paddingAngle={3} stroke="none">
                    {data.map(d=><Cell key={d.name} fill={d.color}/>)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <div style={{fontSize:20,fontWeight:800,color:"var(--slate-900)"}}>{total}</div>
                <div style={{fontSize:10.5,color:"var(--slate-400)"}}>scans</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:8,flexWrap:"wrap"}}>
              {data.map(d=>(
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11.5,color:"var(--slate-600)"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:d.color}}/>
                  {d.name} <span className="mono" style={{color:"var(--slate-400)"}}>{d.value}</span>
                </div>
              ))}
            </div>
          </>
        )
      }
    </div>
  );
}

// DRIFT TIMELINE

function DriftTimeline({history}) {
  const [hover,setHover] = useState(null);
  const runs = useMemo(()=>[...history].reverse(),[history]);
  if (!runs.length) return <EmptyMini text="No scans yet." height={72}/>;
  return (
    <div style={{position:"relative"}}>
      <div className="timeline-track">
        {runs.map((r,i)=>{
          const meta = statusMeta(r.overall_status);
          return (
            <div key={r.id||i} className="timeline-bar" style={{background:meta.color}}
              onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}/>
          );
        })}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:7}}>
        <span className="mono" style={{fontSize:11,color:"var(--slate-400)"}}>{fmtShort(runs[0]?.scanned_at)}</span>
        <span className="mono" style={{fontSize:11,color:"var(--slate-400)"}}>{fmtShort(runs[runs.length-1]?.scanned_at)}</span>
      </div>
      {hover!==null && runs[hover] && (
        <div style={{
          position:"absolute",bottom:"calc(100% + 10px)",
          left:`${runs.length>1?(hover/(runs.length-1))*100:50}%`,
          transform:"translateX(-50%)",
          background:"var(--ink)",color:"#fff",padding:"8px 11px",
          borderRadius:9,fontSize:12,whiteSpace:"nowrap",
          boxShadow:"0 12px 24px rgba(0,0,0,.22)",pointerEvents:"none",zIndex:5,
        }}>
          <div style={{fontWeight:700}}>{statusMeta(runs[hover].overall_status).label}</div>
          <div className="mono" style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:2}}>{fmt(runs[hover].scanned_at)}</div>
        </div>
      )}
    </div>
  );
}

// AI INSIGHTS

function AIInsights({history}) {
  const latest = history[0];
  const flagged = latest?(latest.column_results||[]).filter(c=>!isNormal(c.status)):[];
  return (
    <div className="panel" style={{padding:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}>
        <Ico.Activity size={15} style={{color:"var(--indigo)"}}/>
        <div style={{fontWeight:700,fontSize:13.5,color:"var(--slate-900)"}}>AI insights</div>
        {latest && <span className="mono" style={{fontSize:11,color:"var(--slate-400)",marginLeft:"auto"}}>{fmt(latest.scanned_at)}</span>}
      </div>
      {!latest && <EmptyMini text="Run a scan to get AI explanations." height={80}/>}
      {latest&&flagged.length===0 && (
        <div style={{display:"flex",gap:10,alignItems:"flex-start",background:"var(--emerald-50)",borderRadius:10,padding:"11px 13px"}}>
          <Ico.Check size={15} style={{color:"var(--emerald-600)",flexShrink:0,marginTop:1}}/>
          <div style={{fontSize:13,color:"var(--slate-700)",lineHeight:1.6}}>
            No anomalies in the latest scan — all monitored columns are tracking normally.
          </div>
        </div>
      )}
      {latest&&flagged.length>0 && (
        <div style={{display:"grid",gap:12}}>
          {flagged.map((col,i)=>{
            const exp = col.gemini_explanation?parseExp(col.gemini_explanation):null;
            const meta = statusMeta(col.status);
            return (
              <div key={i} style={{borderLeft:`3px solid ${meta.color}`,paddingLeft:12}}>
                <div style={{fontWeight:700,fontSize:13,color:"var(--slate-900)",marginBottom:3}}>
                  {col.column==="row_anomaly"?"Overall row check":col.column}
                </div>
                <p style={{fontSize:13,color:"var(--slate-600)",margin:"0 0 5px",lineHeight:1.6}}>
                  {exp?.what||col.change_text||"Unusual pattern detected."}
                </p>
                {exp?.action && (
                  <div style={{fontSize:12.5,color:"var(--indigo)",fontWeight:600}}>→ {exp.action}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// SCAN HISTORY TABLE

function RunDetail({run}) {
  const cols = run.column_results||[];
  if (!cols.length) return (
    <div style={{padding:"12px 16px",fontSize:13,color:"var(--slate-400)"}}>No column data.</div>
  );
  return (
    <div style={{padding:"12px 16px",display:"grid",gap:9}}>
      {cols.map((col,i)=>{
        const meta = statusMeta(col.status);
        const exp = col.gemini_explanation?parseExp(col.gemini_explanation):null;
        return (
          <div key={i} style={{background:"#fff",border:`1px solid ${meta.color}30`,borderRadius:10,padding:"11px 13px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--slate-900)"}}>
                {col.column==="row_anomaly"?"Overall row check":col.column}
              </div>
              <span className="badge" style={{background:meta.bg,color:meta.text}}>{meta.label}</span>
            </div>
            {col.change_text&&<div style={{fontSize:12.5,color:"var(--slate-600)",marginBottom:7}}>{col.change_text}</div>}
            {col.type==="numeric"&&col.today_value!=null&&(
              <div style={{display:"flex",gap:7,marginBottom:7}}>
                <div style={{flex:1,background:"var(--slate-50)",borderRadius:8,padding:"6px 9px",textAlign:"center"}}>
                  <div style={{fontSize:10.5,color:"var(--slate-400)"}}>Today</div>
                  <div className="mono" style={{fontSize:14,fontWeight:800,color:meta.text}}>
                    {col.today_value?.toLocaleString?.()??col.today_value}
                  </div>
                </div>
                <div style={{flex:1,background:"var(--slate-50)",borderRadius:8,padding:"6px 9px",textAlign:"center"}}>
                  <div style={{fontSize:10.5,color:"var(--slate-400)"}}>Baseline</div>
                  <div className="mono" style={{fontSize:14,fontWeight:800,color:"var(--slate-700)"}}>
                    {col.baseline_mean?.toLocaleString?.()??col.baseline_mean}
                  </div>
                </div>
              </div>
            )}
            {exp?.what&&(
              <div style={{background:"var(--indigo-50)",borderRadius:8,padding:"9px 11px"}}>
                <p style={{fontSize:12.5,color:"var(--slate-700)",margin:"0 0 4px",lineHeight:1.6}}>{exp.what}</p>
                {exp.action&&<div style={{fontSize:12,color:"var(--indigo)",fontWeight:600}}>→ {exp.action}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScanHistoryTable({history}) {
  const [filter,setFilter] = useState("all");
  const [desc,setDesc] = useState(true);
  const [expandedId,setExpandedId] = useState(null);

  const rows = useMemo(()=>{
    let r = history;
    if (filter!=="all") r = r.filter(row=>{
      if (filter==="normal") return isNormal(row.overall_status);
      if (filter==="warning") return statusMeta(row.overall_status).label==="Warning";
      if (filter==="critical") return ["Critical","Error"].includes(statusMeta(row.overall_status).label);
      return true;
    });
    return [...r].sort((a,b)=>{
      const d = new Date(b.scanned_at)-new Date(a.scanned_at);
      return desc?d:-d;
    });
  },[history,filter,desc]);

  return (
    <div className="panel" style={{overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderBottom:"1px solid var(--slate-200)",flexWrap:"wrap",gap:8}}>
        <div style={{fontWeight:700,fontSize:13.5,color:"var(--slate-900)"}}>Scan history</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
          {[["all","All"],["normal","Normal"],["warning","Warning"],["critical","Critical"]].map(([k,l])=>(
            <button key={k} className={`filter-pill ${filter===k?"active":""}`} onClick={()=>setFilter(k)}>{l}</button>
          ))}
          <button className="iconbtn" style={{width:28,height:28}} title="Toggle sort" onClick={()=>setDesc(d=>!d)}>
            <Ico.Chev size={13} style={{transform:desc?"none":"rotate(180deg)",transition:"transform .15s ease"}}/>
          </button>
        </div>
      </div>
      {!rows.length
        ? <EmptyMini text="No scans match this filter." height={100}/>
        : (
          <div style={{overflowX:"auto"}}>
            <table className="dw-table">
              <thead>
                <tr><th style={{width:26}}></th><th>Time</th><th>Status</th><th>Affected columns</th><th>Alert</th></tr>
              </thead>
              <tbody>
                {rows.map(run=>{
                  const meta = statusMeta(run.overall_status);
                  const issues = (run.column_results||[]).filter(c=>!isNormal(c.status));
                  const open = expandedId===run.id;
                  return (
                    <Fragment key={run.id}>
                      <tr className="row-hover" onClick={()=>setExpandedId(open?null:run.id)}>
                        <td>
                          <Ico.Chev size={13} style={{color:"var(--slate-400)",transform:open?"rotate(180deg)":"none",transition:"transform .15s ease"}}/>
                        </td>
                        <td className="mono" style={{color:"var(--slate-600)",whiteSpace:"nowrap"}}>{fmt(run.scanned_at)}</td>
                        <td>
                          <span className="badge" style={{background:meta.bg,color:meta.text}}>
                            <span className="badge-dot" style={{background:meta.color}}/>{meta.label}
                          </span>
                        </td>
                        <td style={{color:"var(--slate-600)"}}>
                          {issues.length===0?"—":issues.map(c=>c.column==="row_anomaly"?"Row check":c.column).join(", ")}
                        </td>
                        <td>
                          {run.alert_sent
                            ? <Ico.Mail size={13} style={{color:"var(--indigo)"}}/>
                            : <span style={{color:"var(--slate-300)"}}>—</span>}
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={5} style={{padding:0,background:"var(--slate-50)"}}>
                            <RunDetail run={run}/>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

// MONITOR DETAIL (right panel)

function MonitorDetail({monitor,session,onRefresh,onDeleted,pushToast}) {
  const [history,setHistory] = useState([]);
  const [loadingH,setLoadingH] = useState(true);
  const [running,setRunning] = useState(false);
  const [busy,setBusy] = useState(false);

  const load = async () => {
    setLoadingH(true);
    try {
      const r = await axios.get(`${API}/monitors/${monitor.id}/history?limit=30`,authHeaders(session));
      setHistory(r.data.history||[]);
    } catch { pushToast("error","Could not load scan history."); }
    finally { setLoadingH(false); }
  };

  // reload history when monitor changes AND do a silent refresh every 30s while running
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ load(); },[monitor.id]);
  useEffect(()=>{
    if (!running) return;
    const t = setTimeout(async ()=>{
      await load(); onRefresh({silent:true}); setRunning(false);
    },35000);
    return ()=>clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[running]);

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await axios.post(`${API}/monitors/${monitor.id}/run`,{},authHeaders(session));
      pushToast("success","Scan triggered — updating in ~30 seconds.");
    } catch { pushToast("error","Could not trigger scan."); setRunning(false); }
  };
  const handlePause = async () => {
    setBusy(true);
    try { await axios.post(`${API}/monitors/${monitor.id}/pause`,{},authHeaders(session)); pushToast("success","Monitor paused."); onRefresh(); }
    catch { pushToast("error","Could not pause."); }
    finally { setBusy(false); }
  };
  const handleResume = async () => {
    setBusy(true);
    try { await axios.post(`${API}/monitors/${monitor.id}/resume`,{},authHeaders(session)); pushToast("success","Monitor resumed."); onRefresh(); }
    catch { pushToast("error","Could not resume."); }
    finally { setBusy(false); }
  };
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${monitor.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try { await axios.delete(`${API}/monitors/${monitor.id}`,authHeaders(session)); pushToast("success","Monitor deleted."); onDeleted(monitor.id); }
    catch { pushToast("error","Could not delete."); }
    finally { setBusy(false); }
  };

  const hs = healthScore(loadingH?[]:history, monitor);
  const meta = statusMeta(monitor.last_status);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18,gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <h1 style={{fontSize:20,fontWeight:800,color:"var(--slate-900)",margin:0}}>{monitor.name}</h1>
            {monitor.status==="active"
              ? <span className="badge" style={{background:meta.bg,color:meta.text}}>
                  <span className="badge-dot" style={{background:meta.color}}/>
                  {monitor.last_status?meta.label:"Active"}
                </span>
              : <span className="badge" style={{background:"var(--slate-100)",color:"var(--slate-500)"}}>
                  <span className="badge-dot" style={{background:"var(--slate-300)"}}/>Paused
                </span>
            }
            {running && (
              <span className="badge" style={{background:"var(--indigo-50)",color:"var(--indigo)"}}>
                <Spinner size={11}/> Scanning…
              </span>
            )}
          </div>
          <div style={{fontSize:12.5,color:"var(--slate-500)",marginTop:6,lineHeight:1.5}}>
            {monitor.source_type==="google_sheet"?"Google Sheet":monitor.source_value}
            {" · "}{INTERVAL_OPTIONS.find(o=>o.value===monitor.interval_hours)?.label||`Every ${monitor.interval_hours}h`}
            {" · "}{monitor.alert_email}
          </div>
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          <button className="btn btn-primary btn-sm" onClick={handleRunNow} disabled={running||busy}>
            {running?<Spinner/>:<Ico.Play size={12}/>} {running?"Scanning":"Run now"}
          </button>
          {monitor.status==="active"
            ? <button className="btn btn-outline btn-sm" onClick={handlePause} disabled={busy}><Ico.Pause size={12}/> Pause</button>
            : <button className="btn btn-outline btn-sm" onClick={handleResume} disabled={busy}><Ico.Play size={12}/> Resume</button>
          }
          <button className="btn btn-outline-danger btn-sm" onClick={handleDelete} disabled={busy}><Ico.Trash size={12}/> Delete</button>
          <button className="iconbtn" onClick={load} title="Refresh data" disabled={loadingH}>
            <Ico.Refresh size={14} style={{animation:loadingH?"spin .7s linear infinite":"none"}}/>
          </button>
        </div>
      </div>

      {/* KPIs */}
      {loadingH
        ? <KPISkeleton/>
        : (
          <div className="kpi-grid" style={{marginBottom:12}}>
            <KPICard
              icon={<Ico.Activity size={12}/>} label="Health score"
              value={hs===null?"—":`${hs}%`}
              sub={hs===null?"No scans yet":hs>=85?"Healthy":hs>=60?"Needs review":"Critical"}
              accent={hs!=null?(hs>=85?"var(--emerald-600)":hs>=60?"var(--amber-600)":"var(--red-600)"):undefined}
            />
            <KPICard icon={<Ico.Bar size={12}/>} label="Total runs"
              value={monitor.total_runs??0}
              sub="since monitor created"/>
            <KPICard icon={<Ico.Mail size={12}/>} label="Total alerts"
              value={monitor.total_alerts??0}
              sub={monitor.total_runs?`${Math.round(((monitor.total_alerts||0)/monitor.total_runs)*100)}% of runs`:"—"}
            />
            <KPICard icon={<Ico.Clock size={12}/>} label="Last scan"
              value={rel(monitor.last_run)}
              sub={monitor.last_run?fmt(monitor.last_run):"Run now to start"}
            />
          </div>
        )
      }

      {/* Charts */}
      {!loadingH && (
        <>
          <div className="charts-row" style={{marginBottom:12}}>
            <MetricTrendChart history={history}/>
            <StatusDonut history={history}/>
          </div>

          <div className="panel" style={{padding:"16px 18px",marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13.5,color:"var(--slate-900)",marginBottom:13}}>Drift timeline</div>
            <DriftTimeline history={history}/>
          </div>

          <div style={{marginBottom:12}}>
            <AIInsights history={history}/>
          </div>

          <ScanHistoryTable history={history}/>
        </>
      )}
    </div>
  );
}

// CREATE MONITOR FORM

function SensitivityPicker({value,onChange}) {
  return (
    <div style={{display:"flex",gap:10}}>
      {[
        {key:"low",label:"Low",desc:"Only big changes"},
        {key:"medium",label:"Medium",desc:"Moderate changes"},
        {key:"high",label:"High",desc:"Even small changes"},
      ].map(o=>(
        <button key={o.key} onClick={()=>onChange(o.key)} style={{
          flex:1,padding:"11px 8px",borderRadius:10,
          border:value===o.key?"2px solid var(--indigo)":"1.5px solid var(--slate-200)",
          background:value===o.key?"var(--indigo-50)":"#fff",
          color:value===o.key?"var(--indigo-600)":"var(--slate-600)",
          cursor:"pointer",fontSize:13,transition:"all .15s ease",
        }}>
          <div style={{fontWeight:700}}>{o.label}</div>
          <div style={{fontSize:11,color:"var(--slate-400)",marginTop:2}}>{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

function StepIndicator({steps,current}) {
  return (
    <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
      {steps.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"0 0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="step-dot" style={{
              background:i<=current?"var(--indigo)":"var(--slate-100)",
              color:i<=current?"#fff":"var(--slate-400)",
              boxShadow:i===current?"0 0 0 4px var(--indigo-50)":"none",
            }}>
              {i<current?<Ico.Check size={12}/>:i+1}
            </div>
            <span style={{fontSize:12,fontWeight:i===current?700:500,color:i===current?"var(--indigo)":i<current?"var(--slate-700)":"var(--slate-400)"}}>
              {s}
            </span>
          </div>
          {i<steps.length-1&&(
            <div style={{flex:1,height:1,background:i<current?"var(--indigo)":"var(--slate-200)",margin:"0 10px"}}/>
          )}
        </div>
      ))}
    </div>
  );
}

function CreateMonitorPanel({session,onCreated,onCancel,pushToast}) {
  const [step,setStep] = useState(0);
  const [name,setName] = useState("");
  const sourceType = "google_sheet";
  const [sourceValue,setSourceValue] = useState("");
  const [dateColumn,setDateColumn] = useState("");
  const [context,setContext] = useState("");
  const [sensitivity,setSensitivity] = useState("medium");
  const [alertEmail,setAlertEmail] = useState(session?.user?.email||"");
  const [intervalHours,setIntervalHours] = useState(24);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");

  const steps = ["Data source","Configure","Schedule"];

  const handleCreate = async () => {
    if (!alertEmail) return setError("Enter an alert email.");
    setBusy(true); setError("");
    const form = new FormData();
    form.append("name",name); form.append("source_type",sourceType);
    form.append("source_value",sourceValue); form.append("date_column",dateColumn);
    form.append("context",context); form.append("sensitivity",sensitivity);
    form.append("alert_email",alertEmail); form.append("interval_hours",intervalHours);
    try {
      const res = await axios.post(`${API}/monitors`,form,authHeaders(session));
      onCreated(res.data?.monitor||res.data);
    } catch(e) {
      const msg = e.response?.data?.detail||"Could not create monitor.";
      setError(msg); pushToast("error",msg);
    } finally { setBusy(false); }
  };

  return (
    <div className="panel fade-in" style={{maxWidth:600,margin:"0 auto",padding:26}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontWeight:800,fontSize:16,color:"var(--slate-900)"}}>Create new monitor</div>
        <button className="iconbtn" onClick={onCancel}><Ico.x size={14}/></button>
      </div>

      <StepIndicator steps={steps} current={step}/>

      {step===0&&(
        <div>
          <div style={{marginBottom:15}}>
            <label className="field-label">Monitor name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Daily Sales Check" className="field-input"/>
          </div>
          <div style={{marginBottom:15}}>
            <label className="field-label">Data source</label>
            <div style={{display:"flex",gap:9,alignItems:"flex-start",background:"var(--indigo-50)",border:"1px solid var(--indigo-100)",borderRadius:10,padding:"10px 12px"}}>
              <Ico.Plug size={14} style={{color:"var(--indigo)",flexShrink:0,marginTop:1}}/>
              <span style={{fontSize:12.5,color:"var(--indigo-600)",lineHeight:1.6}}>Auto monitors work with Google Sheets — accessible anywhere, always up to date.</span>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <label className="field-label">Google Sheet CSV export URL</label>
            <input type="text" value={sourceValue} onChange={e=>setSourceValue(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv" className="field-input"/>
            <div className="field-hint">File → Share → Publish to web → CSV → copy link</div>
          </div>
          {error&&<div style={{display:"flex",gap:7,color:"var(--red)",fontSize:13,marginBottom:12}}><Ico.Alert size={14}/>{error}</div>}
          <button className="btn btn-primary" style={{width:"100%"}}
            onClick={()=>{if(!name||!sourceValue)return setError("Fill in all fields.");setError("");setStep(1);}}>
            Continue
          </button>
        </div>
      )}

      {step===1&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:15}}>
            <div>
              <label className="field-label">Date column name</label>
              <input type="text" value={dateColumn} onChange={e=>setDateColumn(e.target.value)} placeholder="date" className="field-input"/>
            </div>
            <div>
              <label className="field-label">Describe your data</label>
              <input type="text" value={context} onChange={e=>setContext(e.target.value)} placeholder="daily sales data" className="field-input"/>
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <label className="field-label">Detection sensitivity</label>
            <SensitivityPicker value={sensitivity} onChange={setSensitivity}/>
          </div>
          {error&&<div style={{display:"flex",gap:7,color:"var(--red)",fontSize:13,marginBottom:12}}><Ico.Alert size={14}/>{error}</div>}
          <div style={{display:"flex",gap:9}}>
            <button className="btn btn-outline" onClick={()=>setStep(0)}><span style={{fontSize:14}}>←</span> Back</button>
            <button className="btn btn-primary" style={{flex:1}}
              onClick={()=>{if(!dateColumn||!context)return setError("Fill in all fields.");setError("");setStep(2);}}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step===2&&(
        <div>
          <div style={{marginBottom:15}}>
            <label className="field-label">Alert email</label>
            <input type="email" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} placeholder="your@email.com" className="field-input"/>
          </div>
          <div style={{marginBottom:18}}>
            <label className="field-label">Check frequency</label>
            <select value={intervalHours} onChange={e=>setIntervalHours(Number(e.target.value))} className="field-input">
              {INTERVAL_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{background:"var(--slate-50)",borderRadius:12,padding:"14px 16px",marginBottom:18,border:"1px solid var(--slate-200)"}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"var(--slate-900)",marginBottom:9}}>Summary</div>
            {[
              {l:"Name",v:name},{l:"Source",v:"Google Sheet"},
              {l:"Date column",v:dateColumn},{l:"Context",v:context},
              {l:"Frequency",v:INTERVAL_OPTIONS.find(o=>o.value===intervalHours)?.label},
              {l:"Alert to",v:alertEmail},
            ].map(r=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0",borderBottom:"1px solid var(--slate-100)"}}>
                <span style={{color:"var(--slate-400)"}}>{r.l}</span>
                <span style={{color:"var(--slate-700)",fontWeight:500}}>{r.v||"—"}</span>
              </div>
            ))}
          </div>
          {error&&<div style={{display:"flex",gap:7,color:"var(--red)",fontSize:13,marginBottom:12}}><Ico.Alert size={14}/>{error}</div>}
          <div style={{display:"flex",gap:9}}>
            <button className="btn btn-outline" onClick={()=>setStep(1)}><span style={{fontSize:14}}>←</span> Back</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={handleCreate} disabled={busy}>
              {busy?<Spinner/>:<Ico.Check size={13}/>} {busy?"Creating…":"Start monitoring"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// TOPBAR

function TopBar({session,onBack,onLogout,onMenu}) {
  return (
    <div className="topbar">
      <button className="iconbtn drawer-toggle" onClick={onMenu} title="Monitors"><Ico.Menu size={15}/></button>
      <button className="iconbtn" onClick={onBack} title="Back"><Ico.Back size={15}/></button>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <Logo/><span style={{fontWeight:800,fontSize:15,color:"var(--slate-900)"}}>DriftWatch</span>
      </div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"var(--slate-500)"}}>
          <Ico.User size={14}/>
          <span style={{maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {session?.user?.email}
          </span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={onLogout}><Ico.Logout size={13}/> Log out</button>
      </div>
    </div>
  );
}

// ROOT — MonitorsPage

export default function MonitorsPage({session,onBack,onLogout}) {
  const [monitors,setMonitors] = useState([]);
  const [loadingMonitors,setLoadingMonitors] = useState(true);
  const [selectedId,setSelectedId] = useState(null);
  const [creating,setCreating] = useState(false);
  const [search,setSearch] = useState("");
  const [drawerOpen,setDrawerOpen] = useState(false);
  const {toasts,push,dismiss} = useToasts();

  const loadMonitors = async (opts={}) => {
    if (!opts.silent) setLoadingMonitors(true);
    try {
      const res = await axios.get(`${API}/monitors`,authHeaders(session));
      const list = res.data.monitors||[];
      setMonitors(list);
      return list;
    } catch {
      if (!opts.silent) push("error","Could not load monitors.");
      return null;
    } finally {
      if (!opts.silent) setLoadingMonitors(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{ loadMonitors(); },[]);

  // silent background refresh so the sidebar stays live
  useEffect(()=>{
    const t = setInterval(()=>{ if (!creating) loadMonitors({silent:true}); },60000);
    return ()=>clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[creating]);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    if (!q) return monitors;
    return monitors.filter(m=>m.name?.toLowerCase().includes(q));
  },[monitors,search]);

  const selected = monitors.find(m=>m.id===selectedId)||null;

  const handleSelect = (id) => {
    setSelectedId(id); setCreating(false); setDrawerOpen(false);
  };
  const handleCreated = async (newMonitor) => {
    setCreating(false);
    push("success","Monitor created and scheduled.");
    const list = await loadMonitors();
    const id = newMonitor?.id||(list&&list[0]?.id);
    if (id) setSelectedId(id);
  };
  const handleDeleted = (id) => {
    if (selectedId===id) setSelectedId(null);
    loadMonitors();
  };

  return (
    <div className="dwapp">
      <style>{GLOBAL_CSS}</style>

      <TopBar session={session} onBack={onBack} onLogout={onLogout} onMenu={()=>setDrawerOpen(o=>!o)}/>

      <div className="shell">
        {drawerOpen && <div className="drawer-overlay" onClick={()=>setDrawerOpen(false)}/>}

        <Sidebar
          monitors={filtered} loading={loadingMonitors}
          selectedId={selectedId} onSelect={handleSelect}
          search={search} onSearch={setSearch}
          onCreate={()=>{setCreating(true);setSelectedId(null);setDrawerOpen(false);}}
          open={drawerOpen}
        />

        <main className="main">
          <div className="main-inner">
            {creating && (
              <CreateMonitorPanel session={session} onCreated={handleCreated}
                onCancel={()=>setCreating(false)} pushToast={push}/>
            )}
            {!creating && selected && (
              <MonitorDetail key={selected.id} monitor={selected} session={session}
                onRefresh={loadMonitors} onDeleted={handleDeleted} pushToast={push}/>
            )}
            {!creating && !selected && (
              <EmptyState onCreate={()=>setCreating(true)} hasMonitors={monitors.length>0}/>
            )}
          </div>
        </main>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss}/>
    </div>
  );
}