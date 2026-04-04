// ── API Client untuk UMKM Backend (FastAPI) ─────────────────────────────────
// Base URL bisa diubah lewat env variable VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// ── Internal request helper ───────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Jangan set Content-Type kalau FormData (browser set sendiri beserta boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    // Lempar object error supaya bisa di-catch dengan status + message dari backend
    throw { status: res.status, ...data };
  }
  return data;
}

// ── Public API ────────────────────────────────────────────────────────────────
const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: "DELETE" }),
  // Untuk upload file (multipart/form-data)
  postForm: (path, formData) => request(path, { method: "POST", body: formData }),
};

export default api;
