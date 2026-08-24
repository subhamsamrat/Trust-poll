import { Server } from "socket.io";
import { setupPollSocketHandlers } from "./poll.socket.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Register poll handlers
    setupPollSocketHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};
