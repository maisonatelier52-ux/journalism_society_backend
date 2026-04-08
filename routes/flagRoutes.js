// routes/flagRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import Flag from "../models/Flag.js";
import Docket from "../models/Docket.js";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// ============ JWT MIDDLEWARE ============
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

// ============ ACTIVITY LOG HELPER ============
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
//  PUBLIC ROUTE — Users submit a flag error
// ============================================================
// POST /api/flags
router.post("/", async (req, res) => {
  try {
    const { docketId, category, description, contactEmail } = req.body;

    if (!docketId || !description) {
      return res.status(400).json({
        success: false,
        message: "docketId and description are required",
      });
    }

    // Look up the docket to capture number + title
    const docket = await Docket.findById(docketId).lean();
    if (!docket) {
      return res.status(404).json({ success: false, message: "Docket not found" });
    }

    const flag = await Flag.create({
      docketId,
      docketNumber: docket.docketId,
      docketTitle: docket.response?.title || docket.title || "",
      category: category || "Factual Error",
      description: description.trim(),
      contactEmail: contactEmail?.trim() || "",
      status: "pending",
      reportedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Flag submitted successfully. Our editorial team will review it.",
      flagId: flag.flagId,
    });
  } catch (error) {
    console.error("Error submitting flag:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
//  ADMIN ROUTES — all protected
// ============================================================

// GET /api/flags/admin — list all flags (with optional status filter)
router.get("/admin", verifyAdminToken, async (req, res) => {
  try {
    const { status, docketId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (docketId) filter.docketId = docketId;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Flag.countDocuments(filter);

    const flags = await Flag.find(filter)
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Stats
    const [pending, reviewing, resolved, dismissed] = await Promise.all([
      Flag.countDocuments({ status: "pending" }),
      Flag.countDocuments({ status: "reviewing" }),
      Flag.countDocuments({ status: "resolved" }),
      Flag.countDocuments({ status: "dismissed" }),
    ]);

    res.json({
      success: true,
      flags,
      stats: { pending, reviewing, resolved, dismissed, total },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching flags:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/flags/admin/stats — stats only
router.get("/admin/stats", verifyAdminToken, async (req, res) => {
  try {
    const [pending, reviewing, resolved, dismissed, total] = await Promise.all([
      Flag.countDocuments({ status: "pending" }),
      Flag.countDocuments({ status: "reviewing" }),
      Flag.countDocuments({ status: "resolved" }),
      Flag.countDocuments({ status: "dismissed" }),
      Flag.countDocuments(),
    ]);
    res.json({ success: true, stats: { pending, reviewing, resolved, dismissed, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/flags/admin/:id — single flag detail
router.get("/admin/:id", verifyAdminToken, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id).lean();
    if (!flag) return res.status(404).json({ success: false, message: "Flag not found" });
    res.json({ success: true, flag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/flags/admin/:id/status — update status
router.patch("/admin/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { status, adminNotes, resolution } = req.body;

    const allowedStatuses = ["pending", "reviewing", "resolved", "dismissed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, message: "Flag not found" });

    const oldStatus = flag.status;
    flag.status = status;
    if (adminNotes !== undefined) flag.adminNotes = adminNotes;
    if (resolution !== undefined) flag.resolution = resolution;
    if (["resolved", "dismissed"].includes(status)) {
      flag.reviewedAt = new Date();
    }
    await flag.save();

    // Log to activity — use "updated" action with flag entity type
    logActivity(
      "updated",
      "flag",
      flag._id,
      flag.docketNumber
        ? `Flag on ${flag.docketNumber}`
        : `Flag ${flag.flagId}`,
      `Status: ${oldStatus} → ${status}`
    );

    res.json({ success: true, message: "Flag status updated", flag });
  } catch (error) {
    console.error("Error updating flag status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/flags/admin/:id — update notes / resolution (without changing status)
router.patch("/admin/:id", verifyAdminToken, async (req, res) => {
  try {
    const { adminNotes, resolution } = req.body;

    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, message: "Flag not found" });

    if (adminNotes !== undefined) flag.adminNotes = adminNotes;
    if (resolution !== undefined) flag.resolution = resolution;
    await flag.save();

    res.json({ success: true, message: "Flag updated", flag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/flags/admin/:id — delete single flag
router.delete("/admin/:id", verifyAdminToken, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, message: "Flag not found" });

    logActivity(
      "deleted",
      "flag",
      flag._id,
      flag.docketNumber
        ? `Flag on ${flag.docketNumber}`
        : `Flag ${flag.flagId}`,
      flag.category
    );

    await Flag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Flag deleted successfully" });
  } catch (error) {
    console.error("Error deleting flag:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/flags/admin — delete ALL flags
router.delete("/admin", verifyAdminToken, async (req, res) => {
  try {
    const { docketId } = req.query;

    const filter = docketId ? { docketId } : {};
    const result = await Flag.deleteMany(filter);

    if (!docketId) {
      logActivity("deleted", "flag", "all", "All Flag Reports", `${result.deletedCount} deleted`);
    }

    res.json({
      success: true,
      message: `${result.deletedCount} flag(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all flags:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;