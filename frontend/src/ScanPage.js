import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const statusColor = (s) =>
  s?.includes("CRITICAL")
    ? "#ef4444"
    : s?.includes("WARNING")
      ? "#f59e0b"
      : "#22c55e";
const statusBg = (s) =>
  s?.includes("CRITICAL")
    ? "#fef2f2"
    : s?.includes("WARNING")
      ? "#fffbeb"
      : "#f0fdf4";
const sevColor = (s) => (s >= 75 ? "#ef4444" : s >= 40 ? "#f59e0b" : "#22c55e");

const input = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  background: "#fff",
  color: "#1e293b",
  transition: "border 0.2s",
};
const label = {
  fontSize: 13,
  color: "#475569",
  fontWeight: 600,
  display: "block",
  marginBottom: 7,
};


// Shared small components
function Badge({ status }) {
  return (
    <span
      style={{
        background: statusBg(status),
        color: statusColor(status),
        border: `1px solid ${statusColor(status)}`,
        borderRadius: 999,
        padding: "2px 12px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status?.replace("🟢 ", "").replace("🟡 ", "").replace("🔴 ", "")}
    </span>
  );
}

function SeverityBar({ severity }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#94a3b8",
          marginBottom: 4,
        }}
      >
        <span>Severity</span>
        <span style={{ fontWeight: 700, color: sevColor(severity) }}>
          {severity} / 100
        </span>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 999, height: 6 }}>
        <div
          style={{
            width: `${severity}%`,
            background: sevColor(severity),
            borderRadius: 999,
            height: 6,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function SensitivityPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[
        { key: "low", label: "Low", desc: "Extreme only" },
        { key: "medium", label: "Medium", desc: "Moderate changes" },
        { key: "high", label: "High", desc: "Even small changes" },
      ].map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={{
            flex: 1,
            padding: "11px 8px",
            borderRadius: 10,
            border:
              value === o.key ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
            background: value === o.key ? "#eef2ff" : "#fff",
            color: value === o.key ? "#4f46e5" : "#64748b",
            cursor: "pointer",
            fontSize: 13,
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontWeight: 700 }}>{o.label}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {o.desc}
          </div>
        </button>
      ))}
    </div>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i < steps.length - 1 ? 1 : "unset",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background:
                  i < current
                    ? "#6366f1"
                    : i === current
                      ? "#6366f1"
                      : "#e2e8f0",
                color: i <= current ? "#fff" : "#94a3b8",
                border: i === current ? "2px solid #818cf8" : "none",
                boxShadow: i === current ? "0 0 0 3px #eef2ff" : "none",
              }}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: i === current ? 700 : 400,
                color:
                  i === current
                    ? "#4f46e5"
                    : i < current
                      ? "#6366f1"
                      : "#94a3b8",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 1,
                background: i < current ? "#6366f1" : "#e2e8f0",
                margin: "0 10px",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ColumnCard({ col }) {
  const [open, setOpen] = useState(col.status?.includes("CRITICAL"));
  const parse = (text) => {
    if (!text) return null;
    const s = {};
    const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
    const c = text.match(
      /POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/,
    );
    const a = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
    if (w) s.what = w[1].trim();
    if (c) s.causes = c[1].trim().split("\n").filter(Boolean);
    if (a) s.action = a[1].trim();
    return s;
  };
  const exp = col.gemini_explanation ? parse(col.gemini_explanation) : null;
  return (
    <div
      style={{
        border: `1.5px solid ${statusColor(col.status)}25`,
        borderRadius: 12,
        background: "#fff",
        marginBottom: 10,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "13px 16px",
          cursor: "pointer",
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
            {col.column}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>
            {col.type === "numeric"
              ? `Latest: ${col.today_value} · Normal: ${col.baseline_mean}`
              : col.type === "isolation_forest"
                ? `Row-level anomaly across ${col.columns_checked?.length} columns`
                : "Distribution shift detected"}
          </div>
        </div>
        <Badge status={col.status} />
        <span style={{ color: "#cbd5e1", fontSize: 12 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid #f1f5f9" }}>
          <SeverityBar severity={col.severity} />
          {col.type === "numeric" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                marginTop: 12,
              }}
            >
              {[
                { l: "Latest", v: col.today_value },
                { l: "Normal avg", v: col.baseline_mean },
                { l: "Std dev", v: col.baseline_std },
              ].map((x) => (
                <div
                  key={x.l}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 8,
                    padding: "10px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{x.l}</div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#1e293b",
                      marginTop: 2,
                    }}
                  >
                    {x.v}
                  </div>
                </div>
              ))}
            </div>
          )}
          {col.type === "categorical" && (
            <div style={{ marginTop: 12 }}>
              {Object.keys(col.baseline_pct || {}).map((cat) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontWeight: 500, color: "#475569" }}>
                      {cat}
                    </span>
                    <span>
                      <span style={{ color: "#94a3b8" }}>
                        normal {col.baseline_pct[cat]}%
                      </span>
                      {" → "}
                      <span
                        style={{
                          fontWeight: 700,
                          color: statusColor(col.status),
                        }}
                      >
                        today {col.today_pct?.[cat] ?? 0}%
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#e2e8f0",
                      borderRadius: 999,
                      height: 5,
                    }}
                  >
                    <div
                      style={{
                        width: `${col.today_pct?.[cat] ?? 0}%`,
                        background: statusColor(col.status),
                        borderRadius: 999,
                        height: 5,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {exp && (
            <div
              style={{
                marginTop: 12,
                background: "#fafafa",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6366f1",
                  marginBottom: 8,
                  letterSpacing: "0.05em",
                }}
              >
                💡 AI EXPLANATION
              </div>
              {exp.what && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    marginBottom: 8,
                    lineHeight: 1.6,
                  }}
                >
                  {exp.what}
                </p>
              )}
              {exp.causes && (
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}
                  >
                    POSSIBLE CAUSES
                  </div>
                  {exp.causes.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        marginBottom: 3,
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: "#6366f1", fontWeight: 700 }}>
                        {i + 1}.
                      </span>
                      {c.replace(/^\d+\.\s*/, "")}
                    </div>
                  ))}
                </div>
              )}
              {exp.action && (
                <div
                  style={{
                    background: "#eef2ff",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "#4f46e5",
                  }}
                >
                  <strong>Action:</strong> {exp.action}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// SCAN PAGE — step by step
function ScanPage({ onBack }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [dateColumn, setDateColumn] = useState("");
  const [context, setContext] = useState("");
  const [sensitivity, setSensitivity] = useState("medium");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const steps = ["Upload file", "Configure", "Alert", "Results"];

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError("");
    setColumns([]);
    setDateColumn("");
    const form = new FormData();
    form.append("file", f);
    try {
      const res = await axios.post(`${API}/columns`, form);
      setColumns(res.data.columns);
      const guess = res.data.columns.find(
        (c) =>
          c.toLowerCase().includes("date") || c.toLowerCase().includes("time"),
      );
      if (guess) setDateColumn(guess);
    } catch {
      setError("Could not read columns.");
    }
  };

  const handleScan = async () => {
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("date_column", dateColumn);
    form.append("context", context);
    form.append("sensitivity", sensitivity);
    form.append("recipient_email", recipientEmail);
    try {
      const res = await axios.post(`${API}/scan`, form);
      setResult(res.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.detail || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 18 }}>🌊</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
          One-time Scan
        </span>
      </div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px" }}>
        {step < 3 && <StepIndicator steps={steps.slice(0, 3)} current={step} />}

        {/* STEP 0 — Upload */}
        {step === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e2e8f0",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1e293b",
                marginBottom: 6,
              }}
            >
              Upload your CSV file
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
              Any CSV with a date column and at least one data column
            </div>
            <label style={label}>Select file</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                ...input,
                border: "1.5px dashed #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                padding: "20px",
              }}
            />
            {file && (
              <div
                style={{
                  marginTop: 16,
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{ fontWeight: 600, fontSize: 14, color: "#15803d" }}
                >
                  ✅ {file.name}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                  Found {columns.length} columns: {columns.join(", ")}
                </div>
              </div>
            )}
            {error && (
              <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
            <button
              onClick={() => {
                if (!file) return setError("Please upload a file first.");
                setError("");
                setStep(1);
              }}
              style={{
                width: "100%",
                marginTop: 24,
                padding: "13px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 1 — Configure */}
        {step === 1 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e2e8f0",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1e293b",
                marginBottom: 6,
              }}
            >
              Configure your scan
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
              Tell DriftWatch about your data
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Describe your data</label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. daily sales of an online store"
                style={input}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Date column</label>
              <select
                value={dateColumn}
                onChange={(e) => setDateColumn(e.target.value)}
                style={input}
              >
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={label}>How sensitive should DriftWatch be?</label>
              <SensitivityPicker
                value={sensitivity}
                onChange={setSensitivity}
              />
            </div>
            {error && (
              <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  padding: "13px 20px",
                  background: "#f8fafc",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!context) return setError("Please describe your data.");
                  if (!dateColumn)
                    return setError("Please select a date column.");
                  setError("");
                  setStep(2);
                }}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Alert + Scan */}
        {step === 2 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e2e8f0",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1e293b",
                marginBottom: 6,
              }}
            >
              Set up alert (optional)
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
              Get an email if anomaly is found
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={label}>
                Alert email{" "}
                <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                  (leave empty to skip)
                </span>
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="your@email.com"
                style={input}
              />
            </div>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "16px",
                marginBottom: 24,
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 10,
                }}
              >
                Scan summary
              </div>
              {[
                { l: "File", v: file?.name },
                { l: "Context", v: context },
                { l: "Date column", v: dateColumn },
                { l: "Sensitivity", v: sensitivity },
              ].map((r) => (
                <div
                  key={r.l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "4px 0",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>{r.l}</span>
                  <span style={{ color: "#475569", fontWeight: 500 }}>
                    {r.v}
                  </span>
                </div>
              ))}
            </div>
            {error && (
              <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>
                ⚠️ {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "13px 20px",
                  background: "#f8fafc",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleScan}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: loading ? "#a5b4fc" : "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "⏳ Scanning... Gemini is thinking" : "🚀 Run Scan"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Results */}
        {step === 3 && result && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b" }}>
                📋 Scan Results
              </div>
              <button
                onClick={() => {
                  setStep(0);
                  setResult(null);
                  setFile(null);
                  setColumns([]);
                  setContext("");
                  setRecipientEmail("");
                }}
                style={{
                  padding: "8px 16px",
                  background: "#f8fafc",
                  color: "#64748b",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                New Scan
              </button>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {[
                { l: "Critical", v: result.summary.critical, c: "#ef4444" },
                { l: "Warning", v: result.summary.warnings, c: "#f59e0b" },
                { l: "Normal", v: result.summary.normal, c: "#22c55e" },
                { l: "Columns", v: result.summary.total_columns, c: "#6366f1" },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{
                    flex: 1,
                    minWidth: 70,
                    background: "#fff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "12px",
                    textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.l}</div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: s.c,
                      marginTop: 2,
                    }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
            {result.email_alert?.sent && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#15803d",
                }}
              >
                ✅ Alert email sent to{" "}
                <strong>{result.email_alert.recipient}</strong>
              </div>
            )}
            {result.columns.map((col, i) => (
              <ColumnCard key={i} col={col} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanPage;
