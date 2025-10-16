import { mutation } from "../_generated/server";
import { v } from "convex/values";

const normalizeEmail = (value = "") => value.trim().toLowerCase();
const normalizeUsername = (value = "") => value.trim();
const sanitizeAvatar = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};
const normalizeFavorites = (favorites) => {
  if (!Array.isArray(favorites)) {
    return [];
  }
  const seen = new Set();
  const sanitized = [];
  for (const entry of favorites) {
    const numeric =
      typeof entry === "number" && Number.isFinite(entry)
        ? entry
        : Number(entry);
    if (Number.isFinite(numeric) && !seen.has(numeric)) {
      seen.add(numeric);
      sanitized.push(numeric);
    }
  }
  return sanitized;
};

// Register user
export const register = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async ({ db }, { username, email, password }) => {
    const cleanEmail = normalizeEmail(email);
    const cleanUsername = normalizeUsername(username);
    const now = Date.now();

    const existingEmail = await db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", cleanEmail))
      .unique();
    if (existingEmail) throw new Error("Email already in use");

    const existingUsername = await db
      .query("users")
      .withIndex("byUsername", (q) => q.eq("username", cleanUsername))
      .unique();
    if (existingUsername) throw new Error("Username already in use");

    return await db.insert("users", {
      username: cleanUsername,
      email: cleanEmail,
      password, // For production, hash this!
      avatar: null,
      favorites: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Login user
export const login = mutation(async ({ db }, { identifier, password }) => {
  const cleanIdentifier = identifier.trim();
  const lookup = cleanIdentifier.toLowerCase();

  const user = await (cleanIdentifier.includes("@")
    ? db.query("users").withIndex("byEmail", (q) => q.eq("email", lookup)).unique()
    : db.query("users").withIndex("byUsername", (q) => q.eq("username", cleanIdentifier)).unique());

  if (!user) throw new Error("User not found");
  if (user.password !== password) throw new Error("Invalid password");

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: sanitizeAvatar(user.avatar),
    favorites: normalizeFavorites(user.favorites),
  };
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.union(v.null(), v.string())),
  },
  handler: async ({ db }, { userId, username, email, avatar }) => {
    const user = await db.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const updates = {};
    if (typeof username === "string") {
      const cleanUsername = normalizeUsername(username);
      if (!cleanUsername) {
        throw new Error("Username cannot be empty.");
      }
      if (cleanUsername !== user.username) {
        const existingUsername = await db
          .query("users")
          .withIndex("byUsername", (q) => q.eq("username", cleanUsername))
          .unique();
        if (existingUsername && existingUsername._id !== userId) {
          throw new Error("Username already in use.");
        }
        updates.username = cleanUsername;
      }
    }

    if (typeof email === "string") {
      const cleanEmail = normalizeEmail(email);
      if (!cleanEmail) {
        throw new Error("Email cannot be empty.");
      }
      if (cleanEmail !== user.email) {
        const existingEmail = await db
          .query("users")
          .withIndex("byEmail", (q) => q.eq("email", cleanEmail))
          .unique();
        if (existingEmail && existingEmail._id !== userId) {
          throw new Error("Email already in use.");
        }
        updates.email = cleanEmail;
      }
    }

    if (avatar !== undefined) {
      updates.avatar = sanitizeAvatar(avatar);
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await db.patch(userId, updates);
    }

    const nextUser = await db.get(userId);
    return {
      id: nextUser._id,
      username: nextUser.username,
      email: nextUser.email,
      avatar: sanitizeAvatar(nextUser.avatar),
      favorites: normalizeFavorites(nextUser.favorites),
    };
  },
});
