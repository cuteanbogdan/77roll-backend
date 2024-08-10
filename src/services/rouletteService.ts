import User from "../models/User";
import { getRandomInt } from "../utils/getRandomInt";
import RouletteBet from "../models/RouletteBet";
import mongoose from "mongoose";

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

  for (const bet of bets) {
    const user = await User.findById(bet.userId);
    if (user) {
      let payoutMultiplier = 0;
      if (winningColor === "green") {
        payoutMultiplier = 14;
      } else {
        payoutMultiplier = 2;
      }
      user.balance += bet.amount * payoutMultiplier;
      await user.save();
    }
  }

  await RouletteBet.deleteMany({});
  return { winningNumber, winningColor };
};

export const getBets = async () => {
  try {
    const bets = await RouletteBet.find().populate("userId", "username");
    return bets;
  } catch (error) {
    throw new Error("Failed to retrieve bets");
  }
};

const getWinningColor = (number: number): "black" | "red" | "green" => {
  if (number === 0) return "green";
  const isRed = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ].includes(number);
  return isRed ? "red" : "black";
};
