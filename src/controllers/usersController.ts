import { Request, Response } from "express";
import logger from "../config/logger";
import User from "../models/User";
import { findUserById } from "../services/userService";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    logger.info("Fetched all users");
    res.json(users);
  } catch (error) {
    logger.error("Error fetching users", { error });
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      logger.warn(`User not found with id: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    logger.info(`Fetched user with id: ${req.params.id}`);
    res.json(user);
  } catch (error) {
    logger.error(`Error fetching user with id: ${req.params.id}`, { error });
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserById = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      logger.warn(`User not found with id: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    logger.info(`Updated user with id: ${req.params.id}`);
    res.json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user with id: ${req.params.id}`, { error });
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      logger.warn(`User not found with id: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    logger.info(`Deleted user with id: ${req.params.id}`);
    res.json({ message: "User deleted" });
  } catch (error) {
    logger.error(`Error deleting user with id: ${req.params.id}`, { error });
    res.status(500).json({ message: "Server error" });
  }
};
