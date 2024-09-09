import { Socket, Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  determineWinnerCoinflip,
} from "../services/coinflipService";
import logger from "../config/logger";
import CoinflipRoom from "../models/CoinflipRoom";
import { findUserById } from "../services/userService";

export const coinflipSocket = (
  io: Server,
  socket: Socket,
  socketUserMap: Map<string, string>
) => {
  socket.on("create-room-coinflip", async ({ userId, choice, betAmount }) => {
    try {
      const room = await createRoom(userId, choice, betAmount);
      socket.join(room._id.toString());

      // Emit balance update to the user's socket
      const updatedUser = await findUserById(userId);
      const updatedBalance = updatedUser?.balance;

      if (updatedBalance !== undefined) {
        const userSocketId = Array.from(socketUserMap.entries()).find(
          ([_, id]) => id === userId
        )?.[0];

        if (userSocketId) {
          io.to(userSocketId).emit("balance-updated", updatedBalance);
        }
      }

      const allRooms = await CoinflipRoom.find({ status: "waiting" });
      io.emit("rooms-updated", allRooms);

      logger.info(
        `User ${userId} created room ${room._id} with bet ${betAmount}`
      );
    } catch (error) {
      socket.emit("room-error", { message: "Error creating room" });
      logger.error(`Error creating room: ${error}`);
    }
  });

  socket.on("join-room-coinflip", async ({ roomId, userId, choice }) => {
    try {
      const room = await joinRoom(roomId, userId, choice);
      socket.join(roomId);
      io.to(roomId).emit("room-joined", room);

      if (room.opponentId) {
        setTimeout(async () => {
          const winner = determineWinnerCoinflip(room);
          io.to(roomId).emit("game-result", winner);
          logger.info(`Game result for room ${roomId}: ${winner}`);
        }, 3000);
      }
    } catch (error) {
      socket.emit("room-error", { message: "Error joining room" });
      logger.error(`Error joining room: ${error}`);
    }
  });
};
