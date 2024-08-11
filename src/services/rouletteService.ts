import User from "../models/User";
import { getRandomInt } from "../utils/getRandomInt";
import RouletteBet from "../models/RouletteBet";
import mongoose from "mongoose";
import logger from "../config/logger";
import { formatBalance } from "../utils/formatBalance";

export const placeBet = async (
  userId: string,
  color: "black" | "red" | "green",
  amount: number
) => {
  const filter = { userId: new mongoose.Types.ObjectId(userId), color };

  // Retrieve any existing bet on the same color
  const existingBet = await RouletteBet.findOne(filter);

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Calculate total balance required
  const totalBetAmount = formatBalance((existingBet?.amount || 0) + amount);

  // Check if the user has enough balance to place the bet
  if (user.balance < amount) {
    throw new Error("Insufficient balance to place this bet");
  }

  // Deduct the new bet amount from the user's balance
  user.balance = formatBalance(user.balance - amount);
  await user.save();

  // Update the existing bet or create a new one
  const update = { amount: totalBetAmount };
  const options = { upsert: true, new: true };
  await RouletteBet.findOneAndUpdate(filter, update, options);
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
      formatBalance((user.balance += bet.amount * payoutMultiplier));
      await user.save();

      winningUsers.push({
        _id: user._id,
        balance: formatBalance(user.balance),
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
