export default function QuantitySelect({ value, onChange, max = 10 }) {
  return (
    <select className="qty-select" value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: max }, (_, i) => i + 1).map(n => <option key={n} value={n}>Qty: {n}</option>)}
    </select>
  );
}
