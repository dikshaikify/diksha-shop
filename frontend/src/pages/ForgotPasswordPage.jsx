import { useState } from "react";
import { forgotPassword, resetPassword } from "../api";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

export default function ForgotPasswordPage({ onShowLogin }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [devToken, setDevToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setDevToken(res.devToken || "");
      setInfo(res.message || "Check your inbox");
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await resetPassword(devToken, newPassword);
      setInfo("Password reset successfully.");
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="amz-auth">
      <div className="amz-logo-big">🛍️ Diksha Shop</div>
      <div className="amz-card">
        {step === 1 && (
          <>
            <h2>Password assistance</h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 16px" }}>Enter your email to receive a password reset link.</p>
            <form onSubmit={sendEmail}>
              {error && <div className="amz-error">{error}</div>}
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit" disabled={loading}>{loading ? "Sending…" : "Continue"}</button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Set a new password</h2>
            {info && <div className="amz-info">{info}</div>}
            {devToken && <div className="amz-dev"><strong>Dev token:</strong> <code>{devToken}</code></div>}
            <form onSubmit={submitReset}>
              {error && <div className="amz-error">{error}</div>}
              <label>New Password</label>
              <PasswordInput value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
              <PasswordStrengthMeter password={newPassword} />
              <label>Confirm New Password</label>
              <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" />
              <button type="submit" disabled={loading}>{loading ? "Resetting…" : "Reset Password"}</button>
            </form>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Password reset</h2>
            <div className="amz-info">You can now sign in with your new password.</div>
            <button type="button" onClick={onShowLogin}>Back to sign in</button>
          </>
        )}
      </div>
      <button className="amz-create" onClick={onShowLogin}>Back to sign in</button>
    </div>
  );
}
