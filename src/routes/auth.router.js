import { Router } from "express";
import { sendOTP, verifyOTP, profile } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// send OTP
router.post("/send-otp", sendOTP);

// verify OTP
router.post("/verify-otp", verifyOTP);

// verify user
router.get("/profile", authMiddleware, profile);
export default router;
