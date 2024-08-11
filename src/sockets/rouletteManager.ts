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

  constructor(io: Server) {
    this.io = io;
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

        // Emit the roulette result to all clients
        this.io.emit("roulette-result", result);
        logger.info(`Roulette result: ${JSON.stringify(result)}`);

        // After determining the winner, emit the updated balances
        for (const user of result.winningUsers) {
          this.io.to(user._id.toString()).emit("balance-updated", user.balance);
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
