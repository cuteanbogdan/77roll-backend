import User from "../models/User";
import { getRandomInt } from "../utils/getRandomInt";
import RouletteBet from "../models/RouletteBet";
import mongoose from "mongoose";
import logger from "../config/logger";

export const placeBet = async (
  userId: string,
  color: "black" | "red" | "green",
  amount: number
) => {
  const filter = { userId: new mongoose.Types.ObjectId(userId), color };
  const update = { $inc: { amount } };
  const options = { upsert: true, new: true };

  const bet = await RouletteBet.findOneAndUpdate(filter, update, options);

  const user = await User.findById(userId);
  if (user) {
    user.balance -= amount;
    await user.save();
  }
};

export const determineWinner = async () => {
  const winningNumber = getRandomInt(0, 36);
  const winningColor = getWinningColor(winningNumber);

  const bets = await RouletteBet.find({ color: winningColor });

  const winningUsers = [];
  for (const bet of bets) {
    const user = await User.findById(bet.userId);
    if (user) {
      const payoutMultiplier = winningColor === "green" ? 14 : 2;
      user.balance += bet.amount * payoutMultiplier;
      await user.save();

      winningUsers.push({
        _id: user._id,
        balance: user.balance,
      });
    }
  }

  return { winningNumber, winningColor, winningUsers };
};

export const getBets = async () => {
  try {
    const bets = await RouletteBet.find().populate("userId", "username");
    return bets;
  } catch (error) {
    throw new Error("Failed to retrieve bets");
  }
};

export const resetBets = async () => {
  try {
    await RouletteBet.deleteMany({});
    logger.info("All bets have been reset.");
  } catch (error) {
    logger.error("Error resetting bets: ", error);
    throw new Error("Failed to reset bets");
  }
};

const getWinningColor = (number: number): "black" | "red" | "green" => {
  if (number === 0) return "green";
  const isRed = [1, 2, 3, 4, 5, 6, 7].includes(number);
  return isRed ? "red" : "black";
};
