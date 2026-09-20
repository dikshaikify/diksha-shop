export default function FilterChips({
  search, onClearSearch,
  categories, onRemoveCategory,
  priceRange, onClearPrice,
  minRating, onClearRating,
  onClearAll
}) {
  const hasAny =
    search ||
    categories.length > 0 ||
    priceRange ||
    minRating != null;

  if (!hasAny) return null;

  return (
    <div className="filter-chips">
      <span className="chips-label">Active filters:</span>

      {search && (
        <button className="chip" onClick={onClearSearch}>
          "{search}" <span className="x">✕</span>
        </button>
      )}

      {categories.map((cat) => (
        <button key={cat} className="chip" onClick={() => onRemoveCategory(cat)}>
          {cat} <span className="x">✕</span>
        </button>
      ))}

      {priceRange && (
        <button className="chip" onClick={onClearPrice}>
          {priceRange.label} <span className="x">✕</span>
        </button>
      )}

      {minRating != null && (
        <button className="chip" onClick={onClearRating}>
          {minRating}★ & Up <span className="x">✕</span>
        </button>
      )}

      <button className="chip clear-all" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}
