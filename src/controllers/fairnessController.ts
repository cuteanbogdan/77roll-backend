import { Request, Response } from "express";
import { generateWinningNumber } from "../utils/GenerateWinningNumberOptions";
import logger from "../config/logger";

export const verifyFairness = async (req: Request, res: Response) => {
  try {
    const { serverSeed, clientSeeds, roundNumber } = req.body;

    if (
      !serverSeed ||
      !Array.isArray(clientSeeds) ||
      typeof roundNumber !== "number"
    ) {
      logger.warn("Missing or invalid parameters in verify fairness request");
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    const verifiedWinningNumber = generateWinningNumber({
      serverSeed,
      clientSeeds,
      roundNumber,
    });

    logger.info(
      `Fairness verified for round ${roundNumber} with server seed ${serverSeed}`
    );

    res.json({ verifiedWinningNumber });
  } catch (error) {
    logger.error("Error verifying fairness", { error });
    res.status(500).json({ message: "Server error" });
  }
};
