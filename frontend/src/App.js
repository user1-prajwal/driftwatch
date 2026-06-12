// import { useState, useRef } from "react";
// import MonitorsPage from "./MonitorsPage";
// import ScanPage from "./ScanPage";

// import { supabase } from "./supabaseClient"
// import AuthModal from "./AuthModal"

// const API = "http://localhost:8000";

// //LANDING PAGE 
// function LandingPage({ onStart }) {
//   const featuresRef = useRef(null);

//   const scrollDown = () =>
//     featuresRef.current?.scrollIntoView({ behavior: "smooth" });

//   return (
//     <div
//       style={{
//         fontFamily:
//           "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//         color: "#1e293b",
//       }}
//     >
//       {/* ── NAV ── */}
//       <nav
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           zIndex: 100,
//           background: "rgba(255,255,255,0.9)",
//           backdropFilter: "blur(12px)",
//           borderBottom: "1px solid #e2e8f0",
//           padding: "0 5%",
//         }}
//       >
//         <div
//           style={{
//             maxWidth: 1100,
//             margin: "0 auto",
//             display: "flex",
//             alignItems: "center",
//             height: 60,
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
//             <span style={{ fontSize: 22 }}>🌊</span>
//             <span style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>
//               DriftWatch
//             </span>
//           </div>

//           <div style={{ display: "flex", gap: 8 }}>
//             <button
//               onClick={scrollDown}
//               style={{
//                 padding: "8px 16px",
//                 background: "transparent",
//                 border: "1.5px solid #e2e8f0",
//                 borderRadius: 8,
//                 fontSize: 13,
//                 color: "#2219198c",
//                 cursor: "pointer",
//                 fontWeight: 500,
//               }}
//             >
//               Learn more
//             </button>

//             <button
//               onClick={() => onStart("scan")}
//               style={{
//                 padding: "8px 20px",
//                 background: "#6366f1",
//                 border: "none",
//                 borderRadius: 8,
//                 fontSize: 13,
//                 color: "#fff",
//                 cursor: "pointer",
//                 fontWeight: 700,
//               }}
//             >
//               Get Started
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ── HERO ── */}
//       <div
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "80px 5% 60px",
//           background:
//             "linear-gradient(135deg, #62e2c271 0%, #f5f6fa 50%, #f5f5f5 100%)",
//           textAlign: "center",
//         }}
//       >
//        <h1
//         style={{
//           fontSize: "clamp(42px, 6vw, 68px)",
//           fontWeight: 800,
//           lineHeight: 1.05,
//           letterSpacing: "-0.04em",
//           color: "#0f172a",
//           marginBottom: 20,
//           maxWidth: 850,
//         }}
//       >
//         Your data breaks silently
//         <br />
//         <span
//           style={{
//             color: "#6366f1",
//           }}
//         >
//           DriftWatch
//         </span>{" "}
//         catches it
//       </h1>

//         <p
//           style={{
//             fontSize: "clamp(15px, 2vw, 18px)",
//             color: "#64748b",
//             maxWidth: 560,
//             lineHeight: 1.7,
//             marginBottom: 40,
//           }}
//         >
//           Automatically monitor your data sources, detect anomalies and get AI-powered explanations — before the problem affects
//           your business.
//         </p>


//         {/* ── TWO MAIN ACTIONS ── */}
//         <div
//         style={{
//           display: "flex",
//           gap: 20,
//           flexWrap: "wrap",
//           justifyContent: "center",
//           marginBottom: 60,
//         }}
//       >
//         {/* Auto Monitor */}
//         <button
//           onClick={() => onStart("monitor")}
//           style={{
//             padding: "18px 34px",
//             border: "none",
//             borderRadius: 18,
//             cursor: "pointer",
//             background:
//               "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
//             color: "#fff",
//             minWidth: 260,
//             transition: "all 0.25s ease",
//             boxShadow:
//               "0 10px 30px rgba(99,102,241,0.35)",
//             position: "relative",
//             overflow: "hidden",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform =
//               "translateY(-4px) scale(1.02)";
//             e.currentTarget.style.boxShadow =
//               "0 16px 40px rgba(99,102,241,0.45)";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform =
//               "translateY(0) scale(1)";
//             e.currentTarget.style.boxShadow =
//               "0 10px 30px rgba(99,102,241,0.35)";
//           }}
//         >
//           <div
//             style={{
//               fontSize: 18,
//               fontWeight: 700,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//             }}
//           >
//             ⏰ Set Up Auto Monitor
//           </div>

