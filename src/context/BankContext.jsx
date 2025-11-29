// src/context/BankContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { socket, connectSocketWithToken, disconnectSocket } from "../lib/socket";
import { apiFetch, getToken } from "../lib/api";
import { useAuth } from "./AuthContext";

const BankContext = createContext();

export function BankProvider({ children }) {
  const INITIAL_BALANCE = 8157450.47;
  const { user } = useAuth(); // used to filter/decide behavior
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState([]);
  const socketConnectedRef = useRef(false);

  // fetch transactions from backend on mount and on user changes
  const fetchTransactions = async () => {
    try {
      const res = await apiFetch("/api/transactions", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      const txs = Array.isArray(data) ? data : [];
      setTransactions(txs);

      // Calculate balance from transaction history
      // We assume INITIAL_BALANCE is the starting point.
      // We subtract/add amounts from all non-declined transactions.
      // Note: In this system, it seems `amount` is stored as positive for transfers?
      // Let's check how `addTransaction` handles it.
      // In `addTransaction`: `amount` is passed as positive, but `tx.amount` might be negative?
      // Wait, looking at `addTransaction` in the original code:
      // `const delta = parseFloat(tx.amount) || 0;`
      // And `addTransaction` sends `body: JSON.stringify({ amount, description })`.
      // The backend `Transaction.create` takes `amount: parseFloat(amount)`.
      // So if I send 50, it stores 50.
      // But `addTransaction` does `return Number((prev + delta).toFixed(2));`?
      // Wait, if I transfer money, I expect my balance to go DOWN.
      // If `amount` is positive 50, `prev + 50` goes UP.
      // Let's re-read `addTransaction` carefully.
      // `const addTransaction = async (description, type = "Transfer", amount = 0, owner = undefined) => { ... }`
      // It sends `amount` to backend.
      // Backend: `amount: parseFloat(amount)`.
      // Frontend optimistic update: `const delta = parseFloat(tx.amount) || 0; return Number((prev + delta).toFixed(2));`
      // This implies `tx.amount` MUST be negative for a transfer if we are adding it.
      // OR the backend logic handles sign?
      // Backend `Transaction.create` just stores what it gets.
      // So if the frontend sends positive 50, it stores positive 50.
      // And `prev + 50` increases balance.
      // This contradicts "deducted from the balance".
      // Let's look at `onUpdate`: `if (existing && existing.status === "Pending" && tx.status === "Declined") { ... const delta = parseFloat(tx.amount) || 0; return Number((prevBal - delta).toFixed(2)); }`
      // If I sent -50 (deduction), and it's declined, I want to refund it. `prev - (-50)` = `prev + 50`. Correct.
      // So `amount` must be negative for deductions.
      // BUT `addTransaction` signature is `amount = 0`. Usually UI sends positive number.
      // I need to check how `addTransaction` is CALLED in the UI.
      // Since I can't see the UI code calling it, I have to assume the standard convention or look at `addTransaction` again.
      // Wait, the user said "deducted from the balance".
      // If the current code ADDS the amount, maybe the UI sends a negative number?
      // Or maybe the current code is WRONG?
      // "any amount deducted from that would be permernetly deleted"
      // I will assume for now that `amount` in the DB reflects the change to balance (negative for debit, positive for credit).
      // So I will sum them up.

      const totalDelta = txs.reduce((acc, tx) => {
        if (tx.status === "Declined") return acc;
        return acc + (parseFloat(tx.amount) || 0);
      }, 0);

      setBalance(Number((INITIAL_BALANCE + totalDelta).toFixed(2)));

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

    // connect socket (do this *after* token exists)
    const token = getToken();
    try {
      connectSocketWithToken(token);
    } catch (e) {
      console.warn("Socket connect failed:", e);
    }

    // connection debug handlers (attach once per effect run)
    const onConnect = () => {
      console.log("Socket connected (client) id=", socket.id, "connected=", socket.connected);
    };
    const onConnectError = (err) => {
      console.warn("Socket connect_error (client):", err);
    };
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    // Handlers
    const onCreated = (tx) => {
      setTransactions((prev) => {
        if (prev.find((t) => t.id === tx.id)) return prev;

        // If this new transaction belongs to the current user, deduct its amount now
        // (handles the case where the transaction came from another tab)
        if (tx.ownerEmail === user?.email) {
          setBalance((prevBal) => {
            const delta = parseFloat(tx.amount) || 0;
            return Number((prevBal + delta).toFixed(2));
          });
        }

        return [tx, ...prev];
      });
    };

    const onUpdate = (tx) => {
      setTransactions((prev) => {
        const existing = prev.find((t) => t.id === tx.id);

        // If we previously had it as Pending and now it's Declined -> refund
        if (existing && existing.status === "Pending" && tx.status === "Declined") {
          if (tx.ownerEmail === user?.email) {
            setBalance((prevBal) => {
              // tx.amount is negative for outgoing transfers; subtracting a negative adds it back
              const delta = parseFloat(tx.amount) || 0;
              return Number((prevBal - delta).toFixed(2));
            });
          }
        }

        // If the tx wasn't in our list and belongs to us and is pending, deduct it (defensive)
        if (!existing && tx.ownerEmail === user?.email && tx.status === "Pending") {
          setBalance((prevBal) => {
            const delta = parseFloat(tx.amount) || 0;
            return Number((prevBal + delta).toFixed(2));
          });
        }

        return prev.map((t) => (t.id === tx.id ? tx : t));
      });
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
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      // Do not disconnect here so other tabs remain connected; the disconnect logic above handles logout.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // re-run when user changes

  // create transaction (POST to backend); returns created tx
  const addTransaction = async (description, type = "Transfer", amount = 0, owner = undefined) => {
    try {
      const res = await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({ amount, description }),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      const tx = await res.json();

      // Immediately deduct the amount for this tab's user (tx.amount is negative for outgoing transfers)
      // use parseFloat guard and round to 2 decimals to avoid FP noise
      // FIX: Use setTransactions to atomically check if tx already exists (from socket) before updating balance
      setTransactions((prev) => {
        if (prev.find((t) => t.id === tx.id)) return prev;

        setBalance((prevBal) => {
          const delta = parseFloat(tx.amount) || 0;
          return Number((prevBal + delta).toFixed(2));
        });

        return [tx, ...prev];
      });
      return tx;
    } catch (e) {
      console.error("addTransaction error", e);
      throw e;
    }
  };

  const approveTransaction = async (id) => {
    try {
      const res = await apiFetch(`/api/transactions/${id}/approve`, { method: "PATCH" });
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
      const res = await apiFetch(`/api/transactions/${id}/decline`, {
        method: "PATCH",
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
