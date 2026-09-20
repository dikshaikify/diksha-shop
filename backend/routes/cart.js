import { Router } from "express";
import { requireAuth } from "./auth.js";
import { db } from "../db.js";
import { products } from "../data.js";
import { BadRequest, NotFound } from "../errors.js";

const router = Router();

function getOrCreateCart(userId) {
  let cart = db.prepare("SELECT * FROM carts WHERE user_id = ?").get(userId);
  if (!cart) {
    const info = db.prepare("INSERT INTO carts (user_id) VALUES (?)").run(userId);
    cart = { id: info.lastInsertRowid, user_id: userId };
  }
  return cart;
}

function hydrateCart(cartId) {
  const rows = db.prepare("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY added_at DESC").all(cartId);
  const items = rows.map(r => {
    const p = products.find(x => x.id === r.product_id);
    if (!p) return null;
    return {
      itemId: r.id,
      id: p.id,
      title: p.title,
      image: p.image,
      price: p.price,
      category: p.category,
      stock: p.stock,
      qty: r.qty,
      subtotal: +(p.price * r.qty).toFixed(2)
    };
  }).filter(Boolean);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = +items.reduce((s, i) => s + i.subtotal, 0).toFixed(2);
  return { items, totalQty, subtotal };
}

router.get("/cart", requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user.uid);
  res.json(hydrateCart(cart.id));
});

router.post("/cart", requireAuth, (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  if (!productId) throw BadRequest("productId required");
  const product = products.find(p => p.id === Number(productId));
  if (!product) throw NotFound("Product not found");
  if (qty < 1) throw BadRequest("Quantity must be at least 1");

  const cart = getOrCreateCart(req.user.uid);
  const existing = db.prepare("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?").get(cart.id, product.id);

  const newQty = (existing?.qty || 0) + Number(qty);
  if (newQty > product.stock) throw BadRequest("Only " + product.stock + " in stock");

  if (existing) {
    db.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").run(newQty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)").run(cart.id, product.id, Number(qty));
  }
  db.prepare("UPDATE carts SET updated_at = datetime('now') WHERE id = ?").run(cart.id);
  res.json(hydrateCart(cart.id));
});

router.put("/cart/:itemId", requireAuth, (req, res) => {
  const { qty } = req.body || {};
  if (qty < 1) throw BadRequest("Quantity must be at least 1");
  const cart = getOrCreateCart(req.user.uid);
  const item = db.prepare("SELECT * FROM cart_items WHERE id = ? AND cart_id = ?").get(req.params.itemId, cart.id);
  if (!item) throw NotFound("Cart item not found");
  const product = products.find(p => p.id === item.product_id);
  if (qty > product.stock) throw BadRequest("Only " + product.stock + " in stock");
  db.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").run(Number(qty), item.id);
  res.json(hydrateCart(cart.id));
});

router.delete("/cart/:itemId", requireAuth, (req, res) => {
  const cart = getOrCreateCart(req.user.uid);
  db.prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?").run(req.params.itemId, cart.id);
  res.json(hydrateCart(cart.id));
});

router.post("/cart/merge", requireAuth, (req, res) => {
  const { items = [] } = req.body || {};
  const cart = getOrCreateCart(req.user.uid);
  for (const it of items) {
    const product = products.find(p => p.id === Number(it.id));
    if (!product) continue;
    const existing = db.prepare("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?").get(cart.id, product.id);
    const combined = Math.min(product.stock, (existing?.qty || 0) + Number(it.qty || 1));
    if (existing) {
      db.prepare("UPDATE cart_items SET qty = ? WHERE id = ?").run(combined, existing.id);
    } else {
      db.prepare("INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)").run(cart.id, product.id, combined);
    }
  }
  res.json(hydrateCart(cart.id));
});

export default router;
