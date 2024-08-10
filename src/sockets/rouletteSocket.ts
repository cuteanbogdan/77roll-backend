import { Server, Socket } from "socket.io";
import {
  placeBet,
  determineWinner,
  getBets,
} from "../services/rouletteService";
import logger from "../config/logger";

export const rouletteSocket = (io: Server, socket: Socket) => {
  socket.on("place-bet", async ({ userId, color, amount }) => {
    try {
      await placeBet(userId, color, amount);
      io.emit("bet-updated", { userId, color, amount });
      logger.info(`Bet placed: User ${userId} bet ${amount} on ${color}`);
    } catch (error) {
      socket.emit("bet-placed", {
        success: false,
        message: "Error placing bet",
      });
      logger.error(`Error placing bet: ${error}`);
    }
  });

  socket.on("get-all-bets", async () => {
    try {
      const bets = await getBets();
      socket.emit("all-bets", bets);
      logger.info(`Sent all bets to client: ${socket.id}`);
    } catch (error) {
      socket.emit("error", { message: "Error retrieving bets" });
      logger.error(`Error retrieving bets: ${error}`);
    }
  });

  let isRolling = false;

  socket.on("start-roulette", async () => {
    if (isRolling) {
      return socket.emit("error", { message: "Roulette is already rolling" });
    }
    isRolling = true;
    try {
      const result = await determineWinner();
      io.emit("roulette-result", result);
      logger.info(`Roulette result: ${JSON.stringify(result)}`);
    } catch (error) {
      socket.emit("error", { message: "Error starting roulette" });
      logger.error(`Error starting roulette: ${error}`);
    } finally {
      isRolling = false;
    }
  });
};
