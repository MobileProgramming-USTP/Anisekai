import express from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../lib/auth.js";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeFavorites = (favorites) => {
  if (!Array.isArray(favorites)) {
    return [];
  }

  const seen = new Set();
  return favorites.reduce((acc, value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && !seen.has(numeric)) {
      seen.add(numeric);
      acc.push(numeric);
    }
    return acc;
  }, []);
};

const normalizeUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar || user.profileImage || null,
  favorites: sanitizeFavorites(user.favorites),
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (username.length < 5) {
      return res.status(400).json({ message: "Username must be at least 5 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const avatar = `https://api.dicebear.com/6.x/micah/svg?seed=${encodeURIComponent(username)}`;

    const user = new User({
      username,
      email,
      password,
      avatar,
      profileImage: avatar,
      favorites: [],
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    console.log("Error during registration:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password } = req.body || {};
    const lookupValue = identifier || email;

    if (!lookupValue || !password) {
      return res.status(400).json({ message: "Email or username and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: lookupValue }, { username: lookupValue }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      token,
      user: normalizeUserResponse(user),
    });
  } catch (error) {
    console.log("Error in login route:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    return res.json({ user: normalizeUserResponse(req.user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", details: error.message });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, avatar } = req.body || {};
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const usernameInUse = await User.findOne({ username, _id: { $ne: req.userId } });
      if (usernameInUse) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ email, _id: { $ne: req.userId } });
      if (emailInUse) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (typeof avatar !== "undefined") {
      user.avatar = avatar ? avatar.trim() : "";
      user.profileImage = user.avatar;
    }

    await user.save();

    return res.json({ user: normalizeUserResponse(user) });
  } catch (error) {
    console.log("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile", details: error.message });
  }
});

router.patch("/favorites", authMiddleware, async (req, res) => {
  try {
    const favorites = sanitizeFavorites(req.body?.favorites);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.favorites = favorites;
    await user.save();

    return res.json({ favorites });
  } catch (error) {
    console.log("Error updating favorites:", error);
    return res.status(500).json({ message: "Failed to update favorites", details: error.message });
  }
});

export default router;

