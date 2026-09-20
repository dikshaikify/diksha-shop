import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { findUserByEmail, findUserById, createUser, verifyPassword, publicUser } from "../users.js";
import { LoginSchema, RegisterSchema, ForgotSchema, ResetSchema, validate } from "../validators.js";
import { issueRefresh, rotateRefresh, revokeRefresh } from "../refreshStore.js";
import { Unauthorized, BadRequest, Conflict } from "../errors.js";
import { db } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ACCESS_TTL = "15m";
const signAccess = (uid) => jwt.sign({ uid }, JWT_SECRET, { expiresIn: ACCESS_TTL });

router.post("/login", (req, res) => {
  const { email, password } = validate(LoginSchema, req.body);
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) throw Unauthorized("Invalid email or password");
  const accessToken = signAccess(user.id);
  const refreshToken = issueRefresh(user.id);
  res.json({ accessToken, refreshToken, user: publicUser(user) });
});

router.post("/register", (req, res) => {
  const data = validate(RegisterSchema, req.body);
  if (findUserByEmail(data.email)) throw Conflict("Email already registered");
  const user = createUser(data);
  const accessToken = signAccess(user.id);
  const refreshToken = issueRefresh(user.id);
  res.status(201).json({ accessToken, refreshToken, user: publicUser(user) });
});

router.post("/forgot-password", (req, res) => {
  const { email } = validate(ForgotSchema, req.body);
  const user = findUserByEmail(email);
  if (user) {
    const token = randomUUID();
    const expiresAt = Date.now() + 15 * 60_000;
    db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
    db.prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, user.id, expiresAt);
    req.log?.info({ userId: user.id }, "password_reset_issued");
    res.json({ ok: true, message: "Reset link sent.", devToken: token });
  } else {
    res.json({ ok: true, message: "If that email exists, a reset link was sent." });
  }
});

router.post("/reset-password", (req, res) => {
  const { token, password } = validate(ResetSchema, req.body);
  const row = db.prepare("SELECT * FROM password_resets WHERE token = ?").get(token);
  if (!row || row.expires_at < Date.now()) throw BadRequest("Invalid or expired token");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(password, 10), row.user_id);
  db.prepare("DELETE FROM password_resets WHERE token = ?").run(token);
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

router.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.user.uid);
  if (!user) throw Unauthorized();
  res.json({ user: publicUser(user) });
});

export function requireAuth(req, _res, next) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) throw Unauthorized();
  try { req.user = jwt.verify(t, JWT_SECRET); next(); }
  catch { throw Unauthorized("Invalid or expired token"); }
}

export default router;
