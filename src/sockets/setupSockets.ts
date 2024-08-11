import { Server } from "socket.io";
import RouletteManager from "./rouletteManager";
import logger from "../config/logger";
import { rouletteSocket } from "./rouletteSocket";

export const setupSockets = (io: Server) => {
  const rouletteManager = new RouletteManager(io);

  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    rouletteSocket(io, socket);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
