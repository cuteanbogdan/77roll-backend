import { Server } from "socket.io";
import logger from "../config/logger";
import {
  determineWinner,
  resetBets,
  getBets,
} from "../services/rouletteService";

class RouletteManager {
  private isRolling = false;
  private lastExecutionTime: number = Date.now();
  private io: Server;
  private socketUserMap: Map<string, string>;

  constructor(io: Server, socketUserMap: Map<string, string>) {
    this.io = io;
    this.socketUserMap = socketUserMap;
    this.startRouletteLoop();
  }

  private async startRouletteLoop() {
    setInterval(async () => {
      const currentTime = Date.now();
      if (this.isRolling || currentTime - this.lastExecutionTime < 15000) {
        logger.warn(
          "Roulette process is already running or too soon to start a new one."
        );
        return;
      }

      this.isRolling = true;
      this.lastExecutionTime = currentTime;

      try {
        const result = await determineWinner();

        this.io.emit("roulette-result", result);
        logger.info(`Roulette result: ${JSON.stringify(result)}`);

        // After determining the winner, emit the updated balances
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
    }, 15000);
  }
}

export default RouletteManager;
