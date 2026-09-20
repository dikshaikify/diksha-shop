import {
  AuthResponseSchema,
  MeResponseSchema,
  ProductResponseSchema,
  ProductsResponseSchema
} from "./schemas.js";

const ACCESS_KEY = "lqf.access";
const REFRESH_KEY = "lqf.refresh";  
const API_BASE = import.meta.env.VITE_API_URL || "";

export const auth = {
  get access() { return sessionStorage.getItem(ACCESS_KEY); },
  set access(v) { v ? sessionStorage.setItem(ACCESS_KEY, v) : sessionStorage.removeItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set refresh(v) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY); },
  clear() { this.access = null; this.refresh = null; }
};

let refreshing = null;
async function refreshAccess() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    if (!auth.refresh) throw new Error("No refresh token");
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: auth.refresh })
    });
    if (!res.ok) { auth.clear(); throw new Error("Session expired"); }
    const data = await res.json();
    auth.access = data.accessToken;
    auth.refresh = data.refreshToken;
    return data.accessToken;
  })().finally(() => { refreshing = null; });
  return refreshing;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

async function req(path, { method = "GET", body, signal, retry = true, schema } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth.access) headers.Authorization = "Bearer " + auth.access;
  const url = path.startsWith("http") ? path : API_BASE + path;
  const res = await fetch(url, { method, headers, signal, body: body ? JSON.stringify(body) : undefined });

  if (res.status === 401 && retry && auth.refresh) {
    await refreshAccess();
    return req(path, { method, body, signal, retry: false, schema });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || data.error || ("HTTP " + res.status));
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  const json = await res.json();
  return schema ? schema.parse(json) : json;
}

/* ============ AUTH ============ */
export async function login(email, password) {
  const data = await req("/api/auth/login", { method: "POST", body: { email, password }, retry: false, schema: AuthResponseSchema });
  auth.access = data.accessToken;
  auth.refresh = data.refreshToken;
  return data.user;
}
export async function register({ name, email, phone, password }) {
  const data = await req("/api/auth/register", { method: "POST", body: { name, email, phone, password }, retry: false, schema: AuthResponseSchema });
  auth.access = data.accessToken;
  auth.refresh = data.refreshToken;
  return data.user;
}
export async function logout() {
  try { await req("/api/auth/logout", { method: "POST", body: { refreshToken: auth.refresh } }); } catch {}
  auth.clear();
}
export async function fetchMe() {
  const data = await req("/api/auth/me", { schema: MeResponseSchema });
  return data.user;
}
export async function forgotPassword(email) {
  return req("/api/auth/forgot-password", { method: "POST", body: { email }, retry: false });
}
export async function resetPassword(token, password) {
  return req("/api/auth/reset-password", { method: "POST", body: { token, password }, retry: false });
}

/* ============ PRODUCTS ============ */
export async function fetchCategories(signal) {
  const data = await req("/api/categories", { signal });
  return data.categories;
}
export async function fetchProduct(id, signal) {
  const data = await req("/api/products/" + id, { signal, schema: ProductResponseSchema });
  return data.product;
}
export async function fetchProductsPage({ search, categories, cursor, limit = 12, sort, minPrice, maxPrice, minRating, signal }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categories?.length) params.set("category", categories.join(","));
  if (cursor) params.set("cursor", cursor);
  if (sort) params.set("sort", sort);
  if (minPrice != null) params.set("minPrice", minPrice);
  if (maxPrice != null) params.set("maxPrice", maxPrice);
  if (minRating != null) params.set("minRating", minRating);
  params.set("limit", limit);
  return req("/api/products?" + params, { signal, schema: ProductsResponseSchema });
}

/* ============ CART ============ */
export async function fetchCart() { return req("/api/cart"); }
export async function addToCart(productId, qty = 1) { return req("/api/cart", { method: "POST", body: { productId, qty } }); }
export async function updateCartItem(itemId, qty) { return req("/api/cart/" + itemId, { method: "PUT", body: { qty } }); }
export async function removeCartItem(itemId) { return req("/api/cart/" + itemId, { method: "DELETE" }); }
export async function mergeCart(items) { return req("/api/cart/merge", { method: "POST", body: { items } }); }

/* ============ ADDRESSES ============ */
export async function fetchAddresses() { return req("/api/addresses"); }
export async function createAddress(data) { return req("/api/addresses", { method: "POST", body: data }); }
export async function updateAddress(id, data) { return req("/api/addresses/" + id, { method: "PUT", body: data }); }
export async function deleteAddress(id) { return req("/api/addresses/" + id, { method: "DELETE" }); }
export async function setDefaultAddress(id) { return req("/api/addresses/" + id + "/default", { method: "PUT" }); }

/* ============ ORDERS ============ */
export async function placeOrder({ addressId, paymentMethod, deliveryMethod, items }) {
  return req("/api/orders", { method: "POST", body: { addressId, paymentMethod, deliveryMethod, items } });
}
export async function fetchOrders() { return req("/api/orders"); }
export async function fetchOrder(id) { return req("/api/orders/" + id); }
export async function cancelOrder(id) { return req("/api/orders/" + id + "/cancel", { method: "PUT" }); }
export async function requestReturn(orderId, body) { return req("/api/orders/" + orderId + "/return", { method: "POST", body }); }

/* ============ RETURNS ============ */
export async function fetchReturns() { return req("/api/returns"); }
export async function advanceReturn(id) { return req("/api/returns/" + id + "/advance", { method: "PUT" }); }
