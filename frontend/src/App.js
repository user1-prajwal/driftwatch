
import { useState, useRef } from "react";

const API = "http://localhost:8000";

const baseBtnHover = {
  transition: "transform 0.2s ease",
};

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
        Your data breaks silently.
        <br />
        <span
          style={{
            color: "#6366f1",
          }}
        >
          DriftWatch
        </span>{" "}
        catches it.
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


        {/* ── TWO MAIN ACTIONS (UNCHANGED) ── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 60,
          }}
        >
          <button
            onClick={() => onStart("monitors")}
            style={{
              padding: "16px 32px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
              ...baseBtnHover,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            ⏰ Set Up Auto Monitor
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.85, marginTop: 3 }}>
              Watch your data automatically
            </div>
          </button>

          <button
            onClick={() => onStart("scan")}
            style={{
              padding: "16px 32px",
              background: "#fff",
              color: "#4f46e5",
              border: "2px solid #c7d2fe",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              ...baseBtnHover,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            🔍 One-time Scan
            <div style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8", marginTop: 3 }}>
              Upload a CSV and scan now
            </div>
          </button>
        </div>

        {/* Stats row (UNCHANGED) */}
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

      {/* ── IMPORTANT: RESERVED SPACE FOR EXPANSION ── */}
      <div ref={featuresRef} />
    </div>
  );
}





/* ---------------- ROOT APP (FIXED BUG ONLY) ---------------- */
export default function App() {
  const [page, setPage] = useState("landing");

  return <LandingPage onStart={(p) => setPage(p)} />;
}
