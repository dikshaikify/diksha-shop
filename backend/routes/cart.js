import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getDB } from "../db.js";
import { products } from "../data.js";
import { BadRequest, NotFound } from "../errors.js";
import { ObjectId } from "mongodb";

const router = Router();

async function getOrCreateCart(userId) {
  const { carts } = getDB();
  let cart = await carts.findOne({ userId });
  if (!cart) {
    const doc = { userId, updatedAt: new Date() };
    const result = await carts.insertOne(doc);
    cart = { ...doc, _id: result.insertedId };
  }
  return cart;
}

async function hydrateCart(cartId) {
  const { cartItems } = getDB();
  const rows = await cartItems.find({ cartId }).sort({ addedAt: -1 }).toArray();
  const items = rows.map(r => {
    const p = products.find(x => x.id === r.productId);
    if (!p) return null;
    return {
      itemId: r._id.toString(),
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

router.get("/cart", requireAuth, async (req, res) => {
  const cart = await getOrCreateCart(req.user.uid);
  res.json(await hydrateCart(cart._id));
});

router.post("/cart", requireAuth, async (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  if (!productId) throw BadRequest("productId required");
  const product = products.find(p => p.id === Number(productId));
  if (!product) throw NotFound("Product not found");
  if (qty < 1) throw BadRequest("Quantity must be at least 1");

  const { cartItems, carts } = getDB();
  const cart = await getOrCreateCart(req.user.uid);
  const existing = await cartItems.findOne({ cartId: cart._id, productId: product.id });

  const newQty = (existing?.qty || 0) + Number(qty);
  if (newQty > product.stock) throw BadRequest("Only " + product.stock + " in stock");

  if (existing) {
    await cartItems.updateOne({ _id: existing._id }, { $set: { qty: newQty } });
  } else {
    await cartItems.insertOne({ cartId: cart._id, productId: product.id, qty: Number(qty), addedAt: new Date() });
  }
  await carts.updateOne({ _id: cart._id }, { $set: { updatedAt: new Date() } });
  res.json(await hydrateCart(cart._id));
});

router.put("/cart/:itemId", requireAuth, async (req, res) => {
  const { qty } = req.body || {};
  if (qty < 1) throw BadRequest("Quantity must be at least 1");
  const { cartItems } = getDB();
  const cart = await getOrCreateCart(req.user.uid);
  let item;
  try { item = await cartItems.findOne({ _id: new ObjectId(req.params.itemId), cartId: cart._id }); }
  catch { throw NotFound("Cart item not found"); }
  if (!item) throw NotFound("Cart item not found");
  const product = products.find(p => p.id === item.productId);
  if (qty > product.stock) throw BadRequest("Only " + product.stock + " in stock");
  await cartItems.updateOne({ _id: item._id }, { $set: { qty: Number(qty) } });
  res.json(await hydrateCart(cart._id));
});

router.delete("/cart/:itemId", requireAuth, async (req, res) => {
  const { cartItems } = getDB();
  const cart = await getOrCreateCart(req.user.uid);
  try { await cartItems.deleteOne({ _id: new ObjectId(req.params.itemId), cartId: cart._id }); } catch {}
  res.json(await hydrateCart(cart._id));
});

router.post("/cart/merge", requireAuth, async (req, res) => {
  const { items = [] } = req.body || {};
  const { cartItems } = getDB();
  const cart = await getOrCreateCart(req.user.uid);
  for (const it of items) {
    const product = products.find(p => p.id === Number(it.id));
    if (!product) continue;
    const existing = await cartItems.findOne({ cartId: cart._id, productId: product.id });
    const combined = Math.min(product.stock, (existing?.qty || 0) + Number(it.qty || 1));
    if (existing) {
      await cartItems.updateOne({ _id: existing._id }, { $set: { qty: combined } });
    } else {
      await cartItems.insertOne({ cartId: cart._id, productId: product.id, qty: combined, addedAt: new Date() });
    }
  }
  res.json(await hydrateCart(cart._id));
});

export default router;