
// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import docketRoutes from "./routes/docketRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import pressReleaseRoutes from "./routes/pressReleaseRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import flagRoutes from "./routes/flagRoutes.js"
import correctionRoutes from "./routes/correctionRoutes.js"; 
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: Serve uploaded files statically
// This makes files available at /uploads/submissions/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/dockets", docketRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/press-releases", pressReleaseRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/flags", flagRoutes);
app.use("/api/corrections", correctionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});