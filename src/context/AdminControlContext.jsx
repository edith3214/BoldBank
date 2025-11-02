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
