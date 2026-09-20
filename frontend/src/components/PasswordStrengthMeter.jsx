export function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
export default function PasswordStrengthMeter({ password }) {
  const score = scorePassword(password);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  if (!password) return null;
  return (
    <div className="pwd-meter">
      <div className="pwd-bars">
        {[0,1,2,3].map(i => <div key={i} className="pwd-bar" style={{ background: i < score ? colors[score] : "#334155" }} />)}
      </div>
      <div className="pwd-label" style={{ color: colors[score] }}>{labels[score]}</div>
    </div>
  );
}
