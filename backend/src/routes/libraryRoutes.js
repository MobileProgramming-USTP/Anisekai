import express from "express";
import authMiddleware from "../lib/auth.js";
import LibraryEntry from "../models/LibraryEntry.js";

const router = express.Router();

const sanitizeCount = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.floor(numeric));
};

const sanitizeNullableNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const sanitizeProgress = (progress = {}) => ({
  watchedEpisodes: sanitizeCount(progress.watchedEpisodes),
  readChapters: sanitizeCount(progress.readChapters),
});

const serializeEntry = (entry) => ({
  id: entry?._id,
  mal_id: entry?.malId,
  malId: entry?.malId,
  status: entry?.status,
  scope: entry?.scope,
  title: entry?.title,
  coverImage: entry?.coverImage ?? null,
  score: sanitizeNullableNumber(entry?.score),
  episodes: sanitizeNullableNumber(entry?.episodes),
  chapters: sanitizeNullableNumber(entry?.chapters),
  progress: sanitizeProgress(entry?.progress),
  rating: sanitizeNullableNumber(entry?.rating),
  raw: entry?.raw ?? null,
  updatedAt: entry?.updatedAt ?? Date.now(),
});

const resolveMalId = (value) => {
  const malId = Number(value);
  return Number.isFinite(malId) ? malId : null;
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await LibraryEntry.find({ user: req.userId }).sort({ updatedAt: -1 });
    return res.json(entries.map(serializeEntry));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch library entries", details: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = req.body?.entry ?? req.body ?? {};
    const malId = resolveMalId(payload.malId ?? payload.mal_id);

    if (malId == null) {
      return res.status(400).json({ message: "A valid MAL id is required" });
    }

    const update = {
      user: req.userId,
      malId,
      status: payload.status || "watching",
      scope: payload.scope || "anime",
      title: payload.title || "Untitled",
      coverImage: payload.coverImage ?? null,
      score: sanitizeNullableNumber(payload.score),
      episodes: sanitizeNullableNumber(payload.episodes),
      chapters: sanitizeNullableNumber(payload.chapters),
      progress: sanitizeProgress(payload.progress),
      rating: sanitizeNullableNumber(payload.rating),
      raw: payload.raw ?? null,
      updatedAt: Date.now(),
    };

    const entry = await LibraryEntry.findOneAndUpdate(
      { user: req.userId, malId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(serializeEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: "Failed to save library entry", details: error.message });
  }
});

router.delete("/:malId", authMiddleware, async (req, res) => {
  try {
    const malId = resolveMalId(req.params.malId);
    if (malId == null) {
      return res.status(400).json({ message: "A valid MAL id is required" });
    }

    await LibraryEntry.deleteOne({ user: req.userId, malId });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove library entry", details: error.message });
  }
});

router.patch("/:malId/status", authMiddleware, async (req, res) => {
  try {
    const malId = resolveMalId(req.params.malId);
    const { status } = req.body || {};

    if (malId == null) {
      return res.status(400).json({ message: "A valid MAL id is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "A status value is required" });
    }

    const entry = await LibraryEntry.findOneAndUpdate(
      { user: req.userId, malId },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    return res.json(serializeEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status", details: error.message });
  }
});

router.patch("/:malId/progress", authMiddleware, async (req, res) => {
  try {
    const malId = resolveMalId(req.params.malId);
    const { type = "episodes", value } = req.body || {};

    if (malId == null) {
      return res.status(400).json({ message: "A valid MAL id is required" });
    }

    const entry = await LibraryEntry.findOne({ user: req.userId, malId });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const progress = sanitizeProgress(entry.progress);
    if (type === "chapters") {
      progress.readChapters = sanitizeCount(value);
    } else {
      progress.watchedEpisodes = sanitizeCount(value);
    }

    entry.progress = progress;
    entry.updatedAt = Date.now();
    await entry.save();

    return res.json(serializeEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update progress", details: error.message });
  }
});

router.patch("/:malId/rating", authMiddleware, async (req, res) => {
  try {
    const malId = resolveMalId(req.params.malId);
    const ratingValue = sanitizeNullableNumber(req.body?.rating);

    if (malId == null) {
      return res.status(400).json({ message: "A valid MAL id is required" });
    }

    const entry = await LibraryEntry.findOne({ user: req.userId, malId });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    entry.rating = ratingValue != null ? Math.min(10, Math.max(0, ratingValue)) : null;
    entry.updatedAt = Date.now();
    await entry.save();

    return res.json(serializeEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update rating", details: error.message });
  }
});

router.post("/reset", authMiddleware, async (req, res) => {
  try {
    await LibraryEntry.deleteMany({ user: req.userId });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reset library", details: error.message });
  }
});

export default router;
