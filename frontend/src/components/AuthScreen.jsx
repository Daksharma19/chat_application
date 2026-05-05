import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="appShell">
      <div className="authWrap">
        <div className="authHeader">
          <div className="brand">Chat</div>
          <div className="subtle">
            Sign in to start messaging.{" "}
            <span className="kbd" title="Tip">
              Enter
            </span>{" "}
            submits forms.
          </div>
        </div>

        <div className="card cardPad stack" style={{ gap: 14 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="segmented" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={`btn ${mode === "login" ? "btnActive" : ""}`}
                onClick={() => setMode("login")}
                aria-selected={mode === "login"}
                role="tab"
              >
                Login
              </button>
              <button
                type="button"
                className={`btn ${mode === "signup" ? "btnActive" : ""}`}
                onClick={() => setMode("signup")}
                aria-selected={mode === "signup"}
                role="tab"
              >
                Sign up
              </button>
            </div>
            <span className="badge" aria-live="polite">
              <span className={`dot ${busy ? "" : "dotOk"}`} />
              {busy ? "Working…" : "Ready"}
            </span>
          </div>

          <form onSubmit={onSubmit} className="stack" style={{ gap: 12 }}>
            {mode === "signup" && (
              <label className="label">
                Display name (optional)
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="nickname"
                  placeholder="e.g. Daksh"
                />
              </label>
            )}

            <label className="label">
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <label className="label">
              Password
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Minimum 6 characters"
              />
            </label>

            {error && (
              <div className="alert" role="alert">
                {error}
              </div>
            )}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button type="submit" className="btn btnPrimary" disabled={busy}>
                {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </div>
          </form>
        </div>

        <div className="subtle" style={{ marginTop: 12, fontSize: 12 }}>
          Having trouble connecting? Verify <span className="kbd">VITE_API_URL</span> and{" "}
          <span className="kbd">VITE_SOCKET_URL</span> in your frontend <span className="kbd">.env</span>.
        </div>
      </div>
    </div>
  );
}
