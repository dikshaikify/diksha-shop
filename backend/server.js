import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/addresses.js";
import orderRoutes from "./routes/orders.js";
import returnRoutes from "./routes/returns.js";
import { errorHandler } from "./errors.js";
import { rateLimit } from "./rateLimit.js";
import { logger } from "./logger.js";
import { connectDB } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "https://dikshashop.vercel.app"
];

function isAllowed(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (origin.endsWith(".onrender.com")) return true;
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowed(origin)) callback(null, true);
    else callback(new Error("CORS not allowed: " + origin));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  req.id = randomUUID();
  req.log = logger.child({ reqId: req.id, method: req.method, url: req.url });
  req.log.info("request_start");
  next();
});

app.use(rateLimit);

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((req, _res, next) => {
  const err = new Error("Route not found: " + req.method + " " + req.url);
  err.status = 404;
  err.code = "NOT_FOUND";
  next(err);
});

app.use(errorHandler);

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => logger.info({ port: PORT }, "server_started"));
  } catch (err) {
    logger.error({ err }, "startup_failed");
    process.exit(1);
  }
})();