import { Server, Socket } from "socket.io";
import logger from "../config/logger";
import {
  determineWinner,
  resetBets,
  getUpdatedHistory,
} from "../services/rouletteService";

class RouletteManager {
  private isRolling = false;
  private io: Server;
  private socketUserMap: Map<string, string>;
  private timer: number = 15;
  private currentResult: any = null;

  constructor(io: Server, socketUserMap: Map<string, string>) {
    this.io = io;
    this.socketUserMap = socketUserMap;
    this.startRouletteLoop();
    this.registerSocketListeners();
  }

  private registerSocketListeners() {
    this.io.on("connection", (socket) => {
      socket.on("reset-bets-after-animation", async () => {
        if (this.currentResult) {
          try {
            await this.resetBetsAfterAnimation(socket, this.currentResult);
          } catch (error) {
            logger.error("Error resetting bets after animation:", error);
          } finally {
            this.currentResult = null;
          }
        } else {
          logger.warn("No result available for resetting bets.");
        }
      });
    });
  }

  private async resetBetsAfterAnimation(socket: Socket, result: any) {
    // Use the passed result to update balances
    for (const user of result.winningUsers) {
      const socketId = [...this.socketUserMap.entries()].find(
        ([key, value]) => value === user._id.toString()
      )?.[0];
      if (socketId) {
        this.io.to(socketId).emit("balance-updated", user.balance);
      } else {
        logger.warn(`Socket ID not found for user ${user._id.toString()}`);
      }
    }

    // Reset the bets
    await resetBets();
    this.io.emit("clear-bets");
    logger.info("Bets reset after animation");
  }

  private async startRouletteLoop() {
    setInterval(async () => {
      if (this.isRolling) return;

      if (this.timer > 0) {
        this.io.emit("timer-update", this.timer);
        this.timer--;
      } else {
        this.isRolling = true;
        this.timer = 15; // Reset the timer

        try {
          const result = await determineWinner();
          this.currentResult = result;

          const updatedHistory = await getUpdatedHistory();

          this.io.emit("roulette-result", {
            winningNumber: result.winningNumber,
            winningColor: result.winningColor,
            updatedHistory,
          });
          logger.info(`Roulette result: ${JSON.stringify(result)}`);
        } catch (error) {
          this.io.emit("error", { message: "Error during roulette process" });
          logger.error(`Error during roulette process: ${error}`);
        } finally {
          this.isRolling = false;
        }
      }
    }, 1000);
  }
}

export default RouletteManager;
