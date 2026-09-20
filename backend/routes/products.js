import { Router } from "express";
import { products, categories } from "../data.js";
import { ProductsQuerySchema, validate } from "../validators.js";
import { requireAuth } from "./auth.js";
import { NotFound } from "../errors.js";

const router = Router();

const decodeCursor = (cursor) => {
  if (!cursor) return 0;
  try { return Number(Buffer.from(cursor, "base64").toString().split(":")[1]); }
  catch { return 0; }
};
const encodeCursor = (id) => Buffer.from("id:" + id).toString("base64");

function score(product, term) {
  if (!term) return 0;
  const t = product.title.toLowerCase();
  const d = product.description.toLowerCase();
  const c = product.category.toLowerCase();
  let s = 0;
  if (t.startsWith(term)) s += 100;
  if (t.includes(term)) s += 50;
  if (c.includes(term)) s += 30;
  if (d.includes(term)) s += 10;
  return s;
}

router.get("/categories", requireAuth, (_req, res) => {
  const counts = {};
  for (const c of categories) counts[c] = products.filter(p => p.category === c).length;
  res.json({ categories, counts });
});

router.get("/products", requireAuth, (req, res) => {
  const q = validate(ProductsQuerySchema, req.query);
  const searchTerm = q.search.toLowerCase();
  const catList = q.category.split(",").map(s => s.trim()).filter(Boolean);

  let filtered = products.filter(p => {
    const okCat = catList.length === 0 || catList.includes(p.category);
    if (!okCat) return false;
    if (q.minPrice != null && p.price < q.minPrice) return false;
    if (q.maxPrice != null && p.price > q.maxPrice) return false;
    if (q.minRating != null && p.rating < q.minRating) return false;
    if (!searchTerm) return true;
    const t = p.title.toLowerCase();
    const d = p.description.toLowerCase();
    const c = p.category.toLowerCase();
    return t.includes(searchTerm) || d.includes(searchTerm) || c.includes(searchTerm);
  });

  if (searchTerm) {
    filtered = filtered.map(p => ({ ...p, _score: score(p, searchTerm) }))
      .sort((a, b) => b._score - a._score || a.id - b.id);
  } else {
    switch (q.sort) {
      case "price_asc":  filtered.sort((a, b) => a.price - b.price); break;
      case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
      case "rating":     filtered.sort((a, b) => b.rating - a.rating); break;
      case "newest":     filtered.sort((a, b) => b.id - a.id); break;
      default:           filtered.sort((a, b) => a.id - b.id);
    }
  }

  const total = filtered.length;
  const afterId = decodeCursor(q.cursor);
  if (afterId) {
    const idx = filtered.findIndex(p => p.id === afterId);
    filtered = idx >= 0 ? filtered.slice(idx + 1) : filtered;
  }

  const items = filtered.slice(0, q.limit).map(({ _score, ...rest }) => rest);
  const nextCursor = items.length === q.limit && filtered.length > q.limit
    ? encodeCursor(items[items.length - 1].id)
    : null;

  res.json({ items, nextCursor, total,
    pageInfo: { limit: q.limit, hasMore: nextCursor !== null, returned: items.length } });
});

router.get("/products/:id", requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) throw NotFound("Product not found");
  res.json({ product });
});

export default router;
