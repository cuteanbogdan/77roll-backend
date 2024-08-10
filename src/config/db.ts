import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  logger.error("MONGO_URI is not defined in the environment variables");
  throw new Error("MONGO_URI is not defined in the environment variables");
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {});
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("connected", () => {
    logger.info("Mongoose connected to DB");
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("Mongoose disconnected from DB");
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("Mongoose connection closed on app termination");
    process.exit(0);
  });
};

export default connectDB;
