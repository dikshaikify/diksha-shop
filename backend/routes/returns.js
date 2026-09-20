import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getDB } from "../db.js";
import { NotFound } from "../errors.js";
import { ObjectId } from "mongodb";

const router = Router();
const PROGRESSION = ["Return Requested", "Approved", "Pickup Scheduled", "Item Received", "Refund Processing", "Refunded"];

router.get("/", requireAuth, async (req, res) => {
  const { returns, orders } = getDB();
  const rows = await returns.find({ userId: req.user.uid }).sort({ _id: -1 }).toArray();
  const enriched = await Promise.all(rows.map(async r => {
    const order = await orders.findOne({ _id: r.orderId });
    return {
      ...r,
      id: r._id.toString(),
      _id: undefined,
      orderNumber: order?.orderNumber,
      orderTotal: order?.total
    };
  }));
  res.json({ returns: enriched });
});

router.get("/:id", requireAuth, async (req, res) => {
  const { returns } = getDB();
  let r;
  try { r = await returns.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Return not found"); }
  if (!r) throw NotFound("Return not found");
  res.json({ return: { ...r, id: r._id.toString() } });
});

router.put("/:id/advance", requireAuth, async (req, res) => {
  const { returns } = getDB();
  let r;
  try { r = await returns.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Return not found"); }
  if (!r) throw NotFound("Return not found");
  const idx = PROGRESSION.indexOf(r.status);
  const next = idx < PROGRESSION.length - 1 ? PROGRESSION[idx + 1] : r.status;
  await returns.updateOne({ _id: r._id }, { $set: { status: next, updatedAt: new Date() } });
  const updated = await returns.findOne({ _id: r._id });
  res.json({ return: { ...updated, id: updated._id.toString() } });
});

export default router;