import { getId } from "../utils/format";

const API_BASE = import.meta.env.VITE_API_URL || "";

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const apiRequest = async (path, { method = "GET", body, token } = {}) => {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};

const withQuery = (path, query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

export const loginRequest = (credentials) =>
  apiRequest("/api/users/login", { method: "POST", body: credentials });

export const signupRequest = (payload) =>
  apiRequest("/api/users/create", { method: "POST", body: payload });

export const logoutRequest = (token) =>
  apiRequest("/api/users/logout", { method: "POST", token });

export const sessionRequest = (token) =>
  apiRequest("/api/users/session", { token });

export const updateUserRequest = (id, payload, token) =>
  apiRequest(`/api/users/update/${id}`, { method: "PUT", body: payload, token });

export const getProductsRequest = async (query = {}) => {
  const data = await apiRequest(withQuery("/api/products/v1", query));
  return {
    products: data.data || [],
    total: data.total ?? (data.data || []).length,
    totalPages: data.totalPages ?? 1,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
  };
};

export const getProductRequest = async (id) => {
  const data = await apiRequest(`/api/products/v1/${id}`);
  const list = data.data || [];
  return list[0] || null;
};

export const getProductBySlugRequest = async (slug) => {
  const data = await apiRequest(`/api/products/v1/slug/${encodeURIComponent(slug)}`);
  const list = data.data || [];
  return list[0] || null;
};

export const getCategoriesRequest = () =>
  apiRequest("/api/categories/getAllCategories");

export const getReviewsRequest = (query = {}) =>
  apiRequest(withQuery("/api/reviews/getAllReviews", query));

export const createReviewRequest = (payload, token) =>
  apiRequest("/api/reviews/create", { method: "POST", body: payload, token });

export const getCartsRequest = (token) =>
  apiRequest("/api/carts/getAllCarts", { token });

export const createCartRequest = (payload, token) =>
  apiRequest("/api/carts/create", { method: "POST", body: payload, token });

export const updateCartRequest = (id, payload, token) =>
  apiRequest(`/api/carts/update/${id}`, { method: "PUT", body: payload, token });

const notifyCartUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
};

export const addToCartRequest = async (token, productId, quantity = 1) => {
  const carts = await getCartsRequest(token);
  const cart = carts[0];
  const items = (cart?.cartItems || []).map((item) => ({
    productId: getId(item.productId),
    quantity: item.quantity,
  }));

  const index = items.findIndex((item) => item.productId === productId);
  if (index >= 0) items[index].quantity += quantity;
  else items.push({ productId, quantity });

  const result = !cart
    ? await createCartRequest({ cartItems: items }, token)
    : await updateCartRequest(cart._id, { cartItems: items }, token);

  notifyCartUpdated();
  return result;
};

export const saveCartItemsRequest = async (token, items) => {
  const carts = await getCartsRequest(token);
  const cart = carts[0];
  const payload = {
    cartItems: items.map((item) => ({
      productId: getId(item.productId),
      quantity: item.quantity,
    })),
  };

  const result = !cart
    ? await createCartRequest(payload, token)
    : await updateCartRequest(cart._id, payload, token);

  notifyCartUpdated();
  return result;
};

export const getUsersRequest = (token, query = {}) =>
  apiRequest(withQuery("/api/users/getAllUsers", query), { token });

export const deleteUserRequest = (id, token) =>
  apiRequest(`/api/users/delete/${id}`, { method: "DELETE", token });

export const getOrdersRequest = (token, query = {}) =>
  apiRequest(withQuery("/api/orders/getAllOrders", query), { token });

export const createOrderRequest = (payload, token) =>
  apiRequest("/api/orders/create", { method: "POST", body: payload, token });

export const updateOrderRequest = (id, payload, token) =>
  apiRequest(`/api/orders/update/${id}`, { method: "PUT", body: payload, token });

export const deleteOrderRequest = (id, token) =>
  apiRequest(`/api/orders/delete/${id}`, { method: "DELETE", token });

export const createProductRequest = (payload, token) =>
  apiRequest("/api/products/create", { method: "POST", body: payload, token });

export const updateProductRequest = (id, payload, token) =>
  apiRequest(`/api/products/update/${id}`, { method: "PUT", body: payload, token });

export const deleteProductRequest = (id, token) =>
  apiRequest(`/api/products/delete/${id}`, { method: "DELETE", token });

export const updateReviewRequest = (id, payload, token) =>
  apiRequest(`/api/reviews/update/${id}`, { method: "PUT", body: payload, token });

export const deleteReviewRequest = (id, token) =>
  apiRequest(`/api/reviews/delete/${id}`, { method: "DELETE", token });

export const getSuppliersRequest = () =>
  apiRequest("/api/suppliers/getAllSuppliers");
