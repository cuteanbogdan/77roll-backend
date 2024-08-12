import { Server } from "socket.io";
import logger from "../config/logger";
import {
  determineWinner,
  resetBets,
  getUpdatedHistory,
  getBets,
} from "../services/rouletteService";

class RouletteManager {
  private isRolling = false;
  private io: Server;
  private socketUserMap: Map<string, string>;
  private timer: number = 15;
  private currentResult: any = null;
  private roundNumber: number = 1;
  public bettingOpen = true;

  constructor(io: Server, socketUserMap: Map<string, string>) {
    this.io = io;
    this.socketUserMap = socketUserMap;
    this.startRouletteLoop();
  }

  public handleResetBetsAfterAnimation() {
    if (this.currentResult && this.isRolling) {
      this.isRolling = true;
      return this.resetBetsAfterAnimation()
        .then(() => {
          this.currentResult = null;
          this.startRouletteRound();
        })
        .catch((error) => {
          logger.error("Error resetting bets after animation:", error);
        });
    } else {
      logger.warn("No result available for resetting bets or already rolling.");
    }
  }

  private async resetBetsAfterAnimation() {
    // Use the stored result to update balances
    for (const user of this.currentResult.winningUsers) {
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

    this.isRolling = false;
  }

  private async startRouletteLoop() {
    setInterval(async () => {
      if (this.isRolling) return;

      if (this.timer > 0) {
        this.io.emit("timer-update", this.timer);
        this.timer--;
      } else {
        this.isRolling = true;
        this.bettingOpen = false;
        this.io.emit("betting-closed");

        try {
          const result = await determineWinner();
          this.currentResult = result;

          const updatedHistory = await getUpdatedHistory();

          this.io.emit("roulette-result", {
            winningNumber: result.winningNumber,
            winningColor: result.winningColor,
            roundNumber: this.roundNumber,
            updatedHistory,
          });
          logger.info(
            `Roulette result for round ${this.roundNumber}: ${JSON.stringify(
              result
            )}`
          );
        } catch (error) {
          this.io.emit("error", { message: "Error during roulette process" });
          logger.error(`Error during roulette process: ${error}`);
        }
      }
    }, 1000);
  }

  private startRouletteRound() {
    this.bettingOpen = true;
    this.roundNumber++;
    this.timer = 15;
    this.isRolling = false; // Reset this after starting the next round
    this.io.emit("betting-open");
    logger.info(`Betting opened for round ${this.roundNumber}`);
  }

  public async getCurrentState() {
    const bets = await getBets();
    const history = await getUpdatedHistory();
    const targetNumber = this.currentResult?.winningNumber || 4;
    const roundNumber = this.roundNumber;
    const bettingOpen = this.bettingOpen;

    return {
      bets,
      history,
      targetNumber,
      roundNumber,
      bettingOpen,
    };
  }
}

export default RouletteManager;
