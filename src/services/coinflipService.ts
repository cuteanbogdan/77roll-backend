import logger from "../config/logger";
import CoinflipRoom from "../models/CoinflipRoom";
import Transaction from "../models/Transaction";
import User from "../models/User";
import { CoinflipRoomType } from "../types/games";
import { formatBalance } from "../utils/formatBalance";
import { determineCoinflipOutcome } from "../utils/GenerateWinnerCoinflip";
import { updateUserLevelAndRank } from "./userService";
import crypto from "crypto";

export const createRoom = async (
  userId: string,
  choice: "heads" | "tails",
  betAmount: number
): Promise<CoinflipRoomType> => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.balance < betAmount) {
    throw new Error("Insufficient balance to create room");
  }

  user.balance = formatBalance(user.balance - betAmount);

  user.totalBetCoinflip = formatBalance(user.totalBetCoinflip + betAmount);
  user.totalBets = formatBalance(user.totalBets + betAmount);
  await user.save();

  const transaction = new Transaction({
    userId: user._id,
    type: `Coinflip Room Created - ${
      choice.charAt(0).toUpperCase() + choice.substring(1)
    }`,
    amount: -betAmount,
    date: new Date(),
  });
  await transaction.save();

  const roomSeed = crypto.randomBytes(32).toString("hex");

  const newRoom = new CoinflipRoom({
    creatorId: user._id,
    creatorChoice: choice,
    betAmount,
    roomSeed,
    status: "waiting",
  });

  const experienceGained = betAmount / 2;
  await updateUserLevelAndRank(userId, experienceGained);

  await newRoom.save();
  return newRoom;
};

export const joinRoom = async (
  roomId: string,
  userId: string
): Promise<CoinflipRoomType> => {
  const room = await CoinflipRoom.findById(roomId);
  if (!room || room.status !== "waiting") {
    throw new Error("Room not found or already in play");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.balance < room.betAmount) {
    throw new Error("Insufficient balance to join the room");
  }

  user.balance = formatBalance(user.balance - room.betAmount);

  user.totalBetCoinflip = formatBalance(user.totalBetCoinflip + room.betAmount);
  user.totalBets = formatBalance(user.totalBets + room.betAmount);
  await user.save();

  room.opponentId = user._id;
  room.opponentChoice = room.creatorChoice === "heads" ? "tails" : "heads";
  room.status = "playing";

  const transaction = new Transaction({
    userId: user._id,
    type: `Coinflip Room Joined - ${
      room.opponentChoice.charAt(0).toUpperCase() +
      room.opponentChoice.substring(1)
    }`,
    amount: -room.betAmount,
    date: new Date(),
  });
  await transaction.save();

  const experienceGained = room.betAmount / 2;
  await updateUserLevelAndRank(userId, experienceGained);

  await room.save();
  return room;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await CoinflipRoom.findByIdAndDelete(roomId);
};

export const determineWinnerCoinflip = async (room: any) => {
  const creator = await User.findById(room.creatorId).select("clientSeed");
  const opponent = await User.findById(room.opponentId).select("clientSeed");

  if (!creator || !opponent) {
    throw new Error("One of the users not found");
  }

  const creatorClientSeed = creator.clientSeed;
  const opponentClientSeed = opponent.clientSeed;

  const { outcome, winnerId } = determineCoinflipOutcome(
    room.roomSeed,
    creatorClientSeed,
    opponentClientSeed,
    room._id.toString(),
    room.creatorChoice,
    room.creatorId,
    room.opponentId
  );

  room.result = outcome;
  room.winnerId = winnerId;
  room.status = "finished";
  await room.save();
  logger.info(`Game won for room ${room._id} by player with ID: ${winnerId}`);

  const winner = await User.findById(winnerId);
  if (winner) {
    const payoutAmount = room.betAmount * 2;
    winner.balance = formatBalance(winner.balance + payoutAmount);
    await winner.save();

    const transaction = new Transaction({
      userId: winner._id,
      type: `Coinflip Room Win`,
      amount: payoutAmount,
      date: new Date(),
    });
    await transaction.save();
  } else {
    console.error(`Winner with ID ${winnerId} not found.`);
  }

  return { winnerId, outcome };
};
