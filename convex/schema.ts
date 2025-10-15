import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    password: v.string(),
    createdAt: v.number(),
  })
    .index("byEmail", ["email"])
    .index("byUsername", ["username"]),
  libraryEntries: defineTable({
    userId: v.id("users"),
    malId: v.number(),
    scope: v.string(),
    status: v.string(),
    title: v.string(),
    coverImage: v.union(v.null(), v.string()),
    score: v.union(v.null(), v.number()),
    episodes: v.union(v.null(), v.number()),
    chapters: v.union(v.null(), v.number()),
    progress: v.object({
      watchedEpisodes: v.number(),
      readChapters: v.number(),
    }),
    rating: v.union(v.null(), v.number()),
    raw: v.union(v.null(), v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUser", ["userId"])
    .index("byUserMal", ["userId", "malId"]),
});
