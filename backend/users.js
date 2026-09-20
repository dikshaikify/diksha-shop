import bcrypt from "bcryptjs";
import { db } from "./db.js";

export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}
export function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}
export function createUser({ name, email, phone, password }) {
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)")
    .run(name, email, phone || null, hash);
  return findUserById(info.lastInsertRowid);
}
export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}
export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, phone: u.phone };
}
