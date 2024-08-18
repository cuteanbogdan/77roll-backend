import { Router } from "express";
import {
  getUserTransactions,
  createTransaction,
  getTransactionById,
  deleteTransactionById,
} from "../controllers/transactionsController";

const router = Router();

// @route   GET /api/transactions/user/:userId
// @desc    Get all transactions for a user
router.get("/user/:userId", getUserTransactions);

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
router.get("/:id", getTransactionById);

// @route   POST /api/transactions
// @desc    Create a new transaction
router.post("/", createTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction by ID
router.delete("/:id", deleteTransactionById);

export default router;
