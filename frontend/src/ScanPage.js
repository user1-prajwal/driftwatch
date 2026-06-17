import { useState } from "react";
import axios from "axios";

// const API = "http://localhost:8000";
const API="https://driftwatch-backend.onrender.com";

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #e2e8f0", borderRadius: 10,
  fontSize: 14, outline: "none",
  boxSizing: "border-box", background: "#fff", color: "#1e293b",
};
const labelStyle = {
  fontSize: 13, color: "#475569",
  fontWeight: 600, display: "block", marginBottom: 7,
};

const statusColor = (s) => s?.includes("CRITICAL") ? "#ef4444" : s?.includes("WARNING") ? "#f59e0b" : "#22c55e";
const statusBg    = (s) => s?.includes("CRITICAL") ? "#fef2f2" : s?.includes("WARNING") ? "#fffbeb" : "#f0fdf4";

function SensitivityPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[
        { key: "low",    label: "Low",    desc: "Only big changes" },
        { key: "medium", label: "Medium", desc: "Moderate changes" },
        { key: "high",   label: "High",   desc: "Even small changes" },
      ].map((o) => (
        <button key={o.key} onClick={() => onChange(o.key)} style={{
          flex: 1, padding: "11px 8px", borderRadius: 10,
          border: value === o.key ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
          background: value === o.key ? "#eef2ff" : "#fff",
          color: value === o.key ? "#4f46e5" : "#64748b",
          cursor: "pointer", fontSize: 13, transition: "all 0.2s",
        }}>
          <div style={{ fontWeight: 700 }}>{o.label}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{o.desc}</div>
        </button>
      ))}
    </div>
  );
}

function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "unset" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: i < current ? "#6366f1" : i === current ? "#6366f1" : "#e2e8f0",
              color: i <= current ? "#fff" : "#94a3b8",
              border: i === current ? "2px solid #818cf8" : "none",
              boxShadow: i === current ? "0 0 0 3px #eef2ff" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === current ? 700 : 400, color: i === current ? "#4f46e5" : i < current ? "#6366f1" : "#94a3b8" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < current ? "#6366f1" : "#e2e8f0", margin: "0 10px" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Column result card — plain English, no jargon

