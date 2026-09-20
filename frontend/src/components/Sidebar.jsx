import StarRating from "./StarRating";

const PRICE_RANGES = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 to $100", min: 50, max: 100 },
  { label: "$100 to $150", min: 100, max: 150 },
  { label: "$150 & Above", min: 150, max: null }
];

export default function Sidebar({
  categories,
  selected,
  onToggle,
  onClear,
  priceRange,
  onPriceChange,
  minRating,
  onMinRatingChange
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-block">
        <h4>Department</h4>
        <ul className="sidebar-list">
          <li>
            <button
              className={"sidebar-link" + (selected.length === 0 ? " active" : "")}
              onClick={onClear}
            >
              All Departments
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={"sidebar-link" + (selected.includes(cat) ? " active" : "")}
                onClick={() => onToggle(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-block">
        <h4>Price</h4>
        <ul className="sidebar-list">
          {PRICE_RANGES.map((r) => {
            const isActive =
              priceRange &&
              priceRange.min === r.min &&
              priceRange.max === r.max;
            return (
              <li key={r.label}>
                <button
                  className={"sidebar-link" + (isActive ? " active" : "")}
                  onClick={() => onPriceChange(isActive ? null : r)}
                >
                  {r.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-block">
        <h4>Customer Review</h4>
        <ul className="sidebar-list">
          {[4, 3, 2].map((r) => (
            <li key={r}>
              <button
                className={"sidebar-link" + (minRating === r ? " active" : "")}
                onClick={() => onMinRatingChange(minRating === r ? null : r)}
              >
                <StarRating value={r} /> & Up
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-block sidebar-reset-block">
        <button
          className="sidebar-reset"
          onClick={() => {
            onClear();
            onPriceChange(null);
            onMinRatingChange(null);
          }}
        >
          Reset filters
        </button>
      </div>
    </aside>
  );
}