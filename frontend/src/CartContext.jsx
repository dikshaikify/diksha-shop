import { createContext, useContext, useEffect, useState } from "react";
const CartCtx = createContext(null);
const KEY = "lqf.cart";
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  const add = (product, qty = 1) => setItems(prev => {
    const ex = prev.find(i => i.id === product.id);
    if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
    return [...prev, { id: product.id, title: product.title, price: product.price, image: product.image, category: product.category, qty }];
  });
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const setQty = (id, qty) => { if (qty < 1) return remove(id); setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); };
  const clear = () => setItems([]);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  return <CartCtx.Provider value={{ items, add, remove, setQty, clear, totalQty, subtotal }}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);
