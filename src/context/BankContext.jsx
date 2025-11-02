// src/context/BankContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import { useAuth } from "./AuthContext";

const BankContext = createContext();

export function BankProvider({ children }) {
  const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:3001";
  const { user } = useAuth(); // used to filter/decide behavior
  const [balance, setBalance] = useState(8457458.47);
  const [transactions, setTransactions] = useState([]);
  const socketConnectedRef = useRef(false);

  // fetch transactions from backend on mount and on user changes
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/transactions`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchTransactions:", e);
      setTransactions([]);
    }
  };

  useEffect(() => {
    // If no authenticated user, disconnect socket and clear list
    if (!user?.email) {
      try {
        if (socket && socket.connected) socket.disconnect();
      } catch (e) {
        /* ignore */
      }
      socketConnectedRef.current = false;
      setTransactions([]); // optional: clear on logout
      return;
    }

    // user is authenticated -> fetch and connect
    fetchTransactions();

    // connect socket (do this *after* cookie exists so handshake includes it)
    if (!socketConnectedRef.current) {
      socket.connect();
      socketConnectedRef.current = true;
    } else if (!socket.connected) {
      socket.connect();
    }

    // Handlers
    const onCreated = (tx) => {
      setTransactions((prev) => {
        if (prev.find((t) => t.id === tx.id)) return prev;
        return [tx, ...prev];
      });
    };

    const onUpdate = (tx) => {
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
    };

    const onForceLogout = (payload) => {
      console.warn("force-logout received", payload);
      // Refresh list to be safe; auth/session handling will be done by AuthContext + AdminControl
      fetchTransactions();
    };

    socket.on("transactions:created", onCreated);
    socket.on("transaction:update", onUpdate);
    socket.on("force-logout", onForceLogout);

    return () => {
      socket.off("transactions:created", onCreated);
      socket.off("transaction:update", onUpdate);
      socket.off("force-logout", onForceLogout);
      // Do not disconnect here so other tabs remain connected; the disconnect logic above handles logout.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // re-run when user changes

  // create transaction (POST to backend); returns created tx
  const addTransaction = async (description, type = "Transfer", amount = 0, owner = undefined) => {
    try {
      const res = await fetch(`${BACKEND}/api/transactions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description }),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      const tx = await res.json();
      // server emits transactions:created which will update state — we still optimistically add:
      setTransactions((prev) => [tx, ...prev]);
      return tx;
    } catch (e) {
      console.error("addTransaction error", e);
      throw e;
    }
  };

  const approveTransaction = async (id) => {
    try {
      const res = await fetch(`${BACKEND}/api/transactions/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Approve failed");
      }
      const tx = await res.json();
      // server emits transaction:update; also update local state
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
      return tx;
    } catch (e) {
      console.error("approveTransaction:", e);
      throw e;
    }
  };

  const declineTransaction = async (id, forceLogout = false) => {
    try {
      const res = await fetch(`${BACKEND}/api/transactions/${id}/decline`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceLogout }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Decline failed");
      }
      const tx = await res.json();
      setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
      return tx;
    } catch (e) {
      console.error("declineTransaction:", e);
      throw e;
    }
  };

  return (
    <BankContext.Provider
      value={{
        balance,
        transactions,
        addTransaction,
        approveTransaction,
        declineTransaction,
        setBalance,
        fetchTransactions,
        socket, // provide socket in case components need to listen
      }}
    >
      {children}
    </BankContext.Provider>
  );
}

export const useBank = () => useContext(BankContext);
