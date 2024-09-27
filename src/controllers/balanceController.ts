import { Request, Response } from "express";
import { createCoinPaymentsTransaction } from "../services/coinPaymentsService";
import { updateUserBalance } from "../services/userService";
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
    const amount1 = parseFloat(payload.get("amount1") || "0");

    const existingTransaction = await Transaction.findOne({ txn_id });
    if (existingTransaction) {
      logger.warn(`Transaction with txn_id ${txn_id} already processed`);
      return res.status(200).send("Transaction already processed");
    }

    if (!custom) {
      logger.warn("Missing or invalid user ID in 'custom' field");
      return res.status(400).send("Invalid user ID");
    }

    if (status === 100) {
      await updateUserBalance(custom, amount1, txn_id);
      logger.info(
        `Payment confirmed for user ${custom} with amount ${amount1} on txn_id - ${txn_id}`
      );
      return res.status(200).send("OK");
    } else if (status < 0) {
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