//           <div
//             style={{
//               marginTop: 6,
//               fontSize: 13,
//               opacity: 0.9,
//               fontWeight: 400,
//             }}
//           >
//             Watch your data automatically
//           </div>
//         </button>

//         {/* One-Time Scan */}
//         <button
//           onClick={() => onStart("scan")}
//           style={{
//             padding: "18px 34px",
//             borderRadius: 18,
//             cursor: "pointer",
//             minWidth: 260,
//             border: "1px solid rgba(255,255,255,0.3)",
//             background: "rgba(255,255,255,0.75)",
//             backdropFilter: "blur(12px)",
//             WebkitBackdropFilter: "blur(12px)",
//             color: "#4f46e5",
//             transition: "all 0.25s ease",
//             boxShadow:
//               "0 10px 30px rgba(0,0,0,0.08)",
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.transform =
//               "translateY(-4px) scale(1.02)";
//             e.currentTarget.style.boxShadow =
//               "0 16px 40px rgba(0,0,0,0.12)";
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.transform =
//               "translateY(0) scale(1)";
//             e.currentTarget.style.boxShadow =
//               "0 10px 30px rgba(0,0,0,0.08)";
//           }}
//         >
//           <div
//             style={{
//               fontSize: 18,
//               fontWeight: 700,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//             }}
//           >
//             🔍 One-Time Scan
//           </div>

//           <div
//             style={{
//               marginTop: 6,
//               fontSize: 13,
//               color: "#64748b",
//               fontWeight: 400,
//             }}
//           >
//             Upload a CSV and scan now
//           </div>
//         </button>
//       </div>

//         {/* Stats row (UNCHANGED) */}
//         <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           flexWrap: "wrap",
//           gap: "32px",
//           marginTop: 20,
//         }}
//       >
//         {[
//           { n: "24/7", l: "Monitoring", c: "#6366f1" },
//           { n: "Real-Time", l: "Alerts", c: "#ef4444" },
//           { n: "CSV", l: "Upload & Scan", c: "#10b981" },
//           { n: "Zero", l: "Setup Cost", c: "#f59e0b" },
//         ].map((s) => (
//           <div
//             key={s.l}
//             style={{
//               textAlign: "center",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 20,
//                 fontWeight: 800,
//                 color: s.c,
//                 letterSpacing: "-0.03em",
//               }}
//             >
//               {s.n}
//             </div>

//             <div
//               style={{
//                 fontSize: 13,
//                 color: "#64748b",
//                 marginTop: 4,
//                 fontWeight: 500,
//               }}
//             >
//               {s.l}
//             </div>
//           </div>
//         ))}
//       </div>

//         <button
//           onClick={scrollDown}
//           style={{
//             marginTop: 60,
//             background: "transparent",
//             border: "none",
//             cursor: "pointer",
//             color: "#94a3b8",
//             fontSize: 13,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 6,
//           }}
//         >
//           <span>Learn how it works</span>
//           <span style={{ fontSize: 20, animation: "bounce 1.5s infinite" }}>
//             ↓
//           </span>
//         </button>
//       </div>

//       {/* ── IMPORTANT: RESERVED SPACE FOR EXPANSION ── */}
//       <div ref={featuresRef} />
//     </div>
//   );
// }





// //  ROOT APP 
// export default function App() {
//   const [page, setPage] = useState("landing");
//   if (page === "monitor") {
//   return <MonitorsPage onBack={() => setPage("landing")} />;
// }

// if (page=== "scan"){
//   return <ScanPage onBack={() => setPage("landing")} />
// }
//   return <LandingPage onStart={(p) => setPage(p)} />;
// }




import { useState, useRef, useEffect } from "react";
import MonitorsPage from "./MonitorsPage";
import ScanPage from "./ScanPage";
import AuthModal from "./AuthModal";
import { supabase } from "./supabaseClient";

const API = "http://localhost:8000";

