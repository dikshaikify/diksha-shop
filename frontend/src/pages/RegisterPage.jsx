import { useState } from "react";
import { useAuth } from "../AuthContext";
import PasswordInput from "../components/PasswordInput";
import PasswordStrengthMeter, { scorePassword } from "../components/PasswordStrengthMeter";

export default function RegisterPage({ onShowLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.name.length < 2) { setError("Please enter your full name"); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) { setError("Please enter a valid email address"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (scorePassword(form.password) < 2) { setError("Password is too weak"); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!agree) { setError("Please agree to the Terms & Conditions"); return; }
    setLoading(true);
    try { await register({ name: form.name, email: form.email, phone: form.phone, password: form.password }); }
    catch (err) { setError(err.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="amz-auth">
      <div className="amz-logo-big">🛍️ Diksha Shop</div>
      <div className="amz-card">
        <h2>Create account</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="amz-error">{error}</div>}
          <label>Full Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          <label>Phone (optional)</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          <label>Password</label>
          <PasswordInput value={form.password} onChange={(v) => set("password", v)} autoComplete="new-password" />
          <PasswordStrengthMeter password={form.password} />
          <label>Confirm Password</label>
          <PasswordInput value={form.confirm} onChange={(v) => set("confirm", v)} autoComplete="new-password" />
          <label className="amz-checkbox">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to the Terms & Conditions</span>
          </label>
          <button type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Account"}</button>
        </form>
      </div>
      <div className="amz-new"><span>Already have an account?</span></div>
      <button className="amz-create" onClick={onShowLogin}>Sign in</button>
    </div>
  );
}
