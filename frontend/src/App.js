import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// Color helpers
const statusColor = (status) => {
  if (status?.includes("CRITICAL")) return "#ef4444";
  if (status?.includes("WARNING"))  return "#f59e0b";
  return "#22c55e";
};

const statusBg = (status) => {
  if (status?.includes("CRITICAL")) return "#fef2f2";
  if (status?.includes("WARNING"))  return "#fffbeb";
  return "#f0fdf4";
};

const severityColor = (severity) => {
  if (severity >= 75) return "#ef4444";
  if (severity >= 40) return "#f59e0b";
  return "#22c55e";
};


// Small reusable components

function Badge({ status }) {
  return (
    <span style={{
      background:   statusBg(status),
      color:        statusColor(status),
      border:       `1px solid ${statusColor(status)}`,
      borderRadius: 999,
      padding:      "2px 12px",
      fontSize:     12,
      fontWeight:   600,
    }}>
      {status?.replace("🟢 ", "").replace("🟡 ", "").replace("🔴 ", "")}
    </span>
  );
}

function SeverityBar({ severity }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 3 }}>
        <span>Severity</span>
        <span style={{ fontWeight: 600, color: severityColor(severity) }}>{severity} / 100</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 999, height: 6 }}>
        <div style={{
          width:        `${severity}%`,
          background:   severityColor(severity),
          borderRadius: 999,
          height:       6,
          transition:   "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function SensitivityPicker({ value, onChange }) {
  const options = [
    { key: "low",    label: "Low",    desc: "Only extreme changes" },
    { key: "medium", label: "Medium", desc: "Moderate changes" },
    { key: "high",   label: "High",   desc: "Even small changes" },
  ];
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={{
            flex:         1,
            padding:      "10px 8px",
            borderRadius: 10,
            border:       value === o.key ? "2px solid #6366f1" : "1.5px solid #e5e7eb",
            background:   value === o.key ? "#eef2ff" : "#fff",
            color:        value === o.key ? "#4f46e5" : "#374151",
            cursor:       "pointer",
            fontWeight:   value === o.key ? 700 : 400,
            fontSize:     13,
            transition:   "all 0.2s",
          }}
        >
          <div style={{ fontWeight: 600 }}>{o.label}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{o.desc}</div>
        </button>
      ))}
    </div>
  );
}


// Column result card

