import { useState } from "react";

/* ────────────────────────────────────────────────
   Modal content — every policy / help page
   ──────────────────────────────────────────────── */
const CONTENT = {
  about: {
    title: "About Diksha Shop",
    body: (
      <>
        <p>Diksha Shop is a modern e-commerce platform built to make shopping fast, honest, and delightful.</p>
        <p>We curate products across Electronics, Books, Clothing, Sports, Home, and Toys — always with verified stock, transparent pricing, and clear ratings.</p>
        <h4>Our promise</h4>
        <ul>
          <li>Real-time stock visibility</li>
          <li>7-day easy returns on delivered orders</li>
          <li>Secure authentication with refresh-token rotation</li>
          <li>Free standard delivery on every order</li>
        </ul>
      </>
    )
  },
  story: {
    title: "Our Story",
    body: (
      <>
        <p>Diksha Shop started as a learning project — a way to build a real, working e-commerce system from scratch.</p>
        <p>It grew into a full purchase flow: search, filters, product pages, cart, checkout, order tracking, and returns.</p>
        <p>Every line of code is public. Every decision favors clarity over cleverness.</p>
      </>
    )
  },
  careers: {
    title: "Careers",
    body: (
      <>
        <p>We're not hiring right now — but we're always interested in builders who care about clean architecture and thoughtful UX.</p>
        <p>Reach out: <a href="mailto:dikshakoppad2@gmail.com">dikshakoppad2@gmail.com</a></p>
      </>
    )
  },
  blog: {
    title: "Blog",
    body: (
      <>
        <p>Coming soon: deep dives on building e-commerce with React, Express, and SQLite.</p>
        <p>Topics planned:</p>
        <ul>
          <li>Cursor vs offset pagination</li>
          <li>Refresh-token rotation without breaking UX</li>
          <li>Optimistic cart updates</li>
        </ul>
      </>
    )
  },
  help: {
    title: "Help Center",
    body: (
      <>
        <h4>How do I place an order?</h4>
        <p>Browse → add to cart → checkout → choose address, delivery, and payment → place order.</p>

        <h4>Can I cancel my order?</h4>
        <p>Yes — any time before it ships. Go to <strong>Returns &amp; Orders</strong> → open the order → Cancel.</p>

        <h4>How do returns work?</h4>
        <p>After delivery, you have 7 days to request a return from the order detail page.</p>

        <h4>Is my payment secure?</h4>
        <p>We never store card numbers. Payment is a simulation for this demo — no real charges occur.</p>
      </>
    )
  },
  contact: {
    title: "Contact Us",
    body: (
      <>
        <p><strong>Email:</strong> <a href="mailto:dikshakoppad2@gmail.com">dikshakoppad2@gmail.com</a></p>
        <p><strong>Phone:</strong> <a href="tel:+918088933427">+91 8088933427</a></p>
        <p>We reply within 24 hours on business days.</p>
      </>
    )
  },
  shipping: {
    title: "Shipping Information",
    body: (
      <>
        <p>Two delivery options:</p>
        <ul>
          <li><strong>Standard</strong> — 3–5 business days (free)</li>
          <li><strong>Express</strong> — 1–2 business days ($9.99)</li>
        </ul>
        <p>Every order ships with tracking. You'll receive status updates by email.</p>
      </>
    )
  },
  returns: {
    title: "Returns & Refunds",
    body: (
      <>
        <p>7-day easy returns on all delivered orders.</p>
        <p>To start a return:</p>
        <ol>
          <li>Go to Returns &amp; Orders</li>
          <li>Open the order</li>
          <li>Click <strong>Return Items</strong></li>
          <li>Choose a reason and refund method</li>
        </ol>
        <p>Refunds process in 3–5 business days to your original method or store credit.</p>
      </>
    )
  },
  wishlist: {
    title: "Wishlist",
    body: (
      <>
        <p>Save products for later — coming soon.</p>
        <p>For now, add items to your cart and they'll persist across sessions.</p>
      </>
    )
  },
  addresses: {
    title: "Saved Addresses",
    body: (
      <>
        <p>Manage delivery addresses from your Account page → Saved Addresses.</p>
        <p>You can add, edit, delete, or set a default. The default is pre-selected at checkout.</p>
      </>
    )
  },
  privacy: {
    title: "Privacy Notice",
    body: (
      <>
        <p>We collect only what's needed to process your orders: name, email, phone, shipping address, and cart contents.</p>
        <p>We never sell your data.</p>
        <p>Passwords are hashed with bcrypt. Sessions use short-lived JWTs with refresh-token rotation. All API calls are validated with Zod schemas.</p>
      </>
    )
  },
  terms: {
    title: "Conditions of Use",
    body: (
      <>
        <p>By using Diksha Shop you agree to:</p>
        <ul>
          <li>Provide accurate account and shipping information</li>
          <li>Use the platform for lawful purposes only</li>
          <li>Accept that stock and prices may change without notice</li>
        </ul>
        <p>Orders are subject to stock verification at placement time.</p>
      </>
    )
  },
  cookies: {
    title: "Cookie Preferences",
    body: (
      <>
        <p>We use browser storage for:</p>
        <ul>
          <li><strong>Session tokens</strong> — keep you signed in</li>
          <li><strong>Cart data</strong> — remember items across visits</li>
          <li><strong>Filter state</strong> — preserve search and category selections</li>
        </ul>
        <p>Clear these anytime from your browser settings.</p>
      </>
    )
  },
  ads: {
    title: "Interest-Based Ads",
    body: (
      <>
        <p>Diksha Shop does not currently run interest-based advertising.</p>
        <p>If this changes, you'll be able to opt out from this page.</p>
      </>
    )
  }
};

