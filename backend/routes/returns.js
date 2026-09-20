import { Router } from "express";
import { requireAuth } from "./auth.js";
import { db } from "../db.js";
import { NotFound } from "../errors.js";

const router = Router();

const PROGRESSION = ["Return Requested", "Approved", "Pickup Scheduled", "Item Received", "Refund Processing", "Refunded"];

router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM returns WHERE user_id = ? ORDER BY id DESC").all(req.user.uid);
  const enriched = rows.map(r => {
    const order = db.prepare("SELECT order_number, total FROM orders WHERE id = ?").get(r.order_id);
    return { ...r, orderNumber: order?.order_number, orderTotal: order?.total };
  });
  res.json({ returns: enriched });
});

router.get("/:id", requireAuth, (req, res) => {
  const r = db.prepare("SELECT * FROM returns WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!r) throw NotFound("Return not found");
  res.json({ return: r });
});

// Simulate advance to next status
router.put("/:id/advance", requireAuth, (req, res) => {
  const r = db.prepare("SELECT * FROM returns WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!r) throw NotFound("Return not found");
  const idx = PROGRESSION.indexOf(r.status);
  const next = idx < PROGRESSION.length - 1 ? PROGRESSION[idx + 1] : r.status;
  db.prepare("UPDATE returns SET status = ?, updated_at = datetime('now') WHERE id = ?").run(next, r.id);
  res.json({ return: db.prepare("SELECT * FROM returns WHERE id = ?").get(r.id) });
});

export default router;
