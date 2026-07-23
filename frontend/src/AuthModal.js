import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// AuthModal — shown on top of the landing page when a signed-out
// person tries to start monitoring, or clicks Log in / Sign up directly.
// initialMode lets the caller open it pre-set to "login" or "signup".

const FONT_SANS = "'Source Sans 3',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const FONT_MONO = "'JetBrains Mono',ui-monospace,'SF Mono',Menlo,monospace";
const FONT_DISPLAY = "'Fraunces',Georgia,serif";

const COLOR = {
  paper: "#F6F3EC",
  card: "#FCFBF8",
  ink: "#15181D",
  inkSoft: "#2B2E33",
  body: "#4B4C46",
  bodyDim: "#83817A",
  bodyFaint: "#6E6A62",
  line: "#DDD7C7",
  brick: "#B5402F",
  brickDim: "#8F3225",
  brickTint: "#F4E3DE",
  pine: "#33604A",
  pineTint: "#E1EBE2",
};

export default function AuthModal({ onClose, onSuccess, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setMessage("");
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: `1px solid ${COLOR.line}`,
    borderRadius: 3,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: COLOR.paper,
    color: COLOR.ink,
    fontFamily: FONT_SANS,
    marginBottom: 12,
  };

  // ── Email + password ──
  const handleEmailAuth = async () => {
    if (!email || !password) return setError("Please fill in both fields.");
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          // auto-confirmed
          onSuccess(data.session);
        } else {
          // email confirmation required
          setMessage("Check your email to confirm your account, then log in.");
          switchMode("login");
        }
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ──
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // on success, this redirects to Google and back with a session
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Log in" : "Sign up"}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(21,24,29,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLOR.card,
          border: `1px solid ${COLOR.line}`,
          borderTop: `3px solid ${COLOR.brick}`,
          borderRadius: 4,
          padding: "34px 30px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 48px rgba(21,24,29,.22)",
          animation: "dw-auth-slide-up 0.18s cubic-bezier(.16,1,.3,1)",
          fontFamily: FONT_SANS,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                color: COLOR.brick,
                marginBottom: 8,
              }}
            >
              {mode === "login" ? "welcome back" : "get started"}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 21, color: COLOR.ink }}>
              {mode === "login" ? "Log in to DriftWatch" : "Create your account"}
            </div>
            <div style={{ fontSize: 13, color: COLOR.bodyDim, marginTop: 5 }}>
              {mode === "login" ? "See your monitors and past scans." : "Free to start. No credit card needed."}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: `1px solid ${COLOR.line}`,
              borderRadius: 3,
              cursor: "pointer",
              color: COLOR.bodyDim,
              fontSize: 15,
              width: 28,
              height: 28,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Why an account is needed */}
        <div
          style={{
            background: COLOR.paper,
            borderLeft: `2px solid ${COLOR.brick}`,
            padding: "10px 13px",
            marginBottom: 18,
            fontSize: 12.5,
            color: COLOR.inkSoft,
            lineHeight: 1.55,
          }}
        >
          An account is what lets DriftWatch check your sources on a schedule and email you — and keeps your data visible only to you.
        </div>

        {/* Error / success */}
        {error && (
          <div
            style={{
              background: COLOR.brickTint,
              borderLeft: `2px solid ${COLOR.brick}`,
              padding: "9px 13px",
              fontSize: 13,
              color: COLOR.brickDim,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              background: COLOR.pineTint,
              borderLeft: `2px solid ${COLOR.pine}`,
              padding: "9px 13px",
              fontSize: 13,
              color: COLOR.pine,
              marginBottom: 14,
            }}
          >
            {message}
          </div>
        )}

        {/* Google sign-in */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px",
            background: COLOR.card,
            color: COLOR.ink,
            border: `1px solid ${COLOR.line}`,
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
            fontFamily: FONT_SANS,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7H6.2C9.5 39.6 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.3 5.2C41.3 35.7 44 30.2 44 24c0-1.3-.1-2.7-.4-4z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: COLOR.line }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLOR.bodyFaint }}>or use email</span>
          <div style={{ flex: 1, height: 1, background: COLOR.line }} />
        </div>

        {/* Email + password */}
        <input
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          style={inputStyle}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        {/* Submit */}
        <button
          onClick={handleEmailAuth}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? COLOR.bodyFaint : COLOR.ink,
            color: COLOR.paper,
            border: "none",
            borderRadius: 3,
            fontSize: 14.5,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 16,
            fontFamily: FONT_SANS,
            transition: "background .15s ease",
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>

        {/* Switch mode */}
        <div style={{ textAlign: "center", fontSize: 13, color: COLOR.bodyDim }}>
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => switchMode("signup")}
                style={{ color: COLOR.brick, fontWeight: 700, cursor: "pointer" }}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => switchMode("login")}
                style={{ color: COLOR.brick, fontWeight: 700, cursor: "pointer" }}
              >
                Log in
              </span>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dw-auth-slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[role="dialog"] > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}