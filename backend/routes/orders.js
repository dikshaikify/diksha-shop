import { Router } from "express";
import { requireAuth } from "./auth.js";
import { db } from "../db.js";
import { products } from "../data.js";
import { BadRequest, NotFound } from "../errors.js";

const router = Router();

function generateOrderNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return "ORD-" + ymd + "-" + seq;
}

function calculateEstDelivery(method) {
  const days = method === "express" ? 2 : 5;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

router.post("/", requireAuth, (req, res) => {
  const { addressId, paymentMethod, deliveryMethod = "standard", items } = req.body || {};
  if (!addressId) throw BadRequest("addressId required");
  if (!paymentMethod) throw BadRequest("paymentMethod required");

  const address = db.prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?").get(addressId, req.user.uid);
  if (!address) throw BadRequest("Invalid address");

  // Build cart items either from body (buy-now) or from user's cart
  let orderItems = [];
  if (items && Array.isArray(items) && items.length) {
    orderItems = items.map(it => {
      const p = products.find(x => x.id === Number(it.id));
      if (!p) return null;
      return { product: p, qty: Number(it.qty) || 1 };
    }).filter(Boolean);
  } else {
    const cart = db.prepare("SELECT * FROM carts WHERE user_id = ?").get(req.user.uid);
    if (!cart) throw BadRequest("Cart is empty");
    const cartRows = db.prepare("SELECT * FROM cart_items WHERE cart_id = ?").all(cart.id);
    orderItems = cartRows.map(r => {
      const p = products.find(x => x.id === r.product_id);
      if (!p) return null;
      return { product: p, qty: r.qty };
    }).filter(Boolean);
  }

  if (!orderItems.length) throw BadRequest("No items to order");

  // Stock check
  for (const it of orderItems) {
    if (it.qty > it.product.stock) throw BadRequest("Only " + it.product.stock + " in stock for " + it.product.title);
  }

  const subtotal = +orderItems.reduce((s, it) => s + it.product.price * it.qty, 0).toFixed(2);
  const deliveryFee = deliveryMethod === "express" ? 9.99 : 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  const orderNumber = generateOrderNumber();
  const estDelivery = calculateEstDelivery(deliveryMethod);

  const insertOrder = db.prepare(
    "INSERT INTO orders (order_number, user_id, subtotal, tax, delivery_fee, total, status, payment_status, payment_method, shipping_address, delivery_method, estimated_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const info = insertOrder.run(
    orderNumber, req.user.uid, subtotal, tax, deliveryFee, total,
    "Confirmed", paymentMethod === "cod" ? "Pending" : "Paid",
    paymentMethod, JSON.stringify(address), deliveryMethod, estDelivery
  );
  const orderId = info.lastInsertRowid;

  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, product_id, title, image, price, qty) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const it of orderItems) {
    insertItem.run(orderId, it.product.id, it.product.title, it.product.image, it.product.price, it.qty);
    // Decrement stock in-memory
    it.product.stock -= it.qty;
  }

  const historyInsert = db.prepare("INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)");
  historyInsert.run(orderId, "Placed", "Order received");
  historyInsert.run(orderId, "Confirmed", "Payment confirmed");

  // Clear user cart if order came from cart
  if (!items) {
    const cart = db.prepare("SELECT * FROM carts WHERE user_id = ?").get(req.user.uid);
    if (cart) db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cart.id);
  }

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const orderItemsRows = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  const history = db.prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC").all(orderId);
  res.status(201).json({ order: { ...order, items: orderItemsRows, history } });
});

router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC").all(req.user.uid);
  const orders = rows.map(o => {
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
    return { ...o, items };
  });
  res.json({ orders });
});

router.get("/:id", requireAuth, (req, res) => {
  const o = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!o) throw NotFound("Order not found");
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
  const history = db.prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC").all(o.id);
  const ret = db.prepare("SELECT * FROM returns WHERE order_id = ?").get(o.id);
  res.json({ order: { ...o, items, history, return: ret || null } });
});

router.put("/:id/cancel", requireAuth, (req, res) => {
  const o = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!o) throw NotFound("Order not found");
  if (o.status === "Cancelled") throw BadRequest("Already cancelled");
  if (["Shipped", "Out for Delivery", "Delivered"].includes(o.status))
    throw BadRequest("Cannot cancel after shipping");

  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id);
  for (const it of items) {
    const p = products.find(x => x.id === it.product_id);
    if (p) p.stock += it.qty;
  }

  db.prepare("UPDATE orders SET status = 'Cancelled', cancelled_at = datetime('now'), payment_status = ? WHERE id = ?")
    .run(o.payment_status === "Paid" ? "Refunded" : "Cancelled", o.id);
  db.prepare("INSERT INTO order_status_history (order_id, status, note) VALUES (?, ?, ?)")
    .run(o.id, "Cancelled", "Cancelled by user");

  res.json({ ok: true });
});

// Return request
router.post("/:id/return", requireAuth, (req, res) => {
  const o = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!o) throw NotFound("Order not found");
  if (o.status !== "Delivered" && o.status !== "Out for Delivery")
    throw BadRequest("Return only allowed after delivery");
  const existing = db.prepare("SELECT * FROM returns WHERE order_id = ?").get(o.id);
  if (existing) throw BadRequest("Return already requested");

  const { reason, description = "", refundMethod = "original" } = req.body || {};
  if (!reason) throw BadRequest("reason required");

  const info = db.prepare(
    "INSERT INTO returns (order_id, user_id, reason, description, refund_method, status, refund_amount) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(o.id, req.user.uid, reason, description, refundMethod, "Return Requested", o.total);

  res.status(201).json({ return: db.prepare("SELECT * FROM returns WHERE id = ?").get(info.lastInsertRowid) });
});

export default router;