/* ────────────────────────────────────────────────
   Sub-brand cards (mirrors Amazon's "AbeBooks / AWS" grid)
   — all Diksha Shop original services
   ──────────────────────────────────────────────── */
const SUB_BRANDS = [
  { title: "Diksha Books", sub: "Rare & collectible" },
  { title: "Diksha Cloud", sub: "Scalable hosting" },
  { title: "Diksha Audio", sub: "Audiobooks & podcasts" },
  { title: "Diksha Films", sub: "Movies & TV" },
  { title: "Diksha Biz", sub: "Bulk & wholesale" },
  { title: "Diksha Music", sub: "Stream millions of songs" },
  { title: "Diksha Style", sub: "Designer fashion" },
  { title: "Diksha Home", sub: "Furniture & decor" }
];

/* ────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────── */
export default function Footer() {
  const [modal, setModal] = useState(null);
  const open = (key) => setModal(key);
  const close = () => setModal(null);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Back to top */}
      <button className="footer-backtotop" onClick={scrollTop}>
        Back to top
      </button>

      <footer className="footer">
        {/* Main link grid */}
        <div className="footer-top">
          <div className="footer-col">
            <h4>Get to Know Us</h4>
            <ul>
              <li><button onClick={() => open("about")}>About Diksha Shop</button></li>
              <li><button onClick={() => open("story")}>Our Story</button></li>
              <li><button onClick={() => open("careers")}>Careers</button></li>
              <li><button onClick={() => open("blog")}>Blog</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><button onClick={() => open("help")}>Help Center</button></li>
              <li><button onClick={() => open("contact")}>Contact Us</button></li>
              <li><button onClick={() => open("shipping")}>Shipping Information</button></li>
              <li><button onClick={() => open("returns")}>Returns &amp; Refunds</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Your Account</h4>
            <ul>
              <li><button onClick={() => open("about")}>My Account</button></li>
              <li><button onClick={() => open("help")}>My Orders</button></li>
              <li><button onClick={() => open("wishlist")}>Wishlist</button></li>
              <li><button onClick={() => open("addresses")}>Saved Addresses</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><button onClick={() => open("privacy")}>Privacy Notice</button></li>
              <li><button onClick={() => open("terms")}>Conditions of Use</button></li>
              <li><button onClick={() => open("cookies")}>Cookie Preferences</button></li>
              <li><button onClick={() => open("ads")}>Interest-Based Ads</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Reach Us</h4>
            <ul>
              <li>📧 <a href="mailto:dikshakoppad2@gmail.com">dikshakoppad2@gmail.com</a></li>
              <li>📞 <a href="tel:+918088933427">+91 8088933427</a></li>
            </ul>
          </div>
        </div>

        {/* Divider + brand mark + locale */}
        <div className="footer-mid">
          <div className="footer-mid-inner">
            <div className="footer-brand-mark">
              <span className="brand-icon">🛍️</span>
              <span className="brand-wordmark">
                Diksha <strong>Shop</strong>
              </span>
            </div>

            <div className="footer-locale">
              <button className="locale-btn">
                <span>🌐</span> English
              </button>
              <button className="locale-btn">
                <span>🇮🇳</span> India
              </button>
            </div>
          </div>
        </div>

        {/* Sub-brands grid */}
        <div className="footer-subbrands">
          <div className="footer-subbrands-inner">
            {SUB_BRANDS.map((b) => (
              <button key={b.title} className="subbrand" onClick={() => open("about")}>
                <div className="subbrand-title">{b.title}</div>
                <div className="subbrand-sub">{b.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Legal row + copyright */}
        <div className="footer-legal">
          <div className="footer-legal-links">
            <button onClick={() => open("terms")}>Conditions of Use</button>
            <button onClick={() => open("privacy")}>Privacy Notice</button>
            <button onClick={() => open("ads")}>Interest-Based Ads</button>
          </div>

          <div className="footer-credit">
            <p className="footer-love">
              Built and loved by <strong>Diksha Koppad</strong> ❤️
            </p>
            <p className="footer-contact">
              <a href="mailto:dikshakoppad2@gmail.com">dikshakoppad2@gmail.com</a>
              <span className="dot">·</span>
              <a href="tel:+918088933427">+91 8088933427</a>
            </p>
            <p className="footer-copy">
              © 2026 Diksha Shop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{CONTENT[modal].title}</h2>
              <button className="modal-close" onClick={close} aria-label="Close">✕</button>
            </div>
            <div className="modal-body">{CONTENT[modal].body}</div>
          </div>
        </div>
      )}
    </>
  );
}