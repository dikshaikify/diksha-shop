import { randomUUID } from "crypto";

const store = new Map(); // refreshToken -> { uid, exp }

export function issueRefresh(uid, ttlMs = 7 * 24 * 3600_000) {
  const token = randomUUID();
  store.set(token, { uid, exp: Date.now() + ttlMs });
  return token;
}

export function rotateRefresh(oldToken, ttlMs) {
  const entry = store.get(oldToken);
  if (!entry) return null;
  if (entry.exp < Date.now()) { store.delete(oldToken); return null; }
  store.delete(oldToken);
  const token = randomUUID();
  store.set(token, { uid: entry.uid, exp: Date.now() + ttlMs });
  return { token, uid: entry.uid };
}

export function revokeRefresh(token) {
  store.delete(token);
}