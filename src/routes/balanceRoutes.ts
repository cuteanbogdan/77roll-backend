import { Router } from "express";
import {
  createDeposit,
  createWithdrawal,
} from "../controllers/balanceController";
import { handleCoinPaymentsWebhook } from "../controllers/balanceController";

const router = Router();

// @route   POST /api/balance/create
// @desc    Create a new deposit transaction
router.post("/create", createDeposit);

// @route   POST /api/balance/withdraw
// @desc    Create a new withdraw transaction
router.post("/withdraw", createWithdrawal);

// @route   POST /api/balance/coinpayments/webhook
// @desc    Handle the CoinPayments webhook for payment confirmation
router.post("/coinpayments/webhook", handleCoinPaymentsWebhook);

export default router;
