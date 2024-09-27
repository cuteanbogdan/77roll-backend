import { Router } from "express";
import { createDeposit } from "../controllers/balanceController";
import { handleCoinPaymentsWebhook } from "../controllers/balanceController";

const router = Router();

// @route   POST /api/balance/create
// @desc    Create a new deposit transaction
router.post("/create", createDeposit);

// @route   POST /api/balance/coinpayments/webhook
// @desc    Handle the CoinPayments webhook for payment confirmation
router.post("/coinpayments/webhook", handleCoinPaymentsWebhook);

export default router;
