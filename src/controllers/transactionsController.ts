import { Request, Response } from "express";
import logger from "../config/logger";
import Transaction from "../models/Transaction";
import User from "../models/User";

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    if (!transactions.length) {
      logger.warn(`No transactions found for user with id: ${userId}`);
      return res.status(404).json({ message: "No transactions found" });
    }

    logger.info(`Fetched transactions for user with id: ${userId}`);
    res.json(transactions);
  } catch (error) {
    logger.error(
      `Error fetching transactions for user with id: ${req.params.userId}`,
      { error }
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      logger.warn(`Transaction not found with id: ${req.params.id}`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(`Fetched transaction with id: ${req.params.id}`);
    res.json(transaction);
  } catch (error) {
    logger.error(`Error fetching transaction with id: ${req.params.id}`, {
      error,
    });
    res.status(500).json({ message: "Server error" });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { userId, type, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found with id: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const newTransaction = new Transaction({
      userId,
      type,
      amount,
      date: new Date(),
    });

    const savedTransaction = await newTransaction.save();

    logger.info(`Created new transaction for user with id: ${userId}`);
    res.status(201).json(savedTransaction);
  } catch (error) {
    logger.error("Error creating transaction", { error });
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTransactionById = async (req: Request, res: Response) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTransaction) {
      logger.warn(`Transaction not found with id: ${req.params.id}`);
      return res.status(404).json({ message: "Transaction not found" });
    }

    logger.info(`Deleted transaction with id: ${req.params.id}`);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    logger.error(`Error deleting transaction with id: ${req.params.id}`, {
      error,
    });
    res.status(500).json({ message: "Server error" });
  }
};
