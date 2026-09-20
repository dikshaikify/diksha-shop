import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { fetchAddresses, createAddress, deleteAddress, setDefaultAddress } from "../api";

const EMPTY = { fullName: "", phone: "", line1: "", city: "", state: "", pincode: "", country: "India" };

export default function ProfilePage({ onBack }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("info");
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");

  useEffect(() => { if (tab === "addresses") load(); }, [tab]);
  async function load() { try { const r = await fetchAddresses(); setAddresses(r.addresses); } catch {} }

  async function save(e) {
    e.preventDefault(); setErr("");
    if (!form.fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) { setErr("All fields required"); return; }
    try { await createAddress(form); setForm(EMPTY); load(); }
    catch (e) { setErr(e.message); }
  }

  return (
    <div className="profile-wrap">
      <button className="back-btn" onClick={onBack}>← Back to home</button>
      <h1>My Account</h1>
      <div className="profile-tabs">
        {[["info","Personal Info"],["addresses","Saved Addresses"],["security","Security"]].map(([k,l]) => (
          <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "info" && (
        <div className="profile-card">
          <div className="profile-avatar">{(user?.name || "?")[0].toUpperCase()}</div>
          <div>
            <h2>{user?.name}</h2>
            <p>📧 {user?.email}</p>
            <p>📞 {user?.phone || "Not set"}</p>
          </div>
        </div>
      )}
      {tab === "addresses" && (
        <>
          <div className="profile-card">
            <h3>Add new address</h3>
            <form onSubmit={save} className="addr-form">
              {err && <div className="amz-error">{err}</div>}
              {[["fullName","Full Name"],["phone","Phone"],["line1","Address"],["city","City"],["state","State"],["pincode","PIN Code"],["country","Country"]].map(([k,l]) => (
                <label key={k}>{l}<input value={form[k]} onChange={(e) => setForm(f => ({ ...f, [k]: e.target.value }))} /></label>
              ))}
              <button type="submit" className="buy-add">Save Address</button>
            </form>
          </div>
          <div className="profile-card">
            <h3>Your addresses</h3>
            {addresses.length === 0
              ? <p style={{ color: "#94a3b8" }}>No addresses saved.</p>
              : addresses.map(a => (
                  <div key={a.id} className="addr-row">
                    <div>
                      <strong>{a.full_name}</strong> {a.is_default ? "⭐ Default" : ""}
                      <div>{a.line1}, {a.city}, {a.state} — {a.pincode}</div>
                      <div>📞 {a.phone}</div>
                    </div>
                    <div className="addr-actions">
                      {!a.is_default && <button onClick={() => setDefaultAddress(a.id).then(load)}>Set default</button>}
                      <button className="danger" onClick={() => deleteAddress(a.id).then(load)}>Delete</button>
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}
      {tab === "security" && (
        <div className="profile-card">
          <h3>Security</h3>
          <p style={{ color: "#94a3b8" }}>Sessions auto-refresh. Password reset available from the sign-in page.</p>
        </div>
      )}
    </div>
  );
}
