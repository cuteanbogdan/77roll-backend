import { server } from "./app";
import connectDB from "./config/db";
import logger from "./config/logger";
import { Server } from "socket.io";
import { setupSockets } from "./sockets/setupSockets";

const PORT = process.env.PORT || 8080;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

connectDB()
  .then(() => {
    setupSockets(io);
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to connect to the database:", error);
  });
