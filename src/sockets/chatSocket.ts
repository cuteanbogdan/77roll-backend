import { Socket, Server } from "socket.io";
import logger from "../config/logger";
import ChatMessage from "../models/ChatMessage";
import User from "../models/User";

interface Message {
  userId: string;
  text: string;
  timestamp: string;
}

export const chatSocket = (io: Server, socket: Socket) => {
  socket.on("send-message", async ({ text, userId }: Message) => {
    if (!userId || !text) {
      socket.emit("chat-error", { message: "Invalid message data." });
      return;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        socket.emit("chat-error", { message: "User not found." });
        return;
      }

      const timestamp = new Date().toISOString();
      const fullMessage = {
        userId: user._id,
        username: user.username,
        text,
        level: user.level,
        profileImage: user.profileImage,
        timestamp,
      };

      const chatMessage = new ChatMessage({
        userId: user._id,
        text,
        timestamp,
      });
      await chatMessage.save();

      io.emit("receive-message", fullMessage);

      logger.info(`Message from ${user.username}: ${text}`);
    } catch (error) {
      logger.error(`Error saving message from ${userId}: ${error}`);
      socket.emit("chat-error", { message: "Failed to save message." });
    }
  });
};
