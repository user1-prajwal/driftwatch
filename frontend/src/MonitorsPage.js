import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// Helper — makes axios call WITH auth token
// Every monitor API call must include this

const authHeaders = (session) => ({
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});

// Small reusable components

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

function SensitivityPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[
        { key: "low",    label: "Low",    desc: "Extreme only" },
        { key: "medium", label: "Medium", desc: "Moderate changes" },
        { key: "high",   label: "High",   desc: "Even small changes" },
      ].map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={{
            flex: 1, padding: "11px 8px", borderRadius: 10,
            border: value === o.key ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
            background: value === o.key ? "#eef2ff" : "#fff",
            color: value === o.key ? "#4f46e5" : "#64748b",
            cursor: "pointer", fontSize: 13, transition: "all 0.2s",
          }}
        >
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

// Monitor card

function MonitorCard({ monitor, session, onRefresh }) {
  const [running, setRunning] = useState(false);
  const [msg,     setMsg]     = useState("");

  const intervalOptions = [
    { value: 1,   label: "Every 1 hour" },
    { value: 3,   label: "Every 3 hours" },
    { value: 6,   label: "Every 6 hours" },
    { value: 12,  label: "Every 12 hours" },
    { value: 24,  label: "Every day" },
    { value: 48,  label: "Every 2 days" },
    { value: 168, label: "Every week" },
  ];

  const statusColor = (s) =>
    s === "CRITICAL" ? "#ef4444" : s === "WARNING" ? "#f59e0b" : s === "ERROR" ? "#f97316" : "#22c55e";

  const handleRunNow = async () => {
    setRunning(true); setMsg("");
    try {
      await axios.post(`${API}/monitors/${monitor.id}/run`, {}, authHeaders(session));
      setMsg("✅ Triggered! Check your email in ~30 seconds.");
      setTimeout(() => onRefresh(), 3000);
    } catch { setMsg("❌ Could not trigger."); }
    finally { setRunning(false); }
  };

  const handlePause = async () => {
    try {
      await axios.post(`${API}/monitors/${monitor.id}/pause`, {}, authHeaders(session));
      onRefresh();
    } catch { setMsg("❌ Could not pause."); }
  };

  const handleResume = async () => {
    try {
      await axios.post(`${API}/monitors/${monitor.id}/resume`, {}, authHeaders(session));
      onRefresh();
    } catch { setMsg("❌ Could not resume."); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${monitor.name}"?`)) return;
    try {
      await axios.delete(`${API}/monitors/${monitor.id}`, authHeaders(session));
      onRefresh();
    } catch { setMsg("❌ Could not delete."); }
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      border: "1.5px solid #e2e8f0", padding: "20px 22px",
      marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flex: 1 }}>

          {/* Name + status badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{monitor.name}</div>
            <span style={{
              background: monitor.status === "active" ? "#f0fdf4" : "#f8fafc",
              color: monitor.status === "active" ? "#15803d" : "#64748b",
              border: `1px solid ${monitor.status === "active" ? "#86efac" : "#e2e8f0"}`,
              borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600,
            }}>
              {monitor.status === "active" ? "● Active" : "⏸ Paused"}
            </span>
            {monitor.last_status && (
              <span style={{
                background: monitor.last_status === "CRITICAL" ? "#fef2f2" : monitor.last_status === "WARNING" ? "#fffbeb" : monitor.last_status === "ERROR" ? "#fff7ed" : "#f0fdf4",
                color: statusColor(monitor.last_status),
                borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600,
              }}>
                Last: {monitor.last_status}
              </span>
            )}
          </div>

          {/* Details grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
            {[
              { l: "Source",    v: monitor.source_type === "google_sheet" ? "Google Sheet" : monitor.source_value },
              { l: "Frequency", v: intervalOptions.find(o => o.value === monitor.interval_hours)?.label || `Every ${monitor.interval_hours}h` },
              { l: "Sensitivity", v: monitor.sensitivity.charAt(0).toUpperCase() + monitor.sensitivity.slice(1) },
              { l: "Alert to",  v: monitor.alert_email },
              { l: "Last run",  v: monitor.last_run ? new Date(monitor.last_run).toLocaleString() : "Never" },
              { l: "Stats",     v: `${monitor.total_runs} runs · ${monitor.total_alerts} alerts sent` },
            ].map((r) => (
              <div key={r.l} style={{ fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>{r.l}: </span>
                <span style={{ color: "#475569", fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>

          {msg && (
            <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith("✅") ? "#15803d" : "#ef4444" }}>
              {msg}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleRunNow}
            disabled={running}
            style={{
              padding: "8px 16px",
              background: running ? "#a5b4fc" : "#6366f1",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 12, fontWeight: 700,
              cursor: running ? "not-allowed" : "pointer",
            }}
          >
            {running ? "⏳..." : "▶ Run Now"}
          </button>

          {monitor.status === "active" ? (
            <button onClick={handlePause} style={{ padding: "8px 16px", background: "#fff", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ⏸ Pause
            </button>
          ) : (
            <button onClick={handleResume} style={{ padding: "8px 16px", background: "#fff", color: "#22c55e", border: "1.5px solid #86efac", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ▶ Resume
            </button>
          )}

          <button onClick={handleDelete} style={{ padding: "8px 16px", background: "#fff", color: "#ef4444", border: "1.5px solid #fca5a5", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Create monitor form — 3 steps

function CreateMonitorForm({ session, onCreated, onCancel }) {
  const [step,          setStep]          = useState(0);
  const [name,          setName]          = useState("");
  const [sourceType,    setSourceType]    = useState("google_sheet");
  const [sourceValue,   setSourceValue]   = useState("");
  const [dateColumn,    setDateColumn]    = useState("");
  const [context,       setContext]       = useState("");
  const [sensitivity,   setSensitivity]   = useState("medium");
  const [alertEmail,    setAlertEmail]    = useState(session?.user?.email || "");
  const [intervalHours, setIntervalHours] = useState(24);
  const [creating,      setCreating]      = useState(false);
  const [error,         setError]         = useState("");

  const formSteps    = ["Data source", "Configure", "Schedule & Alert"];
  const intervalOpts = [
    { value: 1,   label: "Every 1 hour" },
    { value: 3,   label: "Every 3 hours" },
    { value: 6,   label: "Every 6 hours" },
    { value: 12,  label: "Every 12 hours" },
    { value: 24,  label: "Every day" },
    { value: 48,  label: "Every 2 days" },
    { value: 168, label: "Every week" },
  ];

  const handleCreate = async () => {
    if (!alertEmail) return setError("Please enter an alert email.");
    setCreating(true); setError("");

    const form = new FormData();
    form.append("name",           name);
    form.append("source_type",    sourceType);
    form.append("source_value",   sourceValue);
    form.append("date_column",    dateColumn);
    form.append("context",        context);
    form.append("sensitivity",    sensitivity);
    form.append("alert_email",    alertEmail);
    form.append("interval_hours", intervalHours);

    try {
      await axios.post(`${API}/monitors`, form, authHeaders(session));
      onCreated();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not create monitor.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 16,
      border: "1.5px solid #6366f1", padding: "28px",
      marginBottom: 24, boxShadow: "0 1px 8px rgba(99,102,241,0.1)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#1e293b" }}>Create New Monitor</div>
        <button onClick={onCancel} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20 }}>✕</button>
      </div>

      <StepIndicator steps={formSteps} current={step} />

      {/* Step 0 — Data source */}
      {step === 0 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Monitor name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Sales Check" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Data source type</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ key: "google_sheet", label: "🔗 Google Sheet" }, { key: "csv_path", label: "📄 Local CSV path" }].map(o => (
                <button key={o.key} onClick={() => setSourceType(o.key)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: sourceType === o.key ? "2px solid #6366f1" : "1.5px solid #e2e8f0", background: sourceType === o.key ? "#eef2ff" : "#fff", color: sourceType === o.key ? "#4f46e5" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: sourceType === o.key ? 700 : 400 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{sourceType === "google_sheet" ? "Google Sheet CSV export URL" : "CSV file path"}</label>
            <input type="text" value={sourceValue} onChange={e => setSourceValue(e.target.value)}
              placeholder={sourceType === "google_sheet" ? "https://docs.google.com/spreadsheets/d/.../export?format=csv" : "data/myfile.csv"}
              style={inputStyle} />
            {sourceType === "google_sheet" && (
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                File → Share → Publish to web → CSV → copy link
              </div>
            )}
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
          <button onClick={() => { if (!name || !sourceValue) return setError("Fill all fields."); setError(""); setStep(1); }}
            style={{ width: "100%", padding: "13px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 1 — Configure */}
      {step === 1 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Date column name</label>
              <input type="text" value={dateColumn} onChange={e => setDateColumn(e.target.value)} placeholder="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Describe your data</label>
              <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="daily sales data" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Sensitivity</label>
            <SensitivityPicker value={sensitivity} onChange={setSensitivity} />
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ padding: "13px 20px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
            <button onClick={() => { if (!dateColumn || !context) return setError("Fill all fields."); setError(""); setStep(2); }}
              style={{ flex: 1, padding: "13px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Schedule + Alert */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Alert email</label>
            <input type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Check frequency</label>
            <select value={intervalHours} onChange={e => setIntervalHours(Number(e.target.value))} style={inputStyle}>
              {intervalOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Summary */}
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Monitor summary</div>
            {[
              { l: "Name",      v: name },
              { l: "Source",    v: sourceType === "google_sheet" ? "Google Sheet" : sourceValue },
              { l: "Date col",  v: dateColumn },
              { l: "Context",   v: context },
              { l: "Sensitivity", v: sensitivity },
              { l: "Frequency", v: intervalOpts.find(o => o.value === intervalHours)?.label },
              { l: "Alert to",  v: alertEmail },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ color: "#94a3b8" }}>{r.l}</span>
                <span style={{ color: "#475569", fontWeight: 500 }}>{r.v}</span>
              </div>
            ))}
          </div>

          {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ padding: "13px 20px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, cursor: "pointer" }}>← Back</button>
            <button onClick={handleCreate} disabled={creating}
              style={{ flex: 1, padding: "13px", background: creating ? "#a5b4fc" : "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer" }}>
              {creating ? "⏳ Creating..." : "🚀 Start Monitoring"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// MONITORS PAGE — main component

export default function MonitorsPage({ session, onBack, onLogout }) {
  const [monitors,   setMonitors]   = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const loadMonitors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/monitors`, authHeaders(session));
      setMonitors(res.data.monitors || []);
    } catch {
      setError("Could not load monitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMonitors(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", alignItems: "center", height: 60 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginRight: 16 }}>← Back</button>
        <span style={{ fontSize: 20 }}>🌊</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginLeft: 8 }}>DriftWatch</span>
        {/* <span style={{ marginLeft: 12, fontSize: 13, color: "#94a3b8" }}>Monitors</span> */}

        {/* User info + logout */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            👤 {session?.user?.email}
          </div>
          <button
            onClick={onLogout}
            style={{ padding: "6px 14px", background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#1e293b" }}>⏰ Your Monitors</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              DriftWatch automatically scans your data and alerts you.
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              + New Monitor
            </button>
          )}
        </div>

        {/* Messages */}
        {success && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#15803d" }}>✅ {success}</div>}
        {error   && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>⚠️ {error}</div>}

        {/* Create form */}
        {showForm && (
          <CreateMonitorForm
            session={session}
            onCreated={() => {
              setShowForm(false);
              setSuccess("Monitor created! It will start scanning on schedule.");
              loadMonitors();
              setTimeout(() => setSuccess(""), 4000);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Monitors list */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            Loading your monitors...
          </div>
        )}

        {!loading && monitors.length === 0 && !showForm && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px dashed #e2e8f0", padding: "56px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>⏰</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#1e293b", marginBottom: 8 }}>No monitors yet</div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
              Create a monitor and DriftWatch will automatically scan your data and alert you when something looks wrong.
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "12px 28px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              + Create your first monitor
            </button>
          </div>
        )}

        {!loading && monitors.map(monitor => (
          <MonitorCard
            key={monitor.id}
            monitor={monitor}
            session={session}
            onRefresh={loadMonitors}
          />
        ))}
      </div>
    </div>
  );
}