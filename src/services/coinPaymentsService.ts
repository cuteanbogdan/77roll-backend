import axios from "axios";
import crypto from "crypto";
import { findUserById } from "./userService";
import logger from "../config/logger";

const COINPAYMENTS_API_KEY = process.env.COINPAYMENTS_API_KEY || "";
const COINPAYMENTS_API_SECRET = process.env.COINPAYMENTS_API_SECRET || "";

interface CoinPaymentsResponse {
  error: string;
  result: {
    checkout_url: string;
  };
}

interface CoinPaymentsWithdrawalResponse {
  error: string;
  result: {
    id: string;
    status: string;
  };
}

export const createCoinPaymentsTransaction = async (
  userId: string,
  amount: number,
  currency: string
): Promise<string> => {
  const user = await findUserById(userId);
  if (!user || !user.email) {
    throw new Error("User not found or missing email");
  }

  const requestBody = {
    version: "1",
    key: COINPAYMENTS_API_KEY,
    cmd: "create_transaction",
    amount: amount.toString(),
    currency1: "USD",
    currency2: currency,
    custom: userId,
    buyer_email: user.email,
    ipn_url: `${process.env.BASE_URL}/api/balance/coinpayments/webhook`,
  };

  // Generate HMAC signature for authentication
  const hmac = crypto.createHmac("sha512", COINPAYMENTS_API_SECRET);
  hmac.update(new URLSearchParams(requestBody).toString());

  const headers = {
    HMAC: hmac.digest("hex"),
  };

  try {
    // Call CoinPayments API to create a transaction
    const response = await axios.post<CoinPaymentsResponse>(
      "https://www.coinpayments.net/api.php",
      new URLSearchParams(requestBody),
      { headers }
    );

    if (response.data.error !== "ok") {
      throw new Error(response.data.error);
    }

    return response.data.result.checkout_url;
  } catch (error) {
    logger.error("Error creating CoinPayments transaction:", error);
    throw new Error("Failed to create CoinPayments transaction");
  }
};

export const createCoinPaymentsWithdrawal = async (
  userId: string,
  amount: number,
  currency: string,
  address: string
): Promise<CoinPaymentsWithdrawalResponse> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const requestBody = {
    version: "1",
    key: COINPAYMENTS_API_KEY,
    cmd: "create_withdrawal",
    amount: amount.toString(),
    currency,
    currency2: "USD",
    address,
    ipn_url: `${process.env.BASE_URL}/api/balance/coinpayments/webhook`,
  };

  const hmac = crypto.createHmac("sha512", COINPAYMENTS_API_SECRET);
  hmac.update(new URLSearchParams(requestBody).toString());

  const headers = {
    HMAC: hmac.digest("hex"),
  };

  try {
    // Call CoinPayments API to create a withdrawal
    const response = await axios.post<CoinPaymentsWithdrawalResponse>(
      "https://www.coinpayments.net/api.php",
      new URLSearchParams(requestBody),
      { headers }
    );

    if (response.data.error !== "ok") {
      throw new Error(response.data.error);
    }

    return response.data;
  } catch (error) {
    logger.error("Error creating CoinPayments withdrawal:", error);
    throw new Error("Failed to create CoinPayments withdrawal");
  }
};
