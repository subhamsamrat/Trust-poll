import { io } from "socket.io-client";

// Normalize server URL for WebSocket connection (strip '/api' if present)
const getSocketUrl = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl.replace(/\/api\/?$/, "");
  }
};

export const socket = io(getSocketUrl(), {
  autoConnect: false, // Ensures socket only connects explicitly when authenticated on the dashboard
  withCredentials: true,
});