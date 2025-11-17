// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket, connectSocketWithToken, disconnectSocket } from "../lib/socket";
import { setToken, getToken, apiFetch } from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:3001";

  // ---------- REPLACE rehydrate useEffect WITH THE FOLLOWING BLOCK ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log("[Auth] rehydrate: start");

        // quick guard: don't overwrite an already-hydrated user
        if (user) {
          console.log("[Auth] rehydrate: user already in memory, skipping");
          if (mounted) setLoading(false);
          return;
        }

        const token = typeof getToken === "function" ? getToken() : null;
        console.log("[Auth] rehydrate: found token?", !!token);

        if (!token) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          console.log("[Auth] rehydrate: no token, leaving unauthenticated");
          return;
        }

        // Use explicit BACKEND + Authorization header so we don't rely on other helpers' BASE_URL
        const base = typeof BACKEND === "string" && BACKEND ? BACKEND : (import.meta.env.VITE_BACKEND || "");
        const url = `${base.replace(/\/$/, "")}/api/me`;
        console.log("[Auth] rehydrate: calling", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          // do not use credentials: 'include' — we moved to Bearer tokens
        });

        console.log("[Auth] rehydrate: /api/me status =", res.status);

        if (!res.ok) {
          // helpful debug: print body when non-ok
          const txt = await res.text().catch(() => "");
          console.warn("[Auth] rehydrate: /api/me non-ok body:", txt);
          // token invalid or expired -> remove it and bail
          try { if (typeof setToken === "function") setToken(null); } catch (_) {}
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        console.log("[Auth] rehydrate: success; user =", data?.email || "(no email)");

        // set user and connect socket with token
        setUser(data);
        try { connectSocketWithToken(token); } catch (err) { console.warn("Socket reconnect failed:", err); }
      } catch (err) {
        console.error("[Auth] rehydrate: unexpected error", err);
        try { if (typeof setToken === "function") setToken(null); } catch (_) {}
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
        console.log("[Auth] rehydrate: finished (loading=false)");
      }
    })();

    return () => { mounted = false; };
  }, []); // run once on mount
  // ---------- END REPLACEMENT BLOCK ----------

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Login failed");
      }
      const body = await res.json(); // { token, user }

      setToken(body.token);
      setUser(body.user);

      // reconnect socket with token
      try {
        connectSocketWithToken(body.token);
      } catch (e) {
        console.warn("Socket connect failed:", e);
      }

      if (body.user.role === "admin") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
      return body.user;
    } catch (err) {
      alert(err.message || "Login error");
      throw err;
    }
  };

  const logout = async () => {
    try {
      // If you still call backend logout, you may keep it; not required for token approach
      await fetch(`${BACKEND}/api/logout`, { method: "POST" }).catch(() => {});
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      try { disconnectSocket(); } catch (_) {}
      setToken(null);
      setUser(null);
      if (window.location.pathname !== "/login") navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
