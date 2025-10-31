import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

function generateTokens(id) {
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}

async function storeRefreshToken(id, refreshToken) {
  await redis.set(`refreshToken ${id}`, refreshToken, { ex: 7 * 24 * 60 * 60 });
}

function setCookies(res, accessToken, refreshToken) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
export const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while signing up", error: error.message });
  }
};
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json(
        {
          user: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { message: "logged in successfully" }
      );
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while logging in", error: error.message });
  }
  res.send("login route");
};
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refreshToken ${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while logging out: ",
        error: error.message,
      });
  }
};
