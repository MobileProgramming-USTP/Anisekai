import jwt from "jsonwebtoken";
import User from "../models/User.js";

const AUTH_HEADER_PREFIX = "Bearer ";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith(AUTH_HEADER_PREFIX)
    ? authHeader.slice(AUTH_HEADER_PREFIX.length)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", details: error.message });
  }
};

export default authMiddleware;
