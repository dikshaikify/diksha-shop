import { useState } from "react";
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";
import SubNav from "./components/SubNav";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import { useCategories } from "./hooks/useProducts";

export default function App() {
  const { user, booting } = useAuth();
  const [authScreen, setAuthScreen] = useState("login");
  const [view, setView] = useState({ name: "home" });

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(null);

  const { data: categories = [] } = useCategories(Boolean(user));

  if (booting) return <div className="amz-boot">Loading…</div>;

  if (!user) {
    if (authScreen === "register")
      return <RegisterPage onShowLogin={() => setAuthScreen("login")} />;
    if (authScreen === "forgot")
      return <ForgotPasswordPage onShowLogin={() => setAuthScreen("login")} />;
    return (
      <LoginPage
        onShowRegister={() => setAuthScreen("register")}
        onShowForgot={() => setAuthScreen("forgot")}
      />
    );
  }

  const toggleCategory = (cat) =>
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  return (
    <>
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onLogoClick={() => setView({ name: "home" })}
        onCartClick={() => setView({ name: "cart" })}
        onOrdersClick={() => setView({ name: "orders" })}
        onProfileClick={() => setView({ name: "profile" })}
        onReturnsClick={() => setView({ name: "orders" })}
      />

      <SubNav
        categories={categories}
        selected={selected}
        onToggle={toggleCategory}
        onClear={() => setSelected([])}
      />

      <div className="page-wrap">
        {view.name === "home" && (
          <HomePage
            search={search}
            selected={selected}
            setSelected={setSelected}
            sort={sort}
            setSort={setSort}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            minRating={minRating}
            setMinRating={setMinRating}
            onSelectProduct={(id) => setView({ name: "detail", id })}
          />
        )}

        {view.name === "detail" && (
          <ProductDetailPage
            productId={view.id}
            onBack={() => setView({ name: "home" })}
            onCartClick={() => setView({ name: "cart" })}
          />
        )}

        {view.name === "cart" && (
          <CartPage
            onBack={() => setView({ name: "home" })}
            onCheckout={() => setView({ name: "checkout" })}
          />
        )}

        {view.name === "profile" && (
          <ProfilePage onBack={() => setView({ name: "home" })} />
        )}

        {view.name === "orders" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>Orders</h2>
            <p style={{ color: "#94a3b8" }}>Coming in Phase I</p>
            <button className="buy-add" onClick={() => setView({ name: "home" })}>
              Back to home
            </button>
          </div>
        )}

        {view.name === "checkout" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>Checkout</h2>
            <p style={{ color: "#94a3b8" }}>Coming in Phase H</p>
            <button className="buy-add" onClick={() => setView({ name: "cart" })}>
              Back to cart
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}