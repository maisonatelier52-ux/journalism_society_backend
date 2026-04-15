// routes/correctionRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import Correction from "../models/Correction.js";
import Flag from "../models/Flag.js";
import Docket from "../models/Docket.js";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// ── JWT MIDDLEWARE ────────────────────────────────────────────────────────────
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ── ACTIVITY LOG HELPER ───────────────────────────────────────────────────────
const logActivity = (action, entityType, entityId, entityTitle, entitySubtitle = "") => {
  ActivityLog.create({
    action,
    entityType,
    entityId: String(entityId),
    entityTitle: entityTitle || "Untitled",
    entitySubtitle,
  }).catch((err) => console.error("Activity log error:", err));
};

// ============================================================
//  PUBLIC — Get all corrections (for corrections page)
// ============================================================
// GET /api/corrections?docketId=xxx&limit=20&page=1
router.get("/", async (req, res) => {
  try {
    const { docketId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (docketId) filter.docketId = docketId;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Correction.countDocuments(filter);

    const corrections = await Correction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      corrections,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching corrections:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  PUBLIC — Get corrections for a specific docket
// ============================================================
router.get("/by-docket/:docketId", async (req, res) => {
  try {
    const corrections = await Correction.find({ docketId: req.params.docketId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, corrections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  ADMIN — Create a correction manually
// ============================================================
// POST /api/corrections/admin
router.post("/admin", verifyAdminToken, async (req, res) => {
  try {
    const { docketId, type, description, sourceFlagId } = req.body;

    if (!docketId || !description) {
      return res.status(400).json({
        success: false,
        message: "docketId and description are required",
      });
    }

    const docket = await Docket.findById(docketId).lean();
    if (!docket) {
      return res.status(404).json({ success: false, message: "Docket not found" });
    }

    let sourceFlagNumber = "";
    if (sourceFlagId) {
      const flag = await Flag.findById(sourceFlagId).lean();
      if (flag) sourceFlagNumber = flag.flagId;
    }

    const correction = await Correction.create({
      docketId,
      docketNumber: docket.docketId,
      docketTitle: docket.response?.title || docket.title || "",
      type: type || "Correction",
      description: description.trim(),
      sourceFlagId: sourceFlagId || null,
      sourceFlagNumber,
      createdBy: "admin",
    });

    logActivity(
      "created",
      "correction",
      correction._id,
      `Correction on ${docket.docketId}`,
      type || "Correction"
    );

    res.status(201).json({
      success: true,
      message: "Correction logged successfully",
      correction,
    });
  } catch (error) {
    console.error("Error creating correction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  ADMIN — Resolve a flag AND create a correction in one step
// ============================================================
// POST /api/corrections/admin/resolve-flag/:flagId
router.post("/admin/resolve-flag/:flagId", verifyAdminToken, async (req, res) => {
  try {
    const { type, description, resolution, adminNotes } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "description (what was corrected) is required",
      });
    }

    const flag = await Flag.findById(req.params.flagId);
    if (!flag) {
      return res.status(404).json({ success: false, message: "Flag not found" });
    }

    const docket = await Docket.findById(flag.docketId).lean();
    if (!docket) {
      return res.status(404).json({ success: false, message: "Docket not found" });
    }

    // 1. Create the correction log entry
    const correction = await Correction.create({
      docketId: flag.docketId,
      docketNumber: flag.docketNumber,
      docketTitle: flag.docketTitle || docket.response?.title || "",
      type: type || "Correction",
      description: description.trim(),
      sourceFlagId: flag._id,
      sourceFlagNumber: flag.flagId,
      createdBy: "admin",
    });

    // 2. Mark the flag as resolved
    flag.status = "resolved";
    flag.resolution = resolution || description.trim();
    flag.adminNotes = adminNotes || flag.adminNotes || "";
    flag.reviewedAt = new Date();
    await flag.save();

    logActivity(
      "created",
      "correction",
      correction._id,
      `Correction on ${flag.docketNumber}`,
      `From flag ${flag.flagId}`
    );

    res.status(201).json({
      success: true,
      message: "Flag resolved and correction logged",
      correction,
      flag,
    });
  } catch (error) {
    console.error("Error resolving flag with correction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  ADMIN — Delete a correction
// ============================================================
router.delete("/admin/:id", verifyAdminToken, async (req, res) => {
  try {
    const correction = await Correction.findById(req.params.id);
    if (!correction) {
      return res.status(404).json({ success: false, message: "Correction not found" });
    }
    await Correction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Correction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  ADMIN — List all corrections (admin panel view)
// ============================================================
router.get("/admin", verifyAdminToken, async (req, res) => {
  try {
    const { docketId, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (docketId) filter.docketId = docketId;
    if (type && type !== "all") filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Correction.countDocuments(filter);

    const corrections = await Correction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      corrections,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;