import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

export const db = new Database("diksha-shop.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS carts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL UNIQUE,
    updated_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    qty        INTEGER NOT NULL CHECK (qty > 0),
    added_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    full_name  TEXT    NOT NULL,
    phone      TEXT    NOT NULL,
    line1      TEXT    NOT NULL,
    city       TEXT    NOT NULL,
    state      TEXT    NOT NULL,
    pincode    TEXT    NOT NULL,
    country    TEXT    NOT NULL DEFAULT 'India',
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number       TEXT    NOT NULL UNIQUE,
    user_id            INTEGER NOT NULL,
    subtotal           REAL    NOT NULL,
    tax                REAL    NOT NULL,
    delivery_fee       REAL    NOT NULL,
    total              REAL    NOT NULL,
    status             TEXT    NOT NULL DEFAULT 'Pending',
    payment_status     TEXT    NOT NULL DEFAULT 'Paid',
    payment_method     TEXT    NOT NULL,
    shipping_address   TEXT    NOT NULL,
    delivery_method    TEXT    NOT NULL,
    estimated_delivery TEXT,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    cancelled_at       TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     INTEGER NOT NULL,
    product_id   INTEGER NOT NULL,
    title        TEXT    NOT NULL,
    image        TEXT,
    price        REAL    NOT NULL,
    qty          INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_status_history (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL,
    status     TEXT    NOT NULL,
    note       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS returns (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id      INTEGER NOT NULL,
    user_id       INTEGER NOT NULL,
    reason        TEXT    NOT NULL,
    description   TEXT,
    refund_method TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'Return Requested',
    refund_amount REAL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );
`);

const demoEmail = "demo@example.com";
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(demoEmail);
if (!existing) {
  db.prepare("INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)")
    .run("Demo User", demoEmail, "+91 8088933427", bcrypt.hashSync("demo1234", 10));
  console.log("[db] seeded demo user: demo@example.com / demo1234");
}
