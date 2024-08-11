import { Server } from "socket.io";
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

  constructor(io: Server, socketUserMap: Map<string, string>) {
    this.io = io;
    this.socketUserMap = socketUserMap;
    this.startRouletteLoop();
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
          const updatedHistory = await getUpdatedHistory();

          this.io.emit("roulette-result", {
            winningNumber: result.winningNumber,
            winningColor: result.winningColor,
            updatedHistory,
          });
          logger.info(`Roulette result: ${JSON.stringify(result)}`);

          // After determining the winner, emit the updated balances
          for (const user of result.winningUsers) {
            const socketId = [...this.socketUserMap.entries()].find(
              ([key, value]) => value === user._id.toString()
            )?.[0];
            if (socketId) {
              this.io.to(socketId).emit("balance-updated", user.balance);
            } else {
              logger.warn(
                `Socket ID not found for user ${user._id.toString()}`
              );
            }
          }

          // Reset bets after the result
          await resetBets();
          this.io.emit("clear-bets");
          logger.info("Bets reset after round completion");
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
