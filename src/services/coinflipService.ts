import logger from "../config/logger";
import CoinflipRoom from "../models/CoinflipRoom";
import User from "../models/User";
import { CoinflipRoomType } from "../types/games";

export const createRoom = async (
  userId: string,
  choice: "heads" | "tails",
  betAmount: number
): Promise<CoinflipRoomType> => {
  const user = await User.findById(userId);
  if (!user || user.balance < betAmount) {
    throw new Error("Insufficient balance or user not found");
  }

  user.balance -= betAmount;
  await user.save();

  const newRoom = new CoinflipRoom({
    creatorId: user._id,
    creatorChoice: choice,
    betAmount,
    status: "waiting",
  });

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
  if (!user || user.balance < room.betAmount) {
    throw new Error("Insufficient balance or user not found");
  }

  user.balance -= room.betAmount;
  await user.save();

  room.opponentId = user._id;
  room.opponentChoice = room.creatorChoice === "heads" ? "tails" : "heads";
  room.status = "playing";

  await room.save();
  return room;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await CoinflipRoom.findByIdAndDelete(roomId);
};

export const determineWinnerCoinflip = async (room: any) => {
  const outcome = Math.random() < 0.5 ? "heads" : "tails";
  const winnerId =
    room.creatorChoice === outcome ? room.creatorId : room.opponentId;

  room.result = outcome;
  room.winnerId = winnerId;
  room.status = "finished";
  await room.save();
  logger.info(`Game won for room ${room._id} by player with ID: ${winnerId}`);

  const winner = await User.findById(winnerId);
  if (winner) {
    winner.balance += room.betAmount * 2;
    await winner.save();
  } else {
    console.error(`Winner with ID ${winnerId} not found.`);
  }

  return { winnerId, outcome };
};
