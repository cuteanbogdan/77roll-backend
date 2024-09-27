import axios from "axios";
import crypto from "crypto";
import { findUserById } from "./userService";

const COINPAYMENTS_API_KEY = process.env.COINPAYMENTS_API_KEY || "";
const COINPAYMENTS_API_SECRET = process.env.COINPAYMENTS_API_SECRET || "";

interface CoinPaymentsResponse {
  error: string;
  result: {
    checkout_url: string;
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
    console.error("Error creating CoinPayments transaction:", error);
    throw new Error("Failed to create CoinPayments transaction");
  }
};
