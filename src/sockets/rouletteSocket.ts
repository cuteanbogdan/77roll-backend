import { Socket, Server } from "socket.io";
import logger from "../config/logger";
import { placeBet, getBets } from "../services/rouletteService";
import { findUserById } from "../services/userService";

export const rouletteSocket = (
  io: Server,
  socket: Socket,
  socketUserMap: Map<string, string>
) => {
  socket.on("place-bet", async ({ userId, color, amount }) => {
    try {
      await placeBet(userId, color, amount);

      const updatedUser = await findUserById(userId);
      const updatedBalance = updatedUser?.balance;

      if (updatedBalance !== undefined) {
        // Emit balance update directly to the user's socket
        const userSocketId = Array.from(socketUserMap.entries()).find(
          ([_, id]) => id === userId
        )?.[0];

        if (userSocketId) {
          io.to(userSocketId).emit("balance-updated", updatedBalance);
        }
      }

      const allBets = await getBets();
      io.emit("bet-updated", allBets);

      logger.info(
        `Bet placed/updated: User ${userId} bet ${amount} on ${color}`
      );
    } catch (error) {
      socket.emit("bet-error", {
        success: false,
        message: "Insufficient balance to place this bet",
      });

      logger.error(`Error placing bet for User ${userId}: ${error}`);
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
