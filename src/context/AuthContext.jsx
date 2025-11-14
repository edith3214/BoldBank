// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket, connectSocketWithToken, disconnectSocket } from "../lib/socket";
import { setToken, getToken } from "../lib/api";

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
