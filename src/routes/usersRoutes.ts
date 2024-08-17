import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  uploadUserProfileImage,
} from "../controllers/usersController";

const router = Router();

// @route   GET /api/users
// @desc    Get all users
router.get("/", getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get("/:id", getUserById);

// @route   PUT /api/users/:id
// @desc    Update user by ID
router.put("/:id", updateUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user by ID
router.delete("/:id", deleteUserById);

// @route   POST /api/users/:id/upload-profile-image
// @desc    Upload user profile image
router.put("/:id/upload-profile-image", uploadUserProfileImage);

export default router;
