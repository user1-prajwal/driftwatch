import { useState } from "react"
import { supabase } from "./supabaseClient"

// AuthModal — shows on top of landing page
// when user clicks "Auto Monitor" without login

export default function AuthModal({ onClose, onSuccess }) {
  const [mode,     setMode]     = useState("login")  // "login" or "signup"
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [message,  setMessage]  = useState("")

  const input = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: 10,
    fontSize: 14, outline: "none",
    boxSizing: "border-box", background: "#fff",
    color: "#1e293b", marginBottom: 12,
  }

  // ── Email + Password login ──
  const handleEmailAuth = async () => {
    if (!email || !password) return setError("Please fill all fields.")
    setLoading(true); setError(""); setMessage("")

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onSuccess(data.session)

      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        if (data.session) {
          // auto confirmed
          onSuccess(data.session)
        } else {
          // email confirmation required
          setMessage("✅ Check your email to confirm your account, then log in.")
          setMode("login")
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth login ──
  const handleGoogleLogin = async () => {
    setLoading(true); setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin   // comes back to your app
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // if success, Supabase redirects to Google
    // then back to your app with session
  }

  return (
    // ── Backdrop ──
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      {/* ── Modal box ── */}
      <div
        onClick={e => e.stopPropagation()}  // don't close when clicking inside
        style={{
          background: "#fff", borderRadius: 20,
          padding: "36px 32px", width: "100%", maxWidth: 420,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, marginBottom: 4 }}>🌊</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#1e293b" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {mode === "login"
                ? "Log in to manage your auto monitors"
                : "Sign up to start auto monitoring"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, padding: 4 }}
          >✕</button>
        </div>

        {/* Why login info box */}
        <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#4f46e5" }}>
          🔒 Auto monitors require an account so your data stays private and secure.
        </div>

        {/* Error / success messages */}
        {error   && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 14 }}>⚠️ {error}</div>}
        {message && <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#15803d", marginBottom: 14 }}>{message}</div>}

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            background: "#fff", color: "#1e293b",
            border: "1.5px solid #e2e8f0", borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 16, transition: "all 0.2s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7H6.2C9.5 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C41.3 35.7 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontSize: 12, color: "#94a3b8" }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        {/* Email + password */}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={input}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="password"
          onKeyDown={e => e.key === "Enter" && handleEmailAuth()}
          style={{ ...input, marginBottom: 20 }}
        />

        {/* Submit button */}
        <button
          onClick={handleEmailAuth}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            background: loading ? "#a5b4fc" : "#6366f1",
            color: "#fff", border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 16,
          }}
        >
          {loading ? "⏳ Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        {/* Switch mode */}
        <div style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
          {mode === "login" ? (
            <>Don't have an account? <span onClick={() => { setMode("signup"); setError(""); setMessage(""); }} style={{ color: "#6366f1", fontWeight: 700, cursor: "pointer" }}>Sign up</span></>
          ) : (
            <>Already have an account? <span onClick={() => { setMode("login"); setError(""); setMessage(""); }} style={{ color: "#6366f1", fontWeight: 700, cursor: "pointer" }}>Log in</span></>
          )}
        </div>
      </div>

      {/* Slide up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}