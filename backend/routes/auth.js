import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { findUserByEmail, findUserById, createUser, verifyPassword, publicUser } from "../users.js";
import { LoginSchema, RegisterSchema, ForgotSchema, ResetSchema, validate } from "../validators.js";
import { issueRefresh, rotateRefresh, revokeRefresh } from "../refreshStore.js";
import { Unauthorized, BadRequest, Conflict } from "../errors.js";
import { getDB } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_TTL = "15m";
const signAccess = (uid) => jwt.sign({ uid }, JWT_SECRET, { expiresIn: ACCESS_TTL });

router.post("/login", async (req, res) => {
  const { email, password } = validate(LoginSchema, req.body);
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) throw Unauthorized("Invalid email or password");
  const accessToken = signAccess(user._id.toString());
  const refreshToken = issueRefresh(user._id.toString());
  res.json({ accessToken, refreshToken, user: publicUser(user) });
});

router.post("/register", async (req, res) => {
  const data = validate(RegisterSchema, req.body);
  const existing = await findUserByEmail(data.email);
  if (existing) throw Conflict("Email already registered");
  const user = await createUser(data);
  const accessToken = signAccess(user._id.toString());
  const refreshToken = issueRefresh(user._id.toString());
  res.status(201).json({ accessToken, refreshToken, user: publicUser(user) });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = validate(ForgotSchema, req.body);
  const user = await findUserByEmail(email);
  if (user) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const { passwordResets } = getDB();
    await passwordResets.deleteMany({ userId: user._id });
    await passwordResets.insertOne({ token, userId: user._id, expiresAt });
    req.log?.info({ userId: user._id.toString() }, "password_reset_issued");
    res.json({ ok: true, message: "Reset link sent.", devToken: token });
  } else {
    res.json({ ok: true, message: "If that email exists, a reset link was sent." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = validate(ResetSchema, req.body);
  const { passwordResets, users } = getDB();
  const row = await passwordResets.findOne({ token });
  if (!row) throw BadRequest("Invalid or expired token");
  await users.updateOne(
    { _id: row.userId },
    { $set: { passwordHash: bcrypt.hashSync(password, 10) } }
  );
  await passwordResets.deleteOne({ token });
  res.json({ ok: true });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) throw BadRequest("refreshToken required");
  const rotated = rotateRefresh(refreshToken);
  if (!rotated) throw Unauthorized("Invalid or expired refresh token");
  res.json({ accessToken: signAccess(rotated.uid), refreshToken: rotated.token });
});

router.post("/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) revokeRefresh(refreshToken);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user.uid);
  if (!user) throw Unauthorized();
  res.json({ user: publicUser(user) });
});

export function requireAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) throw Unauthorized();
  try {
    req.user = jwt.verify(t, JWT_SECRET);
    next();
  } catch {
    throw Unauthorized("Invalid or expired token");
  }
}

export default router;