//LANDING PAGE 
function LandingPage({ onStart }) {
  const featuresRef = useRef(null);

  const scrollDown = () =>
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#1e293b",
      }}
    >
      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 5%",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            height: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <span style={{ fontSize: 22 }}>🌊</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>
              DriftWatch
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={scrollDown}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                color: "#2219198c",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Learn more
            </button>

            <button
              onClick={() => onStart("scan")}
              style={{
                padding: "8px 20px",
                background: "#6366f1",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 5% 60px",
          background:
            "linear-gradient(135deg, #62e2c271 0%, #f5f6fa 50%, #f5f5f5 100%)",
          textAlign: "center",
        }}
      >
       <h1
        style={{
          fontSize: "clamp(42px, 6vw, 68px)",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: "#0f172a",
          marginBottom: 20,
          maxWidth: 850,
        }}
      >
        Your data breaks silently
        <br />
        <span
          style={{
            color: "#6366f1",
          }}
        >
          DriftWatch
        </span>{" "}
        catches it
      </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#64748b",
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          Automatically monitor your data sources, detect anomalies and get AI-powered explanations — before the problem affects
          your business.
        </p>


        {/* ── TWO MAIN ACTIONS ── */}
        <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 60,
        }}
      >
        {/* Auto Monitor */}
        <button
          onClick={() => onStart("monitor")}
          style={{
            padding: "18px 34px",
            border: "none",
            borderRadius: 18,
            cursor: "pointer",
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff",
            minWidth: 260,
            transition: "all 0.25s ease",
            boxShadow:
              "0 10px 30px rgba(99,102,241,0.35)",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 16px 40px rgba(99,102,241,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 10px 30px rgba(99,102,241,0.35)";
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            ⏰ Set Up Auto Monitor
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              opacity: 0.9,
              fontWeight: 400,
            }}
          >
            Watch your data automatically
          </div>
        </button>

        {/* One-Time Scan */}
        <button
          onClick={() => onStart("scan")}
          style={{
            padding: "18px 34px",
            borderRadius: 18,
            cursor: "pointer",
            minWidth: 260,
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#4f46e5",
            transition: "all 0.25s ease",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-4px) scale(1.02)";
            e.currentTarget.style.boxShadow =
              "0 16px 40px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 10px 30px rgba(0,0,0,0.08)";
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🔍 One-Time Scan
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#64748b",
              fontWeight: 400,
            }}
          >
            Upload a CSV and scan now
          </div>
        </button>
      </div>

        {/* Stats row */}
        <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "32px",
          marginTop: 20,
        }}
      >
        {[
          { n: "24/7", l: "Monitoring", c: "#6366f1" },
          { n: "Real-Time", l: "Alerts", c: "#ef4444" },
          { n: "CSV", l: "Upload & Scan", c: "#10b981" },
          { n: "Zero", l: "Setup Cost", c: "#f59e0b" },
        ].map((s) => (
          <div
            key={s.l}
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: s.c,
                letterSpacing: "-0.03em",
              }}
            >
              {s.n}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

        <button
          onClick={scrollDown}
          style={{
            marginTop: 60,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Learn how it works</span>
          <span style={{ fontSize: 20, animation: "bounce 1.5s infinite" }}>
            ↓
          </span>
        </button>
      </div>

      {/* ── RESERVED SPACE FOR EXPANSION ── */}
      <div ref={featuresRef} />
    </div>
  );
}


// ROOT APP
export default function App() {
  const [page,          setPage]          = useState("landing");
  const [session,       setSession]       = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Check login state on startup ──
  useEffect(() => {
    // Get existing session if user was already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login / logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Called when any button does onStart(page) ──
  const handleStart = (p) => {
    if (p === "monitor") {
      if (session) {
        // Already logged in → go straight to monitors
        setPage("monitor");
      } else {
        // Not logged in → show login popup
        setShowAuthModal(true);
      }
    } else {
      // One-time scan → no login needed
      setPage(p);
    }
  };

  // ── Page routing ──
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

      {/* Auth modal — shown on top of landing page */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(session) => {
            setSession(session);
            setShowAuthModal(false);
            setPage("monitor");  // go to monitors after login
          }}
        />
      )}
    </>
  );
}