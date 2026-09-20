import { TooMany } from "./errors.js";

const buckets = new Map();
const CAPACITY = 60;      // max tokens
const REFILL_PER_SEC = 1; // 1 req/sec refill

export function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) { b = { tokens: CAPACITY, last: now }; buckets.set(key, b); }

  // Refill
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC);
  b.last = now;

  res.setHeader("X-RateLimit-Limit", CAPACITY);
  res.setHeader("X-RateLimit-Remaining", Math.floor(b.tokens));

  if (b.tokens < 1) {
    return next(TooMany());
  }
  b.tokens -= 1;
  next();
}