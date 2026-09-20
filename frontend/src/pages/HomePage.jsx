import { useEffect, useRef } from "react";
import { useInfiniteProducts, useCategories } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import SortDropdown from "../components/SortDropdown";
import FilterChips from "../components/FilterChips";

const PAGE_SIZE = 12;

export default function HomePage({
  search,
  selected,
  setSelected,
  sort,
  setSort,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onSelectProduct
}) {
  const debounced = useDebounce(search, 400);
  const { data: categories = [] } = useCategories();

  const query = useInfiniteProducts({
    search: debounced,
    categories: selected,
    sort,
    minPrice: priceRange?.min ?? null,
    maxPrice: priceRange?.max ?? null,
    minRating: minRating ?? null
  });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const sentinel = useRef(null);
  useEffect(() => {
    if (!query.hasNextPage) return;
    const el = sentinel.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { rootMargin: "400px" }
    );
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query]);

  const toggleCategory = (cat) =>
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const clearAll = () => {
    setSelected([]);
    setPriceRange(null);
    setMinRating(null);
  };

  return (
    <div className="home-layout">
      <Sidebar
        categories={categories}
        selected={selected}
        onToggle={toggleCategory}
        onClear={() => setSelected([])}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        minRating={minRating}
        onMinRatingChange={setMinRating}
      />

      <main className="home-main">
        <div className="results-bar">
          <div className="results-count">
            {query.isLoading
              ? "Loading..."
              : `${total} result${total === 1 ? "" : "s"}${
                  debounced ? ` for "${debounced}"` : ""
                }`}
          </div>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <FilterChips
          search={debounced}
          onClearSearch={() => {
            /* Handled in App via setSearch — not exposed here */
          }}
          categories={selected}
          onRemoveCategory={toggleCategory}
          priceRange={priceRange}
          onClearPrice={() => setPriceRange(null)}
          minRating={minRating}
          onClearRating={() => setMinRating(null)}
          onClearAll={clearAll}
        />

        {query.isError && <div className="error">⚠️ {query.error.message}</div>}

        {query.isLoading ? (
          <div className="p-grid">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="p-skeleton">
                <div className="p-skel-img" />
                <div className="p-skel-line" />
                <div className="p-skel-line short" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="buy-add" onClick={clearAll} style={{ marginTop: 16, maxWidth: 200 }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="p-grid">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} onClick={onSelectProduct} />
              ))}
            </div>
            <div ref={sentinel} style={{ height: 40 }} />
            {query.isFetchingNextPage && <div className="load-more">Loading more…</div>}
            {!query.hasNextPage && items.length > 0 && (
              <div className="load-more muted">— End of results —</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}