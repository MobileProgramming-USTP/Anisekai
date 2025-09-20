import { mutation } from "../_generated/server";

const normalizeEmail = (value) => value.trim().toLowerCase();
const normalizeUsername = (value) => value.trim();

// Register user
export const register = mutation(async ({ db }, { username, email, password }) => {
  const cleanEmail = normalizeEmail(email);
  const cleanUsername = normalizeUsername(username);

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
    createdAt: Date.now(),
  });
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

  return { id: user._id, username: user.username, email: user.email };
});
