import { Router } from "express";
import { verifyFairness } from "../controllers/fairnessController";

const router = Router();

// @route   POST /api/fairness/verify-fairness
// @desc    Verify the fairness of a roulette result
router.post("/verify-fairness", verifyFairness);

export default router;
