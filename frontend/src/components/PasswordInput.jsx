import { useState } from "react";
export default function PasswordInput({ value, onChange, placeholder = "Password", autoComplete = "current-password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pwd-wrap">
      <input type={show ? "text" : "password"} value={value} placeholder={placeholder} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="pwd-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}
