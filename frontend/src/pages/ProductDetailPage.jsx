import { useState } from "react";
import { useProduct } from "../hooks/useProducts";
import StarRating from "../components/StarRating";
import QuantitySelect from "../components/QuantitySelect";
import { useCart } from "../CartContext";

export default function ProductDetailPage({ productId, onBack, onCartClick }) {
  const { data: product, isLoading, error } = useProduct(productId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  if (isLoading) {
    return (
      <div className="detail-container">
        <div className="p-skel-line" style={{ height: 30, width: "50%" }} />
        <div className="p-skel-line" style={{ height: 20, width: "30%" }} />
      </div>
    );
  }

  if (error) return <div className="error">⚠️ {error.message}</div>;
  if (!product) return null;

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    add(product, qty);
    onCartClick();
  };

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={onBack}>← Back to results</button>

      <div className="detail-layout">
        <div className="detail-image-col">
          <img src={product.image} alt={product.title} className="detail-image" />
        </div>

        <div className="detail-info-col">
          <h1 className="detail-title">{product.title}</h1>
          <div className="detail-rating-row">
            <StarRating value={product.rating} size={16} />
            <span className="detail-rating-num">{product.rating}</span>
            <span className="detail-divider">|</span>
            <span className="detail-cat-link">{product.category}</span>
          </div>
          <hr className="detail-hr" />
          <h3 className="detail-about">About this item</h3>
          <ul className="detail-bullets">
            <li>{product.description}</li>
            <li>Premium build quality for everyday reliability</li>
            <li>Backed by a 1-year manufacturer warranty</li>
            <li>7-day easy return policy</li>
          </ul>
        </div>

        <div className="detail-buy-col">
          <div className="buy-box">
            <div className="buy-price">
              <span className="buy-symbol">$</span>
              <span className="buy-int">{Math.floor(product.price)}</span>
              <span className="buy-frac">{(product.price % 1).toFixed(2).slice(1)}</span>
            </div>
            <div className="buy-delivery">
              <strong>FREE delivery</strong> — arrives in 2–3 days
            </div>
            <div className="buy-stock">In Stock</div>
            <QuantitySelect value={qty} onChange={setQty} />
            <button className="buy-add" onClick={handleAdd}>
              {added ? "✓ Added" : "Add to Cart"}
            </button>
            <button className="buy-now" onClick={handleBuyNow}>Buy Now</button>
            <div className="buy-secure">🔒 Secure transaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
