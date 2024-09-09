import { Server } from "socket.io";
import RouletteManager from "./rouletteManager";
import logger from "../config/logger";
import { rouletteSocket } from "./rouletteSocket";
import { chatSocket } from "./chatSocket";
import { coinflipSocket } from "./coinflipSocket";

// Create a map to store the relationship between socket IDs and user IDs
const socketUserMap = new Map<string, string>();

export const setupSockets = (io: Server) => {
  const rouletteManager = new RouletteManager(io, socketUserMap);

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on("register-user", (userId: string) => {
      socketUserMap.set(socket.id, userId);
      logger.info(`Socket ID ${socket.id} associated with User ID ${userId}`);
    });

    rouletteSocket(io, socket, socketUserMap, rouletteManager);
    coinflipSocket(io, socket, socketUserMap);
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        logger.info(`User ${userId} with Socket ID ${socket.id} disconnected.`);
        socketUserMap.delete(socket.id);
      } else {
        logger.info(`Socket ID ${socket.id} disconnected.`);
      }
    });
  });
};
