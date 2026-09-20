import { Router } from "express";
import { requireAuth } from "./auth.js";
import { getDB } from "../db.js";
import { BadRequest, NotFound } from "../errors.js";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { addresses } = getDB();
  const rows = await addresses.find({ userId: req.user.uid }).sort({ isDefault: -1, _id: -1 }).toArray();
  const mapped = rows.map(a => ({ ...a, id: a._id.toString(), _id: undefined }));
  res.json({ addresses: mapped });
});

router.post("/", requireAuth, async (req, res) => {
  const { fullName, phone, line1, city, state, pincode, country = "India", isDefault = false } = req.body || {};
  if (!fullName || !phone || !line1 || !city || !state || !pincode) throw BadRequest("Missing required fields");
  const { addresses } = getDB();
  if (isDefault) await addresses.updateMany({ userId: req.user.uid }, { $set: { isDefault: false } });
  const doc = { userId: req.user.uid, fullName, phone, line1, city, state, pincode, country, isDefault: !!isDefault, createdAt: new Date() };
  const result = await addresses.insertOne(doc);
  res.status(201).json({ address: { ...doc, id: result.insertedId.toString() } });
});

router.put("/:id", requireAuth, async (req, res) => {
  const { addresses } = getDB();
  let addr;
  try { addr = await addresses.findOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); }
  catch { throw NotFound("Address not found"); }
  if (!addr) throw NotFound("Address not found");
  const { fullName, phone, line1, city, state, pincode, country, isDefault } = req.body || {};
  if (isDefault) await addresses.updateMany({ userId: req.user.uid }, { $set: { isDefault: false } });
  await addresses.updateOne(
    { _id: addr._id },
    { $set: {
      fullName: fullName ?? addr.fullName,
      phone: phone ?? addr.phone,
      line1: line1 ?? addr.line1,
      city: city ?? addr.city,
      state: state ?? addr.state,
      pincode: pincode ?? addr.pincode,
      country: country ?? addr.country,
      isDefault: isDefault ? true : addr.isDefault
    }}
  );
  const updated = await addresses.findOne({ _id: addr._id });
  res.json({ address: { ...updated, id: updated._id.toString() } });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { addresses } = getDB();
  try { await addresses.deleteOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }); } catch {}
  res.json({ ok: true });
});

router.put("/:id/default", requireAuth, async (req, res) => {
  const { addresses } = getDB();
  await addresses.updateMany({ userId: req.user.uid }, { $set: { isDefault: false } });
  try {
    await addresses.updateOne({ _id: new ObjectId(req.params.id), userId: req.user.uid }, { $set: { isDefault: true } });
  } catch {}
  res.json({ ok: true });
});

export default router;