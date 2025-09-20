import { mutation } from "../_generated/server";

// Register user
export const register = mutation(async ({ db }, { username, email, password }) => {
  // Check if email already exists
  const existing = await db
    .query("users")
    .filter((q) => q.eq(q.field("email"), email))
    .unique();
  if (existing) throw new Error("Email already in use");

  return await db.insert("users", {
    username,
    email,
    password, // For production, hash this!
    createdAt: Date.now(),
  });
});

// Login user
export const login = mutation(async ({ db }, { identifier, password }) => {
  const user = await db
    .query("users")
    .filter((q) =>
      q.or(
        q.eq(q.field("email"), identifier),
        q.eq(q.field("username"), identifier)
      )
    )
    .unique();

  if (!user) throw new Error("User not found");
  if (user.password !== password) throw new Error("Invalid password");

  return { id: user._id, username: user.username, email: user.email };
});
