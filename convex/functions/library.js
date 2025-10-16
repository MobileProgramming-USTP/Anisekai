import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

const DEFAULT_PROGRESS = {
  watchedEpisodes: 0,
  readChapters: 0,
};

const normalizeProgress = (progress) => {
  if (!progress || typeof progress !== "object") {
    return { ...DEFAULT_PROGRESS };
  }

  const watched =
    typeof progress.watchedEpisodes === "number" && Number.isFinite(progress.watchedEpisodes)
      ? Math.max(0, Math.floor(progress.watchedEpisodes))
      : 0;
  const read =
    typeof progress.readChapters === "number" && Number.isFinite(progress.readChapters)
      ? Math.max(0, Math.floor(progress.readChapters))
      : 0;

  return {
    watchedEpisodes: watched,
    readChapters: read,
  };
};

const sanitizeNullableNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const sanitizeNullableString = (value) =>
  typeof value === "string" && value.length > 0 ? value : null;

const normalizeFavoriteMalIds = (favorites) => {
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

const resolveExistingEntry = (db, userId, malId) =>
  db
    .query("libraryEntries")
    .withIndex("byUserMal", (q) => q.eq("userId", userId).eq("malId", malId))
    .unique();

export const list = query(async ({ db }, { userId }) => {
  if (!userId) {
    return [];
  }

  const entries = await db
    .query("libraryEntries")
    .withIndex("byUser", (q) => q.eq("userId", userId))
    .collect();

  return entries
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .map(({ _id, ...rest }) => ({
      ...rest,
      id: _id,
      mal_id: rest.malId,
    }));
});

export const save = mutation(async ({ db }, { userId, entry }) => {
  if (!userId) {
    throw new Error("User is required to save library entries.");
  }
  if (!entry || typeof entry.malId !== "number") {
    throw new Error("A valid entry with malId is required.");
  }

  const now = Date.now();
  const existing = await resolveExistingEntry(db, userId, entry.malId);

  const progress = normalizeProgress(entry.progress);
  const baseDocument = {
    userId,
    malId: entry.malId,
    scope: entry.scope || "anime",
    status: entry.status || "watching",
    title: entry.title || "Untitled",
    coverImage: sanitizeNullableString(entry.coverImage),
    score: sanitizeNullableNumber(entry.score),
    episodes: sanitizeNullableNumber(entry.episodes),
    chapters: sanitizeNullableNumber(entry.chapters),
    progress,
    rating: sanitizeNullableNumber(entry.rating),
    raw: entry.raw ?? null,
    updatedAt: now,
  };

  if (existing) {
    await db.patch(existing._id, {
      ...baseDocument,
      createdAt: existing.createdAt ?? now,
    });
    return existing._id;
  }

  return await db.insert("libraryEntries", {
    ...baseDocument,
    createdAt: now,
  });
});

export const updateStatus = mutation(async ({ db }, { userId, malId, status }) => {
  if (!userId || typeof malId !== "number") {
    throw new Error("User and malId are required to update status.");
  }

  const existing = await resolveExistingEntry(db, userId, malId);
  if (!existing) {
    throw new Error("Entry not found for user.");
  }

  await db.patch(existing._id, {
    status: status || existing.status,
    updatedAt: Date.now(),
  });

  return existing._id;
});

export const updateProgress = mutation(
  async ({ db }, { userId, malId, value, type = "episodes" }) => {
    if (!userId || typeof malId !== "number") {
      throw new Error("User and malId are required to update progress.");
    }

    const existing = await resolveExistingEntry(db, userId, malId);
    if (!existing) {
      throw new Error("Entry not found for user.");
    }

    const sanitizedValue =
      typeof value === "number" && Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : 0;

    const nextProgress = normalizeProgress(existing.progress);
    if (type === "chapters") {
      nextProgress.readChapters = sanitizedValue;
    } else {
      nextProgress.watchedEpisodes = sanitizedValue;
    }

    await db.patch(existing._id, {
      progress: nextProgress,
      updatedAt: Date.now(),
    });

    return existing._id;
  }
);

export const updateRating = mutation(async ({ db }, { userId, malId, rating }) => {
  if (!userId || typeof malId !== "number") {
    throw new Error("User and malId are required to update rating.");
  }

  const existing = await resolveExistingEntry(db, userId, malId);
  if (!existing) {
    throw new Error("Entry not found for user.");
  }

  const sanitizedRating =
    typeof rating === "number" && Number.isFinite(rating) && rating >= 0
      ? Math.min(10, Math.round(rating * 10) / 10)
      : null;

  await db.patch(existing._id, {
    rating: sanitizedRating,
    updatedAt: Date.now(),
  });

  return existing._id;
});

export const remove = mutation(async ({ db }, { userId, malId }) => {
  if (!userId || typeof malId !== "number") {
    throw new Error("User and malId are required to remove an entry.");
  }

  const existing = await resolveExistingEntry(db, userId, malId);
  if (!existing) {
    return null;
  }

  await db.delete(existing._id);
  return existing._id;
});

export const updateFavorites = mutation({
  args: {
    userId: v.id("users"),
    favorites: v.array(v.number()),
  },
  handler: async ({ db }, { userId, favorites }) => {
    const user = await db.get(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const sanitizedFavorites = normalizeFavoriteMalIds(favorites);

    await db.patch(userId, {
      favorites: sanitizedFavorites,
      updatedAt: Date.now(),
    });

    return sanitizedFavorites;
  },
});
