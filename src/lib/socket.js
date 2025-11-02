// src/lib/socket.js
import { io } from "socket.io-client";

const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:3001";

/**
 * Export a lazy socket instance. Call socket.connect() in consumers when ready.
 * withCredentials: true ensures the server reads the httpOnly cookie during handshake.
 */
export const socket = io(BACKEND, {
  autoConnect: false,
  withCredentials: true,
});
