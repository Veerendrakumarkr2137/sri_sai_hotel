import { Router } from "express";
import {
  createPhonePePayment,
  getPhonePePaymentStatus,
  handlePhonePeCallback,
} from "../controllers/paymentController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/phonepe", requireAuth("user"), createPhonePePayment);
router.get("/status/:transactionId", requireAuth("user"), getPhonePePaymentStatus);
router.post("/phonepe/callback/:transactionId", handlePhonePeCallback);

export default router;
