export default function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-wrap">
      <label>Sort by:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="relevance">Featured</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Customer Rating</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}