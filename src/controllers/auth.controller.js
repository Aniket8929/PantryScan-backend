import User from "../models/User.model.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import sendResponse from "../utils/sendResponse.js";
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    let user = await User.findOne({ email });
    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // ✅ Expiry (10 min)
    const otpExpire = Date.now() + 10 * 60 * 1000;
    if (user) {
      user.otp = otp;
      user.otpExpire = otpExpire;
      await user.save();
    } else {
      user = await User.create({
        email,
        otp,
        otpExpire,
        isVerified: false,
      });
    }
    const isSent = await sendEmail(
      email,
      "Email Verification OTP",
      `Your OTP is: ${otp}`
    );

    if (!isSent) {
      return sendResponse(res, 500, "Failed to send OTP email");
    }
    return sendResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    console.error("❌ OTP Error:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};
export const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!email || !otp) {
      return sendResponse(res, 400, "Email and OTP are required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 400, "User not found");
    }
    if (user.otp !== otp) {
      return sendResponse(res, 400, "Invalid OTP");
    }
    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return sendResponse(res, 400, "OTP expired");
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token);
    return sendResponse(res, 200, "User verified successfully", user);
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "Internal server error");
  }
};

export const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    return sendResponse(res, 200, "Profile fetched", user);
  } catch (error) {
    return sendResponse(res, 500, "Server error");
  }
};
