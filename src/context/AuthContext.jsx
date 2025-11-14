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

  // Check session on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!r.ok) throw new Error("Not authenticated");
        const data = await r.json();
        if (mounted) setUser(data);
      } catch (err) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ---------- ADDED: rehydrate user from token on mount ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // if we already have a user in memory, nothing to do
        if (typeof user !== "undefined" && user) return;

        // read token (may be null)
        const token = typeof getToken === "function" ? getToken() : null;
        if (!token) {
          // no token persisted — nothing to rehydrate
          return;
        }

        // validate token with backend; apiFetch attaches Authorization
        const res = await apiFetch("/api/me", { method: "GET" });
        if (!res.ok) {
          // token is invalid/expired -> remove it (safe) and bail out
          if (typeof setToken === "function") setToken(null);
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        // set user in your context
        if (typeof setUser === "function") setUser(data);

        // connect socket with token so server registers this socket under the user
        try {
          connectSocketWithToken(token);
        } catch (err) {
          console.warn("Socket connect during rehydrate failed:", err);
        }
      } catch (err) {
        console.error("Auth rehydrate error:", err);
        // best effort: clear token if something went wrong
        try { setToken(null); } catch (_) {}
      }
    })();

    return () => { mounted = false; };
  }, []); // run once on mount
  // ---------- END ADDED BLOCK ----------

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
