import { Router } from "express";
import {
  register,
  login,
  logout,
  checkAuth,
} from "../controllers/authController";

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user and return token
router.post("/login", login);

// @route   POST /api/auth/logout
// @desc    Logout user and clear token
router.post("/logout", logout);

// @route   GET /api/auth/check
// @desc    Check if user is authenticated
router.get("/check", checkAuth);

export default router;
