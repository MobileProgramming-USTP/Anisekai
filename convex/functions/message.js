import { query, mutation } from "../_generated/server";

// Fetch messages
export const getMessages = query(async ({ db }) => {
  return await db.query("messages").collect();
});

// Add a message
export const addMessage = mutation(async ({ db }, { body }) => {
  return await db.insert("messages", { body, createdAt: Date.now() });
});
