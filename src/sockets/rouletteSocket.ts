import { Socket, Server } from "socket.io";
import logger from "../config/logger";
import { placeBet, getBets } from "../services/rouletteService";
import { findUserById } from "../services/userService";

export const rouletteSocket = (io: Server, socket: Socket) => {
  socket.on("place-bet", async ({ userId, color, amount }) => {
    try {
      await placeBet(userId, color, amount);

      const updatedUser = await findUserById(userId);
      const updatedBalance = updatedUser?.balance;

      if (updatedBalance !== undefined) {
        socket.emit("balance-updated", updatedBalance);
      }

      const allBets = await getBets();
      io.emit("bet-updated", allBets);

      logger.info(
        `Bet placed/updated: User ${userId} bet ${amount} on ${color}`
      );
    } catch (error) {
      socket.emit("bet-placed", {
        success: false,
        message: "Error placing bet",
      });
      logger.error(`Error placing bet: ${error}`);
    }
  });

  // Handle request to get all bets (useful when a client first connects)
  socket.on("get-all-bets", async () => {
    try {
      const allBets = await getBets();
      socket.emit("all-bets", allBets);
      logger.info(`Sent all bets to client: ${socket.id}`);
    } catch (error) {
      socket.emit("error", { message: "Error retrieving bets" });
      logger.error(`Error retrieving bets: ${error}`);
    }
  });
};
