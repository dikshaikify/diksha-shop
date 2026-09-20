import { useState, useRef, useEffect } from "react";
import { useCart } from "../CartContext";
import { useAuth } from "../AuthContext";

export default function Navbar({
  search,
  onSearchChange,
  onLogoClick,
  onCartClick,
  onOrdersClick,
  onProfileClick,
  onReturnsClick
}) {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header className="nav-root">
      <div className="nav-top">
        <button className="nav-logo" onClick={onLogoClick}>
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">Diksha Shop</span>
        </button>

        <div className="nav-search">
          <select className="nav-search-cat"><option>All</option></select>
          <input
            type="text"
            placeholder="Search Diksha Shop"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="nav-search-btn">🔍</button>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-account-wrap" ref={menuRef}>
              <button
                className="nav-account"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <div className="nav-line1">Hello, {user.name.split(" ")[0]}</div>
                <div className="nav-line2">Account & Lists ▾</div>
              </button>

              {menuOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <strong>Welcome, {user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <hr />
                  <button onClick={() => { close(); onProfileClick?.(); }}>
                    👤 My Profile
                  </button>
                  <button onClick={() => { close(); onOrdersClick?.(); }}>
                    📦 My Orders
                  </button>
                  <button onClick={() => { close(); onReturnsClick?.(); }}>
                    ↩️ Returns & Refunds
                  </button>
                  <button onClick={() => { close(); onProfileClick?.(); }}>
                    🏠 Saved Addresses
                  </button>
                  <hr />
                  <button className="danger" onClick={() => { close(); logout(); }}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-account">
              <div className="nav-line1">Hello, sign in</div>
              <div className="nav-line2">Account & Lists</div>
            </div>
          )}

          <button className="nav-orders" onClick={onOrdersClick}>
            <div className="nav-line1">Returns</div>
            <div className="nav-line2">& Orders</div>
          </button>

          <button className="nav-cart" onClick={onCartClick}>
            <span className="nav-cart-icon">🛒</span>
            <span className="nav-cart-badge">{totalQty}</span>
            <span className="nav-cart-label">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
}