function ColumnCard({ col }) {
  const [open, setOpen] = useState(col.status?.includes("CRITICAL"));

  // Parse Gemini explanation text into sections
  const parseExplanation = (text) => {
    if (!text) return null;
    const sections = {};
    const whatMatch    = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
    const causesMatch  = text.match(/POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/);
    const actionMatch  = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
    if (whatMatch)   sections.what   = whatMatch[1].trim();
    if (causesMatch) sections.causes = causesMatch[1].trim().split("\n").filter(Boolean);
    if (actionMatch) sections.action = actionMatch[1].trim();
    return sections;
  };

  const explanation = col.gemini_explanation
    ? parseExplanation(col.gemini_explanation)
    : null;

  return (
    <div style={{
      border:       `1.5px solid ${statusColor(col.status)}30`,
      borderRadius: 12,
      background:   "#fff",
      marginBottom: 12,
      overflow:     "hidden",
      boxShadow:    "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display:    "flex",
          alignItems: "center",
          padding:    "14px 18px",
          cursor:     "pointer",
          gap:        12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
            {col.column}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            {col.type === "numeric"
              ? `Latest: ${col.today_value}  ·  Normal avg: ${col.baseline_mean}`
              : `Distribution shift detected`}
          </div>
        </div>
        <Badge status={col.status} />
        <span style={{ color: "#9ca3af", fontSize: 13 }}>{open ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f3f4f6" }}>
          <SeverityBar severity={col.severity} />

          {/* Numeric detail */}
          {col.type === "numeric" && (
            <div style={{
              display:       "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap:           8,
              marginTop:     14,
            }}>
              {[
                { label: "Latest value",   value: col.today_value },
                { label: "Normal average", value: col.baseline_mean },
                { label: "Std deviation",  value: col.baseline_std },
              ].map(item => (
                <div key={item.label} style={{
                  background:   "#f9fafb",
                  borderRadius: 8,
                  padding:      "10px 12px",
                  textAlign:    "center",
                }}>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginTop: 2 }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Categorical distribution */}
          {col.type === "categorical" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Distribution comparison</div>
              {Object.keys(col.baseline_pct || {}).map(cat => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <span>
                      <span style={{ color: "#6b7280" }}>normal {col.baseline_pct[cat]}%</span>
                      {" → "}
                      <span style={{ fontWeight: 600, color: statusColor(col.status) }}>
                        today {col.today_pct?.[cat] ?? 0}%
                      </span>
                    </span>
                  </div>
                  <div style={{ background: "#e5e7eb", borderRadius: 999, height: 5 }}>
                    <div style={{
                      width:      `${col.today_pct?.[cat] ?? 0}%`,
                      background: statusColor(col.status),
                      borderRadius: 999,
                      height:     5,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gemini explanation */}
          {explanation && (
            <div style={{
              marginTop:    14,
              background:   "#fafafa",
              border:       "1px solid #e5e7eb",
              borderRadius: 10,
              padding:      "12px 14px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 8, letterSpacing: "0.05em" }}>
                💡 AI EXPLANATION
              </div>
              {explanation.what && (
                <p style={{ fontSize: 13, color: "#374151", marginBottom: 10, lineHeight: 1.6 }}>
                  {explanation.what}
                </p>
              )}
              {explanation.causes && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>POSSIBLE CAUSES</div>
                  {explanation.causes.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 3, display: "flex", gap: 6 }}>
                      <span style={{ color: "#6366f1", fontWeight: 600 }}>{i + 1}.</span> {c.replace(/^\d+\.\s*/, "")}
                    </div>
                  ))}
                </div>
              )}
              {explanation.action && (
                <div style={{
                  background:   "#eef2ff",
                  borderRadius: 8,
                  padding:      "8px 12px",
                  fontSize:     13,
                  color:        "#4f46e5",
                }}>
                  <strong>Action:</strong> {explanation.action}
                </div>
              )}
            </div>
          )}

          {/* No explanation — severity too low */}
          {!explanation && col.severity <= 30 && (
            <div style={{ marginTop: 12, fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>
              No anomaly explanation needed — values are within normal range.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Summary bar at top of results

function SummaryBar({ summary }) {
  const overall = summary.overall_status;
  return (
    <div style={{
      display:      "flex",
      gap:          12,
      marginBottom: 20,
      flexWrap:     "wrap",
    }}>
      {[
        { label: "Overall",  value: overall,            color: statusColor("🔴 " + overall) },
        { label: "Critical", value: summary.critical,   color: "#ef4444" },
        { label: "Warning",  value: summary.warnings,   color: "#f59e0b" },
        { label: "Normal",   value: summary.normal,     color: "#22c55e" },
        { label: "Columns",  value: summary.total_columns, color: "#6366f1" },
      ].map(item => (
        <div key={item.label} style={{
          flex:         1,
          minWidth:     80,
          background:   "#fff",
          border:       "1.5px solid #e5e7eb",
          borderRadius: 10,
          padding:      "12px 14px",
          textAlign:    "center",
          boxShadow:    "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: item.color, marginTop: 2 }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}


// Main App

export default function App() {
  const [file,        setFile]        = useState(null);
  const [columns,     setColumns]     = useState([]);
  const [dateColumn,  setDateColumn]  = useState("");
  const [context,     setContext]     = useState("");
  const [sensitivity, setSensitivity] = useState("medium");
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState("");
  const [apiOk,       setApiOk]       = useState(null);

  // Check if backend is running on startup
  useEffect(() => {
    axios.get(`${API}/health`)
      .then(() => setApiOk(true))
      .catch(() => setApiOk(false));
  }, []);

  // When user picks a file → fetch its columns for dropdown
  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");
    setColumns([]);
    setDateColumn("");

    const form = new FormData();
    form.append("file", f);
    try {
      const res = await axios.post(`${API}/columns`, form);
      setColumns(res.data.columns);
      // Auto-select first column that looks like a date
      const dateGuess = res.data.columns.find(c =>
        c.toLowerCase().includes("date") || c.toLowerCase().includes("time")
      );
      if (dateGuess) setDateColumn(dateGuess);
    } catch {
      setError("Could not read columns from file.");
    }
  };

  // Scan the file
  const handleScan = async () => {
    if (!file)        return setError("Please upload a CSV file.");
    if (!dateColumn)  return setError("Please select the date column.");
    if (!context)     return setError("Please describe your data.");

    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("file",        file);
    form.append("date_column", dateColumn);
    form.append("context",     context);
    form.append("sensitivity", sensitivity);

    try {
      const res = await axios.post(`${API}/scan`, form);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Scan failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:   "100vh",
      background:  "#f8fafc",
      fontFamily:  "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        background:   "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding:      "16px 24px",
        display:      "flex",
        alignItems:   "center",
        gap:          12,
      }}>
        <div style={{ fontSize: 22 }}>🌊</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>DriftWatch</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>AI-powered data quality monitor</div>
        </div>
        {/* API status indicator */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: apiOk === null ? "#9ca3af" : apiOk ? "#22c55e" : "#ef4444",
          }} />
          <span style={{ color: "#6b7280" }}>
            {apiOk === null ? "Checking..." : apiOk ? "Backend connected" : "Backend offline"}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>

        {/* Upload card */}
        <div style={{
          background:   "#fff",
          borderRadius: 14,
          border:       "1.5px solid #e5e7eb",
          padding:      "24px",
          marginBottom: 24,
          boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 18 }}>
            📁 Upload your data
          </div>

          {/* File input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{
                width:        "100%",
                padding:      "10px 12px",
                border:       "1.5px dashed #d1d5db",
                borderRadius: 8,
                fontSize:     13,
                cursor:       "pointer",
                background:   "#fafafa",
              }}
            />
            {file && (
              <div style={{ fontSize: 12, color: "#22c55e", marginTop: 4 }}>
                ✅ {file.name} loaded — {columns.length} columns found
              </div>
            )}
          </div>

          {/* Describe your data */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>
              Describe your data
            </label>
            <input
              type="text"
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="e.g. daily sales of an online store"
              style={{
                width:        "100%",
                padding:      "10px 12px",
                border:       "1.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize:     13,
                outline:      "none",
                boxSizing:    "border-box",
              }}
            />
          </div>

          {/* Date column dropdown */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 6 }}>
              Date column
            </label>
            <select
              value={dateColumn}
              onChange={e => setDateColumn(e.target.value)}
              style={{
                width:        "100%",
                padding:      "10px 12px",
                border:       "1.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize:     13,
                background:   "#fff",
                outline:      "none",
              }}
            >
              <option value="">-- upload a CSV first --</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Sensitivity picker */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 8 }}>
              How sensitive should DriftWatch be?
            </label>
            <SensitivityPicker value={sensitivity} onChange={setSensitivity} />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fca5a5",
              borderRadius: 8, padding: "10px 14px",
              fontSize: 13, color: "#dc2626", marginBottom: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={loading}
            style={{
              width:        "100%",
              padding:      "13px",
              background:   loading ? "#a5b4fc" : "#6366f1",
              color:        "#fff",
              border:       "none",
              borderRadius: 10,
              fontSize:     15,
              fontWeight:   700,
              cursor:       loading ? "not-allowed" : "pointer",
              transition:   "background 0.2s",
            }}
          >
            {loading ? "⏳ Scanning... (Gemini is thinking)" : "🚀 Scan Now"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 14 }}>
              📋 Results — {result.filename}
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 400, marginLeft: 10 }}>
                Sensitivity: {result.sensitivity} · {new Date(result.scanned_at).toLocaleTimeString()}
              </span>
            </div>

            <SummaryBar summary={result.summary} />

            {result.columns.map((col, i) => (
              <ColumnCard key={i} col={col} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}