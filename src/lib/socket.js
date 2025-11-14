// src/lib/socket.js
import { io } from "socket.io-client";
import { getToken } from "./api";

const BACKEND = import.meta.env.VITE_BACKEND || "https://boldbank-backend.onrender.com";

/**
 * Export a lazy socket instance. Call socket.connect() in consumers when ready.
 * withCredentials: true ensures the server reads the httpOnly cookie during handshake.
 */
export const socket = io(BACKEND, {
  autoConnect: false,
  transports: ["websocket", "polling"], // prefer websocket but fall back to polling
});

// helper to (re)connect with latest token
export function connectSocketWithToken(token) {
  socket.auth = { token: token || getToken() };
  if (socket.connected) socket.disconnect();
  socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}
