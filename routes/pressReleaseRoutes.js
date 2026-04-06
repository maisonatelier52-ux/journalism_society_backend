// routes/pressReleaseRoutes.js
import express from "express";
import PressRelease from "../models/PressRelease.js";

const router = express.Router();

// Get all press releases (public)
router.get("/", async (req, res) => {
  try {
    const { category, tag } = req.query;
    let filter = {};
    
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    
    const releases = await PressRelease.find(filter)
      .sort({ date: -1 })
      .select("-__v");
    
    res.json({ success: true, releases });
  } catch (error) {
    console.error("Error fetching press releases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single press release
router.get("/:id", async (req, res) => {
  try {
    const release = await PressRelease.findById(req.params.id).select("-__v");
    if (!release) {
      return res.status(404).json({ success: false, message: "Press release not found" });
    }
    res.json({ success: true, release });
  } catch (error) {
    console.error("Error fetching press release:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;