import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import logger from "../config/logger";
import { generateToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.warn(`User registration failed - Email already in use: ${email}`);
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString());

    res.cookie("roulette-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error(`User registration error: ${error}`);
    res.status(500).json({ message: "Server error", error });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login failed - Invalid credentials: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed - Invalid credentials: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    res.cookie("roulette-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    logger.error(`Login error: ${error}`);
    res.status(500).json({ message: "Server error", error });
  }
};

const logout = (req: Request, res: Response) => {
  res.clearCookie("roulette-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  logger.info("User logged out successfully");
  res.status(200).json({ message: "Logout successful" });
};

const checkAuth = async (req: Request, res: Response) => {
  const token = req.cookies["roulette-token"];
  if (!token) {
    logger.warn("Authentication check failed - No token provided");
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTSecretKey!) as JwtPayload;
    const user = await User.findById(decoded.user.id);
    if (!user) {
      logger.warn(
        `Authentication check failed - No User for ID: ${decoded.user.id}`
      );
      return res.status(401).json({ isAuthenticated: false });
    }
    logger.info(`User auth check successfully: ${user.email}`);
    res.status(200).json({ isAuthenticated: true });
  } catch (error) {
    logger.error(`Authentication check error: ${error}`);
    res.status(401).json({ isAuthenticated: false });
  }
};

export { register, login, logout, checkAuth };
