// Platzi Fake Store API  https://fakeapi.platzi.com
const BASE = 'https://api.escuelajs.co/api/v1';

export const tokenStore = {
  get: () => localStorage.getItem('access_token'),
  set: (t) => localStorage.setItem('access_token', t),
  clear: () => localStorage.removeItem('access_token'),
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || `Request failed (${res.status})`);
  }
  return data;
}

// Auth
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const getProfile = () => request('/auth/profile');

// Products
export const getProducts = (offset, limit, { title = '', categoryId = '' } = {}) => {
  const q = new URLSearchParams({ offset, limit });
  if (title) q.set('title', title);
  if (categoryId) q.set('categoryId', categoryId);
  return request(`/products?${q.toString()}`);
};
export const getAllProducts = () => request('/products');
export const createProduct = (p) => request('/products', { method: 'POST', body: p });
export const updateProduct = (id, p) => request(`/products/${id}`, { method: 'PUT', body: p });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => request('/categories');
export const createCategory = (c) => request('/categories', { method: 'POST', body: c });
export const updateCategory = (id, c) => request(`/categories/${id}`, { method: 'PUT', body: c });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });

// The API sometimes returns images as '["https://..."]' strings; normalise to a usable URL.
export function cleanImage(value) {
  if (!value) return '';
  let v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== 'string') return '';
  v = v.trim();
  if (v.startsWith('[')) {
    try { v = JSON.parse(v)[0] || ''; } catch { v = v.replace(/[\[\]"]/g, ''); }
  }
  return v;
}

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#eef1f6"/><text x="50%" y="50%" fill="#98a2b3" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
  );