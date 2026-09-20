import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getDB } from "../db.js";
import { products } from "../data.js";
import { BadRequest, NotFound } from "../errors.js";
import { ObjectId } from "mongodb";

const router = Router();

function generateOrderNumber() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return "ORD-" + ymd + "-" + seq;
}
function calcDelivery(method) {
  const days = method === "express" ? 2 : 5;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

router.post("/", requireAuth, async (req, res) => {
  const { addressId, paymentMethod, deliveryMethod = "standard", items } = req.body || {};
  if (!addressId) throw BadRequest("addressId required");
  if (!paymentMethod) throw BadRequest("paymentMethod required");

  const { addresses, orders, orderItems, orderHistory, carts, cartItems } = getDB();

  let address;
  try { address = await addresses.findOne({ _id: new ObjectId(addressId), userId: req.user.uid }); }
  catch { throw BadRequest("Invalid address"); }
  if (!address) throw BadRequest("Invalid address");

  let orderItemsList = [];
  if (items && Array.isArray(items) && items.length) {
    orderItemsList = items.map(it => {
      const p = products.find(x => x.id === Number(it.id));
      return p ? { product: p, qty: Number(it.qty) || 1 } : null;
    }).filter(Boolean);
  } else {
    const cart = await carts.findOne({ userId: req.user.uid });
    if (!cart) throw BadRequest("Cart is empty");
    const rows = await cartItems.find({ cartId: cart._id }).toArray();
    orderItemsList = rows.map(r => {
      const p = products.find(x => x.id === r.productId);
      return p ? { product: p, qty: r.qty } : null;
    }).filter(Boolean);
  }

  if (!orderItemsList.length) throw BadRequest("No items to order");

  for (const it of orderItemsList) {
    if (it.qty > it.product.stock) throw BadRequest("Only " + it.product.stock + " in stock for " + it.product.title);
  }

  const subtotal = +orderItemsList.reduce((s, it) => s + it.product.price * it.qty, 0).toFixed(2);
  const deliveryFee = deliveryMethod === "express" ? 9.99 : 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  const orderNumber = generateOrderNumber();
  const estDelivery = calcDelivery(deliveryMethod);

  const orderDoc = {
    orderNumber, userId: req.user.uid,
    subtotal, tax, deliveryFee, total,
    status: "Confirmed",
    paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid",
    paymentMethod,
    shippingAddress: address,
    deliveryMethod,
    estimatedDelivery: estDelivery,
    createdAt: new Date(),
    cancelledAt: null
  };
  const orderResult = await orders.insertOne(orderDoc);
  const orderId = orderResult.insertedId;

  for (const it of orderItemsList) {
    await orderItems.insertOne({
      orderId, productId: it.product.id, title: it.product.title,
      image: it.product.image, price: it.product.price, qty: it.qty
    });
    it.product.stock -= it.qty;
  }

  await orderHistory.insertMany([
    { orderId, status: "Placed", note: "Order received", createdAt: new Date() },
    { orderId, status: "Confirmed", note: "Payment confirmed", createdAt: new Date() }
  ]);

  if (!items) {
    const cart = await carts.findOne({ userId: req.user.uid });
    if (cart) await cartItems.deleteMany({ cartId: cart._id });
  }

  res.status(201).json({
    order: {
      ...orderDoc,
      _id: undefined,
      id: orderId.toString(),
      items: orderItemsList.map(it => ({
        productId: it.product.id, title: it.product.title,
        image: it.product.image, price: it.product.price, qty: it.qty
      }))
    }
  });
});

router.get("/", requireAuth, async (req, res) => {
  const { orders, orderItems } = getDB();
  const rows = await orders.find({ userId: req.user.uid }).sort({ _id: -1 }).toArray();
  const result = await Promise.all(rows.map(async o => {
    const items = await orderItems.find({ orderId: o._id }).toArray();
    return { ...o, id: o._id.toString(), items };
  }));
  res.json({ orders: result });
});

router.get("/:id", requireAuth, async (req, res) => {
  const { orders, orderItems, orderHistory, returns } = getDB();
  let o;
  try { o = await orders.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Order not found"); }
  if (!o) throw NotFound("Order not found");
  const items = await orderItems.find({ orderId: o._id }).toArray();
  const history = await orderHistory.find({ orderId: o._id }).sort({ _id: 1 }).toArray();
  const ret = await returns.findOne({ orderId: o._id });
  res.json({ order: { ...o, id: o._id.toString(), items, history, return: ret || null } });
});

router.put("/:id/cancel", requireAuth, async (req, res) => {
  const { orders, orderItems, orderHistory } = getDB();
  let o;
  try { o = await orders.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Order not found"); }
  if (!o) throw NotFound("Order not found");
  if (o.status === "Cancelled") throw BadRequest("Already cancelled");
  if (["Shipped", "Out for Delivery", "Delivered"].includes(o.status)) throw BadRequest("Cannot cancel after shipping");

  const items = await orderItems.find({ orderId: o._id }).toArray();
  for (const it of items) {
    const p = products.find(x => x.id === it.productId);
    if (p) p.stock += it.qty;
  }
  await orders.updateOne(
    { _id: o._id },
    { $set: {
      status: "Cancelled",
      cancelledAt: new Date(),
      paymentStatus: o.paymentStatus === "Paid" ? "Refunded" : "Cancelled"
    }}
  );
  await orderHistory.insertOne({ orderId: o._id, status: "Cancelled", note: "Cancelled by user", createdAt: new Date() });
  res.json({ ok: true });
});

router.post("/:id/return", requireAuth, async (req, res) => {
  const { orders, returns } = getDB();
  let o;
  try { o = await orders.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Order not found"); }
  if (!o) throw NotFound("Order not found");
  if (o.status !== "Delivered" && o.status !== "Out for Delivery") throw BadRequest("Return only allowed after delivery");
  const existing = await returns.findOne({ orderId: o._id });
  if (existing) throw BadRequest("Return already requested");

  const { reason, description = "", refundMethod = "original" } = req.body || {};
  if (!reason) throw BadRequest("reason required");

  const doc = {
    orderId: o._id, userId: req.user.uid,
    reason, description, refundMethod,
    status: "Return Requested", refundAmount: o.total,
    createdAt: new Date(), updatedAt: new Date()
  };
  const result = await returns.insertOne(doc);
  res.status(201).json({ return: { ...doc, id: result.insertedId.toString() } });
});

export default router;