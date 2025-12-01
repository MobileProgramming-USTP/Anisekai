import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    watchedEpisodes: { type: Number, default: 0 },
    readChapters: { type: Number, default: 0 },
  },
  { _id: false }
);

const libraryEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    malId: { type: Number, required: true },
    status: {
      type: String,
      enum: ["watching", "completed", "watchlist", "dropped"],
      default: "watching",
    },
    scope: { type: String, enum: ["anime", "manga"], default: "anime" },
    title: { type: String, required: true },
    coverImage: { type: String, default: null },
    score: { type: Number, default: null },
    episodes: { type: Number, default: null },
    chapters: { type: Number, default: null },
    progress: { type: progressSchema, default: () => ({ watchedEpisodes: 0, readChapters: 0 }) },
    rating: { type: Number, default: null },
    raw: { type: mongoose.Schema.Types.Mixed, default: null },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  { timestamps: false }
);

libraryEntrySchema.index({ user: 1, malId: 1 }, { unique: true });

const LibraryEntry = mongoose.model("LibraryEntry", libraryEntrySchema);

export default LibraryEntry;