function ColumnCard({ col }) {
  const [open, setOpen] = useState(col.status?.includes("CRITICAL") || col.status?.includes("WARNING"));

  const parse = (text) => {
    if (!text) return null;
    const s = {};
    const w = text.match(/WHAT HAPPENED:\n([\s\S]*?)(?=\nPOSSIBLE CAUSES:|$)/);
    const c = text.match(/POSSIBLE CAUSES:\n([\s\S]*?)(?=\nRECOMMENDED ACTION:|$)/);
    const a = text.match(/RECOMMENDED ACTION:\n([\s\S]*?)$/);
    if (w) s.what   = w[1].trim();
    if (c) s.causes = c[1].trim().split("\n").filter(Boolean);
    if (a) s.action = a[1].trim();
    return s;
  };

  const exp    = col.gemini_explanation ? parse(col.gemini_explanation) : null;
  const isGood = col.status?.includes("NORMAL");

  // Plain English status label
  const statusLabel = col.status?.includes("CRITICAL") ? "Needs attention"
    : col.status?.includes("WARNING") ? "Slightly unusual"
    : "Looks normal";

  return (
    <div style={{
      border: `1.5px solid ${statusColor(col.status)}30`,
      borderRadius: 14,
      background: "#fff",
      marginBottom: 12,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* ── Header row — always visible ── */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", padding: "16px 18px", cursor: "pointer", gap: 12 }}
      >
        {/* Status dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: statusColor(col.status),
          boxShadow: `0 0 0 3px ${statusBg(col.status)}`,
        }} />

        <div style={{ flex: 1 }}>
          {/* Column name */}
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
            {col.column === "row_anomaly" ? "Overall row check" : col.column}
          </div>

          {/* Plain English one-liner */}
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            {col.change_text || (isGood ? "Values are within normal range" : "Something looks off")}
          </div>
        </div>

        {/* Status badge — plain English */}
        <span style={{
          background: statusBg(col.status),
          color: statusColor(col.status),
          border: `1px solid ${statusColor(col.status)}`,
          borderRadius: 999, padding: "4px 12px",
          fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
        }}>
          {statusLabel}
        </span>

        <span style={{ color: "#cbd5e1", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>

      {/* ── Expanded detail ── */}
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f1f5f9" }}>

          {/* Numeric: simple before/after comparison */}
          {col.type === "numeric" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <div style={{ background: statusBg(col.status), borderRadius: 10, padding: "14px 16px", textAlign: "center", border: `1px solid ${statusColor(col.status)}30` }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Today's value</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: statusColor(col.status) }}>
                  {col.today_value?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Usually around</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>
                  {col.baseline_mean?.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Categorical: simple before/after */}
          {col.type === "categorical" && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
                HOW THE DISTRIBUTION CHANGED
              </div>
              {Object.keys(col.baseline_pct || {}).map(cat => {
                const before = col.baseline_pct[cat];
                const after  = col.today_pct?.[cat] ?? 0;
                const changed = Math.abs(after - before) > 10;
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>{cat}</span>
                      <span>
                        <span style={{ color: "#94a3b8" }}>before: {before}%</span>
                        <span style={{ margin: "0 6px", color: "#cbd5e1" }}>→</span>
                        <span style={{ fontWeight: 700, color: changed ? statusColor(col.status) : "#22c55e" }}>
                          now: {after}%
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {/* Before bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Before</div>
                        <div style={{ background: "#e2e8f0", borderRadius: 999, height: 6 }}>
                          <div style={{ width: `${before}%`, background: "#94a3b8", borderRadius: 999, height: 6 }} />
                        </div>
                      </div>
                      {/* After bar */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Now</div>
                        <div style={{ background: "#e2e8f0", borderRadius: 999, height: 6 }}>
                          <div style={{ width: `${after}%`, background: changed ? statusColor(col.status) : "#22c55e", borderRadius: 999, height: 6 }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Isolation Forest: which columns look off */}
          {col.type === "isolation_forest" && col.top_deviants && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
                COLUMNS THAT LOOK UNUSUAL TOGETHER
              </div>
              {Object.entries(col.top_deviants).map(([c, score]) => (
                <div key={c} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{c}</span>
                  <span style={{ color: score > 3 ? "#ef4444" : score > 2 ? "#f59e0b" : "#22c55e", fontWeight: 600 }}>
                    {score > 3 ? "Very unusual" : score > 2 ? "Slightly unusual" : "Minor change"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* AI Explanation */}
          {exp && (
            <div style={{ marginTop: 14, background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 10, letterSpacing: "0.05em" }}>
                💡 WHAT THE AI THINKS
              </div>
              {exp.what && (
                <p style={{ fontSize: 14, color: "#1e293b", marginBottom: 12, lineHeight: 1.7, fontWeight: 500 }}>
                  {exp.what}
                </p>
              )}
              {exp.causes && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>POSSIBLE REASONS</div>
                  {exp.causes.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 6, display: "flex", gap: 8, lineHeight: 1.5 }}>
                      <span style={{ color: "#6366f1", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      {c.replace(/^\d+\.\s*/, "")}
                    </div>
                  ))}
                </div>
              )}
              {exp.action && (
                <div style={{ background: "#eef2ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4f46e5", lineHeight: 1.6 }}>
                  <strong>What to do:</strong> {exp.action}
                </div>
              )}
            </div>
          )}

          {/* Normal — reassurance message */}
          {isGood && !exp && (
            <div style={{ marginTop: 14, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#15803d" }}>
              ✅ This column looks completely normal. No action needed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// MAIN SCAN PAGE

export default function ScanPage({ onBack }) {
  const [step,            setStep]            = useState(0);
  const [file,            setFile]            = useState(null);
  const [allColumns,      setAllColumns]      = useState([]);
  const [dateColumn,      setDateColumn]      = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [context,         setContext]         = useState("");
  const [sensitivity,     setSensitivity]     = useState("medium");
  const [loading,         setLoading]         = useState(false);
  const [result,          setResult]          = useState(null);
  const [error,           setError]           = useState("");

  const steps = ["Upload file", "Select columns", "Configure"];

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setError(""); setAllColumns([]);
    setDateColumn(""); setSelectedColumns([]);

    const form = new FormData();
    form.append("file", f);
    try {
      const res = await axios.post(`${API}/columns`, form);
      const cols = res.data.columns;
      setAllColumns(cols);
      const guess = cols.find(c => c.toLowerCase().includes("date") || c.toLowerCase().includes("time"));
      if (guess) setDateColumn(guess);
      setSelectedColumns(cols.filter(c => c !== guess));
    } catch { setError("Could not read columns from file."); }
  };

  const toggleColumn = (col) => {
    if (col === dateColumn) return;
    setSelectedColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const toggleAll = () => {
    const nonDate = allColumns.filter(c => c !== dateColumn);
    setSelectedColumns(selectedColumns.length === nonDate.length ? [] : nonDate);
  };

  const handleScan = async () => {
    if (selectedColumns.length === 0) return setError("Please select at least one column.");
    setLoading(true); setError("");

    const form = new FormData();
    form.append("file",            file);
    form.append("date_column",     dateColumn);
    form.append("context",         context || "data monitoring");
    form.append("sensitivity",     sensitivity);
    form.append("monitor_columns", selectedColumns.join(","));

    try {
      const res = await axios.post(`${API}/scan`, form);
      setResult(res.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.detail || "Scan failed. Is the backend running?");
    } finally { setLoading(false); }
  };

  const resetScan = () => {
    setStep(0); setResult(null); setFile(null);
    setAllColumns([]); setSelectedColumns([]);
    setContext(""); setError("");
  };

  // Overall status for summary
  const overallStatus = result?.summary?.overall_status;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 60 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginRight: 16 }}>← Back</button>
        <span style={{ fontSize: 20 }}>🌊</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginLeft: 8 }}>DriftWatch</span>
        <span style={{ marginLeft: 12, fontSize: 13, color: "#94a3b8" }}>/ One-time Scan</span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px" }}>

        {step < 3 && <StepIndicator steps={steps} current={step} />}

        {/* ── STEP 0: Upload ── */}
        {step === 0 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b", marginBottom: 6 }}>Upload your data file</div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Upload a CSV file with your data. It needs a date column and at least one column with numbers.</div>
            <label style={labelStyle}>Select CSV file</label>
            <input type="file" accept=".csv" onChange={handleFileChange}
              style={{ ...inputStyle, border: "1.5px dashed #cbd5e1", background: "#f8fafc", cursor: "pointer", padding: "20px" }} />
            {file && allColumns.length > 0 && (
              <div style={{ marginTop: 16, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#15803d" }}>✅ {file.name}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Found {allColumns.length} columns: {allColumns.join(", ")}</div>
              </div>
            )}
            {error && <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>⚠️ {error}</div>}
            <button onClick={() => { if (!file || !allColumns.length) return setError("Please upload a file first."); setError(""); setStep(1); }}
              style={{ width: "100%", marginTop: 24, padding: "13px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 1: Select columns ── */}
        {step === 1 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b", marginBottom: 6 }}>Choose what to monitor</div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Select which columns you want DriftWatch to check. Only selected columns will appear in the results.</div>

            {/* Date column */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Which column contains the date?</label>
              <select value={dateColumn} onChange={e => { setDateColumn(e.target.value); setSelectedColumns(allColumns.filter(c => c !== e.target.value)); }} style={inputStyle}>
                {allColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Column checkboxes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Which columns to check for anomalies?</label>
                <button onClick={toggleAll} style={{ fontSize: 12, color: "#6366f1", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  {selectedColumns.length === allColumns.filter(c => c !== dateColumn).length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {allColumns.filter(c => c !== dateColumn).map(col => {
                  const isSelected = selectedColumns.includes(col);
                  return (
                    <div key={col} onClick={() => toggleColumn(col)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      border: isSelected ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                      background: isSelected ? "#eef2ff" : "#f8fafc",
                      transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: isSelected ? "2px solid #6366f1" : "2px solid #cbd5e1",
                        background: isSelected ? "#6366f1" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? "#4f46e5" : "#475569" }}>{col}</span>
                    </div>
                  );
                })}
              </div>

              {selectedColumns.length > 0 ? (
                <div style={{ marginTop: 12, fontSize: 13, color: "#6366f1", fontWeight: 500 }}>
                  ✅ Checking {selectedColumns.length} column{selectedColumns.length > 1 ? "s" : ""}: {selectedColumns.join(", ")}
                </div>
              ) : (
                <div style={{ marginTop: 12, fontSize: 13, color: "#f59e0b" }}>⚠️ Select at least one column.</div>
              )}
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ padding: "13px 20px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={() => { if (!selectedColumns.length) return setError("Select at least one column."); setError(""); setStep(2); }}
                style={{ flex: 1, padding: "13px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Configure + Scan ── */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b", marginBottom: 6 }}>Final settings</div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Tell DriftWatch a little about your data for better AI explanations.</div>

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>What does this data represent? <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
              <input type="text" value={context} onChange={e => setContext(e.target.value)}
                placeholder="e.g. daily sales of an online store" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>How sensitive should the check be?</label>
              <SensitivityPicker value={sensitivity} onChange={setSensitivity} />
            </div>

            {/* Summary */}
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", marginBottom: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8 }}>SCAN SUMMARY</div>
              {[
                { l: "File",        v: file?.name },
                { l: "Date column", v: dateColumn },
                { l: "Checking",    v: `${selectedColumns.join(", ")}` },
                { l: "Sensitivity", v: sensitivity },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ color: "#94a3b8" }}>{r.l}</span>
                  <span style={{ color: "#475569", fontWeight: 500, textAlign: "right", maxWidth: "65%" }}>{r.v}</span>
                </div>
              ))}
            </div>

            {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ padding: "13px 20px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
              <button onClick={handleScan} disabled={loading}
                style={{ flex: 1, padding: "13px", background: loading ? "#a5b4fc" : "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "⏳ Analysing your data..." : "🚀 Check for anomalies"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === 3 && result && (
          <div>
            {/* Overall status banner */}
            <div style={{
              background: overallStatus === "CRITICAL" ? "#fef2f2" : overallStatus === "WARNING" ? "#fffbeb" : "#f0fdf4",
              border: `1.5px solid ${overallStatus === "CRITICAL" ? "#fca5a5" : overallStatus === "WARNING" ? "#fcd34d" : "#86efac"}`,
              borderRadius: 14, padding: "20px 22px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b" }}>
                  {overallStatus === "CRITICAL" ? "🔴 Issues found in your data"
                    : overallStatus === "WARNING" ? "🟡 Some things look unusual"
                    : "🟢 Everything looks normal"}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {file?.name} · {selectedColumns.length} column{selectedColumns.length > 1 ? "s" : ""} checked · {new Date(result.scanned_at).toLocaleTimeString()}
                </div>
              </div>
              <button onClick={resetScan} style={{ padding: "8px 16px", background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
                New Scan
              </button>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[
                { l: "Issues",  v: result.summary.critical + result.summary.warnings, c: result.summary.critical > 0 ? "#ef4444" : result.summary.warnings > 0 ? "#f59e0b" : "#22c55e" },
                { l: "Normal",  v: result.summary.normal,   c: "#22c55e" },
                { l: "Checked", v: result.summary.total_columns, c: "#6366f1" },
              ].map(s => (
                <div key={s.l} style={{ flex: 1, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.c, marginTop: 2 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* All normal message */}
            {result.columns.length === 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "28px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#15803d", marginBottom: 4 }}>All columns look normal</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>No anomalies detected in the selected columns.</div>
              </div>
            )}

            {result.columns.map((col, i) => <ColumnCard key={i} col={col} />)}
          </div>
        )}
      </div>
    </div>
  );
}