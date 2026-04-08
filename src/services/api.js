const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 30000;

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

function buildUrl(path, params) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${BASE_URL}${normalizedPath}`);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== "") {
            url.searchParams.append(key, String(item));
          }
        });
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function request(path, options = {}) {
  const {
    method = "GET",
    params,
    body,
    headers: customHeaders = {},
    timeout = DEFAULT_TIMEOUT_MS,
    signal,
  } = options;

  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error?.name === "AbortError") {
      const err = new Error("Permintaan ke server terlalu lama. Silakan coba lagi.");
      err.httpStatus = 0;
      err.isTimeout = true;
      throw err;
    }

    const err = new Error("Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi beberapa saat.");
    err.httpStatus = 0;
    err.isNetworkError = true;
    throw err;
  }

  clearTimeout(timeoutId);

  if (response.status === 401 && !path.includes("/auth/login")) {
    clearAuth();
    window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason: "token_expired" } }));
    window.location.href = "/login";
    return null;
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      const err = new Error("Respons server tidak valid.");
      err.httpStatus = response.status;
      throw err;
    }
    return null;
  }

  if (!response.ok) {
    const err = new Error(
      payload?.detail?.message ||
      payload?.message ||
      payload?.detail ||
      "Terjadi kesalahan pada server."
    );
    err.httpStatus = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

const api = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
  postForm: (path, formData, options = {}) => request(path, { ...options, method: "POST", body: formData }),
  putForm: (path, formData, options = {}) => request(path, { ...options, method: "PUT", body: formData }),
};

export default api;
