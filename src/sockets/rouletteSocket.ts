import { Socket, Server } from "socket.io";
import logger from "../config/logger";
import {
  placeBet,
  getBets,
  getUpdatedHistory,
} from "../services/rouletteService";
import { findUserById } from "../services/userService";
import RouletteManager from "./rouletteManager";

export const rouletteSocket = (
  io: Server,
  socket: Socket,
  socketUserMap: Map<string, string>,
  rouletteManager: RouletteManager
) => {
  socket.on("place-bet", async ({ userId, color, amount }) => {
    if (!rouletteManager.bettingOpen) {
      socket.emit("bet-error", {
        success: false,
        message: "Betting is currently closed.",
      });
      return;
    }

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

  // socket.on("reset-bets-after-animation", () => {
  //   rouletteManager.handleResetBetsAfterAnimation();
  // });

  socket.on("get-initial-state", async () => {
    try {
      const initialState = await rouletteManager.getCurrentState();
      socket.emit("initial-state", initialState);
    } catch (error) {
      socket.emit("error", { message: "Error retrieving initial state" });
    }
  });

  socket.on("get-history", async () => {
    try {
      const updatedHistory = await getUpdatedHistory();
      socket.emit("updated-history", updatedHistory);
    } catch (error) {
      socket.emit("error", { message: "Error retrieving history" });
      logger.error(`Error retrieving history: ${error}`);
    }
  });
};
