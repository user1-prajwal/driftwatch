import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";
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

// MONITORS PAGE — step by step
function MonitorsPage({ onBack }) {
  const [monitors, setMonitors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [runningId, setRunningId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState("google_sheet");
  const [sourceValue, setSourceValue] = useState("");
  const [dateColumn, setDateColumn] = useState("");
  const [context, setContext] = useState("");
  const [sensitivity, setSensitivity] = useState("medium");
  const [alertEmail, setAlertEmail] = useState("");
  const [intervalHours, setIntervalHours] = useState(24);
  const [creating, setCreating] = useState(false);

  const formSteps = ["Data source", "Configure", "Schedule & Alert"];
  const intervalOptions = [
    { value: 1, label: "Every 1 hour" },
    { value: 3, label: "Every 3 hours" },
    { value: 6, label: "Every 6 hours" },
    { value: 12, label: "Every 12 hours" },
    { value: 24, label: "Every day" },
    { value: 48, label: "Every 2 days" },
    { value: 168, label: "Every week" },
  ];

  const load = async () => {
    try {
      const r = await axios.get(`${API}/monitors`);
      setMonitors(r.data.monitors || []);
    } catch {
      setError("Could not load monitors.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName("");
    setSourceValue("");
    setDateColumn("");
    setContext("");
    setAlertEmail("");
    setFormStep(0);
    setShowForm(false);
    setError("");
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    const form = new FormData();
    form.append("name", name);
    form.append("source_type", sourceType);
    form.append("source_value", sourceValue);
    form.append("date_column", dateColumn);
    form.append("context", context);
    form.append("sensitivity", sensitivity);
    form.append("alert_email", alertEmail);
    form.append("interval_hours", intervalHours);
    try {
      await axios.post(`${API}/monitors`, form);
      setSuccess(`"${name}" is now monitoring your data!`);
      resetForm();
      load();
    } catch (e) {
      setError(e.response?.data?.detail || "Could not create monitor.");
    } finally {
      setCreating(false);
    }
  };

  const handleRunNow = async (id, n) => {
    setRunningId(id);
    setSuccess("");
    setError("");
    try {
      await axios.post(`${API}/monitors/${id}/run`);
      setSuccess(`"${n}" triggered! Check your email in ~30 seconds.`);
    } catch {
      setError("Could not trigger monitor.");
    } finally {
      setRunningId(null);
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
          Auto Monitors
        </span>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginLeft: "auto",
              padding: "8px 18px",
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + New Monitor
          </button>
        )}
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 20px" }}>
        {success && (
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
            ✅ {success}
          </div>
        )}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 13,
              color: "#dc2626",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Create form — step by step */}
        {showForm && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #6366f1",
              padding: "28px",
              marginBottom: 24,
              boxShadow: "0 1px 8px rgba(99,102,241,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
                Create New Monitor
              </div>
              <button
                onClick={resetForm}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
            </div>
            <StepIndicator steps={formSteps} current={formStep} />

            {/* Form step 0 — source */}
            {formStep === 0 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Monitor name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Daily Sales Check"
                    style={input}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Data source type</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { key: "google_sheet", label: "🔗 Google Sheet" },
                      { key: "csv_path", label: "📄 Local CSV path" },
                    ].map((o) => (
                      <button
                        key={o.key}
                        onClick={() => setSourceType(o.key)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          borderRadius: 10,
                          border:
                            sourceType === o.key
                              ? "2px solid #6366f1"
                              : "1.5px solid #e2e8f0",
                          background: sourceType === o.key ? "#eef2ff" : "#fff",
                          color: sourceType === o.key ? "#4f46e5" : "#64748b",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: sourceType === o.key ? 700 : 400,
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={label}>
                    {sourceType === "google_sheet"
                      ? "Google Sheet CSV export URL"
                      : "CSV file path"}
                  </label>
                  <input
                    type="text"
                    value={sourceValue}
                    onChange={(e) => setSourceValue(e.target.value)}
                    placeholder={
                      sourceType === "google_sheet"
                        ? "https://docs.google.com/spreadsheets/d/.../export?format=csv"
                        : "data/myfile.csv"
                    }
                    style={input}
                  />
                  {sourceType === "google_sheet" && (
                    <div
                      style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}
                    >
                      File → Share → Publish to web → CSV → copy link
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!name || !sourceValue)
                      return setError("Fill all fields.");
                    setError("");
                    setFormStep(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Form step 1 — configure */}
            {formStep === 1 && (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <label style={label}>Date column name</label>
                    <input
                      type="text"
                      value={dateColumn}
                      onChange={(e) => setDateColumn(e.target.value)}
                      placeholder="date"
                      style={input}
                    />
                  </div>
                  <div>
                    <label style={label}>Describe your data</label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="daily sales data"
                      style={input}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={label}>Sensitivity</label>
                  <SensitivityPicker
                    value={sensitivity}
                    onChange={setSensitivity}
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setFormStep(0)}
                    style={{
                      padding: "13px 20px",
                      background: "#f8fafc",
                      color: "#64748b",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (!dateColumn || !context)
                        return setError("Fill all fields.");
                      setError("");
                      setFormStep(2);
                    }}
                    style={{
                      flex: 1,
                      padding: "13px",
                      background: "#6366f1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Form step 2 — schedule + alert */}
            {formStep === 2 && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={label}>Alert email</label>
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={input}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={label}>Check frequency</label>
                  <select
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    style={input}
                  >
                    {intervalOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "16px",
                    marginBottom: 20,
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
                    Monitor summary
                  </div>
                  {[
                    { l: "Name", v: name },
                    {
                      l: "Source",
                      v:
                        sourceType === "google_sheet"
                          ? "Google Sheet"
                          : sourceValue,
                    },
                    { l: "Date column", v: dateColumn },
                    { l: "Sensitivity", v: sensitivity },
                    {
                      l: "Frequency",
                      v: intervalOptions.find((o) => o.value === intervalHours)
                        ?.label,
                    },
                    { l: "Alert to", v: alertEmail },
                  ].map((r) => (
                    <div
                      key={r.l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        padding: "4px 0",
                        borderBottom: "1px solid #f1f5f9",
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
                  <div
                    style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}
                  >
                    ⚠️ {error}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setFormStep(1)}
                    style={{
                      padding: "13px 20px",
                      background: "#f8fafc",
                      color: "#64748b",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    style={{
                      flex: 1,
                      padding: "13px",
                      background: creating ? "#a5b4fc" : "#6366f1",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: creating ? "not-allowed" : "pointer",
                    }}
                  >
                    {creating ? "⏳ Creating..." : "🚀 Start Monitoring"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monitors list */}
        {monitors.length === 0 && !showForm && (
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1.5px dashed #e2e8f0",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#1e293b",
                marginBottom: 6,
              }}
            >
              No monitors yet
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Create a monitor and DriftWatch watches your data automatically.
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: "10px 24px",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Create your first monitor
            </button>
          </div>
        )}

        {monitors.map((m) => (
          <div
            key={m.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              padding: "18px 20px",
              marginBottom: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
                  >
                    {m.name}
                  </div>
                  <span
                    style={{
                      background: m.status === "active" ? "#f0fdf4" : "#f8fafc",
                      color: m.status === "active" ? "#15803d" : "#64748b",
                      border: `1px solid ${m.status === "active" ? "#86efac" : "#e2e8f0"}`,
                      borderRadius: 999,
                      padding: "2px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {m.status === "active" ? "● Active" : "⏸ Paused"}
                  </span>
                  {m.last_status && (
                    <span
                      style={{
                        background:
                          m.last_status === "CRITICAL"
                            ? "#fef2f2"
                            : m.last_status === "WARNING"
                              ? "#fffbeb"
                              : "#f0fdf4",
                        color:
                          m.last_status === "CRITICAL"
                            ? "#ef4444"
                            : m.last_status === "WARNING"
                              ? "#f59e0b"
                              : "#22c55e",
                        borderRadius: 999,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Last: {m.last_status}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px 16px",
                  }}
                >
                  {[
                    {
                      l: "Source",
                      v:
                        m.source_type === "google_sheet"
                          ? "Google Sheet"
                          : m.source_value,
                    },
                    {
                      l: "Frequency",
                      v:
                        intervalOptions.find(
                          (o) => o.value === m.interval_hours,
                        )?.label || `Every ${m.interval_hours}h`,
                    },
                    { l: "Alert to", v: m.alert_email },
                    {
                      l: "Last run",
                      v: m.last_run
                        ? new Date(m.last_run).toLocaleString()
                        : "Never",
                    },
                    {
                      l: "Runs",
                      v: `${m.total_runs} runs · ${m.total_alerts} alerts`,
                    },
                  ].map((r) => (
                    <div key={r.l} style={{ fontSize: 12 }}>
                      <span style={{ color: "#94a3b8" }}>{r.l}: </span>
                      <span style={{ color: "#475569", fontWeight: 500 }}>
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => handleRunNow(m.id, m.name)}
                  disabled={runningId === m.id}
                  style={{
                    padding: "7px 14px",
                    background: runningId === m.id ? "#a5b4fc" : "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: runningId === m.id ? "not-allowed" : "pointer",
                  }}
                >
                  {runningId === m.id ? "⏳..." : "▶ Run Now"}
                </button>
                {m.status === "active" ? (
                  <button
                    onClick={async () => {
                      await axios.post(`${API}/monitors/${m.id}/pause`);
                      load();
                    }}
                    style={{
                      padding: "7px 14px",
                      background: "#fff",
                      color: "#64748b",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ⏸ Pause
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await axios.post(`${API}/monitors/${m.id}/resume`);
                      load();
                    }}
                    style={{
                      padding: "7px 14px",
                      background: "#fff",
                      color: "#22c55e",
                      border: "1.5px solid #86efac",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ▶ Resume
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!window.confirm(`Delete "${m.name}"?`)) return;
                    await axios.delete(`${API}/monitors/${m.id}`);
                    load();
                  }}
                  style={{
                    padding: "7px 14px",
                    background: "#fff",
                    color: "#ef4444",
                    border: "1.5px solid #fca5a5",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MonitorsPage;
