import { useState } from "react";
import { useAuth } from "../AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage({ onShowRegister, onShowForgot }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amz-auth">
      <div className="amz-logo-big">🛍️ Diksha Shop</div>

      <div className="amz-card">
        <h2>Sign in</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="amz-error">{error}</div>}

          <label>Email or mobile phone number</label>
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <PasswordInput value={password} onChange={setPassword} />

          <div className="amz-row">
            <label className="amz-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="amz-link"
              onClick={onShowForgot}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button type="button" className="amz-google">
          <span>🌐</span> Continue with Google
        </button>

        <p className="amz-terms">
          By continuing, you agree to Diksha Shop's Conditions of Use and Privacy Notice.
        </p>
      </div>

      <div className="amz-new">
        <span>New to Diksha Shop?</span>
      </div>

      <button className="amz-create" onClick={onShowRegister}>
        Create your Diksha Shop account
      </button>

      <div className="amz-demo">
        Demo: <code>demo@example.com</code> / <code>demo1234</code>
      </div>
    </div>
  );
}