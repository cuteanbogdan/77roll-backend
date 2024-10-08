import { Request, Response } from "express";
import {
  createCoinPaymentsTransaction,
  createCoinPaymentsWithdrawal,
} from "../services/coinPaymentsService";
import { findUserById, updateUserBalance } from "../services/userService";
import logger from "../config/logger";
import crypto from "crypto";
import Transaction from "../models/Transaction";

// Controller to handle deposit creation
export const createDeposit = async (req: Request, res: Response) => {
  try {
    const { userId, amount, currency } = req.body;

    if (!userId || !amount || !currency) {
      logger.warn("Missing or invalid parameters in create deposit request");
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    // Create a CoinPayments transaction
    const checkout_url = await createCoinPaymentsTransaction(
      userId,
      amount,
      currency
    );

    logger.info(
      `Deposit created for user ${userId} with amount ${amount}$ in ${currency}`
    );

    // Return the payment URL so the user can complete the transaction
    res.json({ checkout_url: checkout_url });
  } catch (error) {
    logger.error("Error creating deposit", { error });
    res.status(500).json({ message: "Failed to create deposit" });
  }
};

export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const { userId, amount, currency, address } = req.body;

    if (!userId || !amount || !currency || !address) {
      logger.warn("Missing or invalid parameters in create withdrawal request");
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    const user = await findUserById(userId);
    if (!user || user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const result = await createCoinPaymentsWithdrawal(
      userId,
      amount,
      currency,
      address
    );
    await updateUserBalance(
      userId,
      amount,
      null,
      "withdrawal",
      result.result.id
    );

    logger.info(
      `Withdrawal created for user ${userId} with amount ${amount}$ in ${currency}`
    );
    res.json({ message: "Withdrawal initiated successfully", result });
  } catch (error) {
    logger.error("Error creating withdrawal", { error });
    res.status(500).json({ message: "Failed to create withdrawal" });
  }
};

export const handleCoinPaymentsWebhook = async (
  req: Request,
  res: Response
) => {
  const hmac = req.headers["hmac"] as string;
  const ipnSecret = process.env.COINPAYMENTS_IPN_SECRET || "";

  if (!hmac) {
    logger.warn("Missing HMAC signature in headers");
    return res.status(400).send("Missing HMAC signature");
  }

  try {
    const rawBody = req.body;

    // Generate HMAC using the raw body
    const hmacHash = crypto
      .createHmac("sha512", ipnSecret)
      .update(rawBody)
      .digest("hex");

    if (hmac !== hmacHash) {
      logger.warn("Invalid HMAC signature for webhook request");
      return res.status(400).send("Invalid HMAC signature");
    }

    const payload = new URLSearchParams(rawBody.toString("utf8"));

    const status = parseInt(payload.get("status") || "0", 10);
    const custom = payload.get("custom") || "";
    const txn_id = payload.get("txn_id") || "";
    const amount1 = parseFloat(payload.get("amount1") || "0"); // for deposit
    const amount = parseFloat(payload.get("amount") || "0"); // for withdraw
    const ipn_type = payload.get("ipn_type") || "";
    const withdrawal_id = payload.get("id") || "";

    const existingTransaction = await Transaction.findOne({ txn_id });
    if (existingTransaction) {
      logger.warn(`Transaction with txn_id ${txn_id} already processed`);
      return res.status(200).send("Transaction already processed");
    }

    if (!custom && ipn_type === "deposit") {
      logger.warn("Missing or invalid user ID in 'custom' field");
      return res.status(400).send("Invalid user ID");
    }

    if (ipn_type === "deposit") {
      if (status === 100) {
        await updateUserBalance(custom, amount1, txn_id, "deposit");
        logger.info(
          `Deposit confirmed for user ${custom} with amount ${amount1} on txn_id - ${txn_id}`
        );
        return res.status(200).send("OK");
      }
    } else if (ipn_type === "withdrawal") {
      if (status === 2) {
        const result = await Transaction.updateOne(
          { withdrawal_id: withdrawal_id, type: "Withdrawal" },
          { txn_id: txn_id }
        );

        if (result.modifiedCount === 0) {
          logger.warn(
            `No transaction found for withdrawal_id ${withdrawal_id}`
          );
          return res
            .status(400)
            .send(`Transaction not found for withdrawal_id ${withdrawal_id}`);
        }

        logger.info(
          `Withdrawal confirmed withdrawal ID - ${withdrawal_id} with amount ${amount} on txn_id - ${txn_id}`
        );
        return res.status(200).send("OK");
      }
    }

    if (status < 0) {
      logger.warn(`Payment error for user ${custom} on txn_id - ${txn_id}`);
      return res.status(400).send("Payment error");
    } else {
      logger.warn(`Payment pending for user ${custom} on txn_id - ${txn_id}`);
      return res.status(400).send("Payment pending");
    }
  } catch (error) {
    logger.error("Error processing CoinPayments webhook", { error });
    return res.status(500).send("Server error");
  }
};
