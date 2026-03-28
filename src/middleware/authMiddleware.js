import sendResponse from "../utils/sendResponse.js";
import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  try {
    console.log(req.cookies);
    const token = req.cookies?.token;
    if (!token) {
      return sendResponse(res, 401, "Unauthorized access");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 401, "Invalid or expired token");
  }
}

export default authMiddleware;
