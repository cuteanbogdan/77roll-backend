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
  userId: string,
  choice: "heads" | "tails"
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
  room.opponentChoice = choice;
  room.status = "playing";

  await room.save();
  return room;
};

export const determineWinnerCoinflip = (room: any) => {
  const outcome = Math.random() < 0.5 ? "heads" : "tails";
  const winnerId =
    room.creatorChoice === outcome ? room.creatorId : room.opponentId;

  room.result = outcome;
  room.status = "finished";
  room.save();

  return { winnerId, outcome };
};
