import jwt from "jsonwebtoken";
import User from "../models/product.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });
    }
    try {
      const decoded = jwt.verify(id, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.user = user;
      next();
    } catch (error) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    return res.status(401).json({ message: "Unauthorized - invalid token" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
};
