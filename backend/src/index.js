import "dotenv/config";
import cors from "cors";
import express from "express";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple root responder so hitting "/" doesn't return 404 (useful for uptime checks)
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Anisekai API", docs: "/api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/library", libraryRoutes);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
