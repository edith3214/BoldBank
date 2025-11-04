// src/context/AdminControlContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { socket } from "../lib/socket";

const AdminControlContext = createContext();

export function AdminControlProvider({ children }) {
  const [forcedLogout, setForcedLogout] = useState(false);
  const [declinedTransactionId, setDeclinedTransactionId] = useState(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onForceLogout = (payload) => {
      // payload might be { reason, email } - we set the flag so UI can react
      setForcedLogout(true);
    };

    const onTransactionUpdate = (tx) => {
      if (tx.status === "Declined") {
        setDeclinedTransactionId(tx.id);
      }
      // Reset forcedLogout flag if needed
    };

    socket.on("force-logout", onForceLogout);
    socket.on("transaction:update", onTransactionUpdate);

    return () => {
      socket.off("force-logout", onForceLogout);
      socket.off("transaction:update", onTransactionUpdate);
    };
  }, []);

  const triggerLogout = () => {
    // This client-side helper just sets the flag — prefer server-driven force-logout
    setForcedLogout(true);
  };

  const declineTransaction = (id) => {
    setDeclinedTransactionId(id);
  };

  const clearDecline = () => {
    setDeclinedTransactionId(null);
    setForcedLogout(false);
  };

  return (
    <AdminControlContext.Provider
      value={{
        forcedLogout,
        declinedTransactionId,
        triggerLogout,
        declineTransaction,
        clearDecline,
      }}
    >
      {children}
    </AdminControlContext.Provider>
  );
}

export const useAdminControl = () => useContext(AdminControlContext);




// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Login failed");
      }
      const data = await res.json();
      setUser(data);
      // navigate by role
      if (data.role === "admin") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
      return data;
    } catch (err) {
      alert(err.message || "Login error");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error", e);
    } finally {
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

