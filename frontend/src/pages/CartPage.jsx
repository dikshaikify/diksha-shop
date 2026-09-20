import { useCart } from "../CartContext";
export default function CartPage({ onBack, onCheckout }) {
  const { items, remove, setQty, subtotal, clear } = useCart();
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is empty</h2>
        <p>Shop today's deals</p>
        <button className="buy-add" onClick={onBack} style={{maxWidth:260}}>Continue shopping</button>
      </div>
    );
  }
  return (
    <div className="cart-container">
      <div className="cart-main">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="cart-clear" onClick={clear}>Clear cart</button>
        </div>
        <hr />
        {items.map(item => (
          <div className="cart-item" key={item.id}>
            <img src={item.image} alt={item.title} className="cart-img" />
            <div className="cart-info">
              <div className="cart-title">{item.title}</div>
              <div className="cart-cat">{item.category}</div>
              <div className="cart-stock">In Stock</div>
              <div className="cart-controls">
                <select value={item.qty} onChange={(e) => setQty(item.id, Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Qty: {n}</option>)}
                </select>
                <button className="cart-remove" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
            <div className="cart-price">${(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <aside className="cart-summary">
        <div className="summary-row">
          <span>Subtotal ({items.length} items):</span>
          <strong>${subtotal.toFixed(2)}</strong>
        </div>
        <button className="checkout-btn" onClick={onCheckout}>Proceed to checkout</button>
      </aside>
    </div>
  );
}
