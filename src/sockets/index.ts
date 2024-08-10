import { Server } from "socket.io";
import { rouletteSocket } from "./rouletteSocket";
import logger from "../config/logger";

export const setupSockets = (io: Server) => {
  io.on("connection", (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    rouletteSocket(io, socket);

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
