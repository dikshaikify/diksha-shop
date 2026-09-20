import bcrypt from "bcryptjs";
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";

export async function findUserByEmail(email) {
  const { users } = getDB();
  return users.findOne({ email });
}
export async function findUserById(id) {
  const { users } = getDB();
  try { return users.findOne({ _id: new ObjectId(id) }); }
  catch { return null; }
}
export async function createUser({ name, email, phone, password }) {
  const { users } = getDB();
  const doc = {
    name, email, phone: phone || null,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date()
  };
  const result = await users.insertOne(doc);
  return { ...doc, _id: result.insertedId };
}
export function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone
  };
}