// src/context/AdminControlContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { socket, connectSocketWithToken, disconnectSocket } from "../lib/socket";
import { getToken } from "../lib/api";
import { useAuth } from "./AuthContext";

const AdminControlContext = createContext();

export function AdminControlProvider({ children }) {
  const { user } = useAuth(); // watch auth
  const [forcedLogout, setForcedLogout] = useState(false);
  const [declinedTransactionId, setDeclinedTransactionId] = useState(null);

  useEffect(() => {
    if (!user?.email) {
      // if no user, ensure socket is disconnected and clear flags
      try {
        disconnectSocket();
      } catch (e) {
        /* ignore */
      }
      setForcedLogout(false);
      setDeclinedTransactionId(null);
      return;
    }

    // token-aware connect so handshake includes JWT
    try {
      const token = getToken();
      connectSocketWithToken(token);
    } catch (e) {
      /* ignore */
    }

    const onForceLogout = (payload) => {
      // payload might be { reason, email } - we set the flag so UI can react
      setForcedLogout(true);
    };

    const onTransactionUpdate = (tx) => {
      if (tx?.status === "Declined") {
        setDeclinedTransactionId(tx.id);
      }
    };

    socket.on("force-logout", onForceLogout);
    socket.on("transaction:update", onTransactionUpdate);

    return () => {
      socket.off("force-logout", onForceLogout);
      socket.off("transaction:update", onTransactionUpdate);
      // do not disconnect here — other contexts may rely on socket
    };
  }, [user?.email]);

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
