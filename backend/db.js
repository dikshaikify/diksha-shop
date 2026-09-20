import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "diksha-shop";

if (!uri) {
  console.error("❌ MONGODB_URI environment variable is required");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

let db, users, carts, cartItems, addresses, orders, orderItems, orderHistory, returns, passwordResets;

export async function connectDB() {
  await client.connect();
  db = client.db(dbName);

  users = db.collection("users");
  carts = db.collection("carts");
  cartItems = db.collection("cart_items");
  addresses = db.collection("addresses");
  orders = db.collection("orders");
  orderItems = db.collection("order_items");
  orderHistory = db.collection("order_status_history");
  returns = db.collection("returns");
  passwordResets = db.collection("password_resets");

  await users.createIndex({ email: 1 }, { unique: true });
  await carts.createIndex({ userId: 1 }, { unique: true });
  await cartItems.createIndex({ cartId: 1, productId: 1 }, { unique: true });
  await orders.createIndex({ orderNumber: 1 }, { unique: true });
  await orders.createIndex({ userId: 1 });
  await addresses.createIndex({ userId: 1 });
  await returns.createIndex({ orderId: 1 }, { unique: true });
  await passwordResets.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  const demoEmail = "demo@example.com";
  const existing = await users.findOne({ email: demoEmail });
  if (!existing) {
    await users.insertOne({
      name: "Demo User",
      email: demoEmail,
      phone: "+91 8088933427",
      passwordHash: bcrypt.hashSync("demo1234", 10),
      createdAt: new Date()
    });
    console.log("[db] seeded demo user: demo@example.com / demo1234");
  }

  console.log("[db] connected to MongoDB:", dbName);
}

export function getDB() {
  if (!db) throw new Error("Database not initialized");
  return { users, carts, cartItems, addresses, orders, orderItems, orderHistory, returns, passwordResets };
}

export async function closeDB() {
  await client.close();
}