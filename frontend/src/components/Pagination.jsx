export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) pages.push(1, "...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) pages.push("...", totalPages);
  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>Prev</button>
      {pages.map((p, i) => p === "..." ? <span key={"e"+i} className="ellipsis">...</span>
        : <button key={p} className={p === page ? "active" : ""} onClick={() => onChange(p)}>{p}</button>)}
      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}
