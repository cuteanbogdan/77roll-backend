import { Socket, Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  determineWinnerCoinflip,
  deleteRoom,
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

      const allRooms = await CoinflipRoom.find();
      io.emit("rooms-updated", allRooms);

      logger.info(
        `User ${userId} created room ${room._id} with bet ${betAmount}`
      );
    } catch (error) {
      socket.emit("room-error", { message: "Error creating room" });
      logger.error(`Error creating room: ${error}`);
    }
  });

  socket.on("join-room-coinflip", async ({ roomId, userId }) => {
    try {
      const room = await joinRoom(roomId, userId);
      socket.join(roomId);

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

      io.to(roomId).emit("room-joined", room);

      const allRooms = await CoinflipRoom.find();
      io.emit("rooms-updated", allRooms);

      if (room.opponentId) {
        setTimeout(async () => {
          const winner = await determineWinnerCoinflip(room);
          io.to(roomId).emit("game-result", { ...winner, roomId });

          const updatedUser = await findUserById((await winner).winnerId);
          const updatedBalance = updatedUser?.balance;

          if (updatedBalance !== undefined) {
            const userSocketId = Array.from(socketUserMap.entries()).find(
              ([_, id]) => id === updatedUser?._id.toString()
            )?.[0];

            if (userSocketId) {
              io.to(userSocketId).emit("balance-updated", updatedBalance);
            }
          }

          setTimeout(async () => {
            await deleteRoom(roomId);
            logger.info(`Room ${roomId} has been deleted from the database.`);
            io.to(roomId).emit("room-deleted", { roomId });
          }, 4000);
        }, 3000);
      }
    } catch (error) {
      socket.emit("room-error", { message: "Error joining room" });
      logger.error(`Error joining room: ${error}`);
    }
  });

  socket.on("get-rooms", async () => {
    try {
      const allRooms = await CoinflipRoom.find();
      socket.emit("rooms-updated", allRooms);
    } catch (error) {
      socket.emit("room-error", { message: "Error fetching rooms" });
      logger.error(`Error fetching rooms: ${error}`);
    }
  });
};
