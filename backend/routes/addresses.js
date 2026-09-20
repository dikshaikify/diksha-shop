import { Router } from "express";
import { requireAuth } from "./auth.js";
import { db } from "../db.js";
import { BadRequest, NotFound } from "../errors.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC").all(req.user.uid);
  res.json({ addresses: rows });
});

router.post("/", requireAuth, (req, res) => {
  const { fullName, phone, line1, city, state, pincode, country = "India", isDefault = false } = req.body || {};
  if (!fullName || !phone || !line1 || !city || !state || !pincode) throw BadRequest("Missing required fields");

  if (isDefault) db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(req.user.uid);
  const info = db.prepare(
    "INSERT INTO addresses (user_id, full_name, phone, line1, city, state, pincode, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(req.user.uid, fullName, phone, line1, city, state, pincode, country, isDefault ? 1 : 0);
  const addr = db.prepare("SELECT * FROM addresses WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ address: addr });
});

router.put("/:id", requireAuth, (req, res) => {
  const addr = db.prepare("SELECT * FROM addresses WHERE id = ? AND user_id = ?").get(req.params.id, req.user.uid);
  if (!addr) throw NotFound("Address not found");
  const { fullName, phone, line1, city, state, pincode, country, isDefault } = req.body || {};
  if (isDefault) db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(req.user.uid);
  db.prepare(
    "UPDATE addresses SET full_name = ?, phone = ?, line1 = ?, city = ?, state = ?, pincode = ?, country = ?, is_default = ? WHERE id = ?"
  ).run(
    fullName ?? addr.full_name, phone ?? addr.phone, line1 ?? addr.line1,
    city ?? addr.city, state ?? addr.state, pincode ?? addr.pincode,
    country ?? addr.country, isDefault ? 1 : addr.is_default, addr.id
  );
  res.json({ address: db.prepare("SELECT * FROM addresses WHERE id = ?").get(addr.id) });
});

router.delete("/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(req.params.id, req.user.uid);
  res.json({ ok: true });
});

router.put("/:id/default", requireAuth, (req, res) => {
  db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(req.user.uid);
  db.prepare("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.user.uid);
  res.json({ ok: true });
});

export default router;
