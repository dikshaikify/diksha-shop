export default function StarRating({ value = 0, size = 14 }) {
  const stars = [1,2,3,4,5];
  return (
    <span className="stars" style={{ fontSize: size }}>
      {stars.map(n => {
        const filled = value >= n - 0.25;
        const half = !filled && value >= n - 0.75;
        return <span key={n} className={filled ? "star on" : half ? "star half" : "star off"}>★</span>;
      })}
    </span>
  );
}
