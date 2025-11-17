// src/lib/api.js
const BACKEND = import.meta.env.VITE_BACKEND || "https://boldbank-backend.onrender.com";
const TOKEN_KEY = "bb_token"; // localStorage key

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${BACKEND}${path}`;
  const token = getToken();

  const headers = {
    ...(opts.headers || {}),
  };
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...opts, headers });
  return res;
}