
// export default router;
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Submission from "../models/Submission.js";
import Docket from "../models/Docket.js";

const router = express.Router();

// Helper: Check if a docket with same claim URL or response title already exists
const checkDocketExistsForSubmission = async (claimUrl, responseTitle) => {
  if (!claimUrl && !responseTitle) return false;
  
  const query = {
    $or: [
      ...(claimUrl ? [{ "claim.url": claimUrl }] : []),
      ...(responseTitle ? [{ "response.title": responseTitle }] : []),
    ]
  };
  
  const existing = await Docket.findOne(query);
  return !!existing;
};

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "submissions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Submit a new Right of Reply
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    console.log("📝 New submission received");
    
    // Check if a docket with same claim URL or response title already exists
    const docketExists = await checkDocketExistsForSubmission(
      req.body.claimUrl, 
      req.body.responseTitle
    );
    
    if (docketExists) {
      // Clean up uploaded files if duplicate detected
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      return res.status(409).json({ 
        success: false, 
        message: "A docket with this claim URL or response title already exists in the public record. Please check existing dockets before submitting." 
      });
    }
    
    let timeline = [];
    if (req.body.timeline) {
      try {
        timeline = JSON.parse(req.body.timeline);
      } catch (e) {
        console.error("Timeline parse error:", e);
      }
    }
    
    // Process files - store with BOTH filePath AND fileUrl
    // fileUrl is critical: it's used by the admin to display/download exhibits
    const files = req.files ? req.files.map((file, index) => ({
      filename: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
      fileUrl: `/uploads/submissions/${file.filename}`,  // ← stored for later use
      exhibitId: `EX-${String(index + 1).padStart(2, "0")}`,  // ← pre-assign exhibit ID
      uploadedAt: new Date(),
    })) : [];
    
    const submission = new Submission({
      respondentName: req.body.respondentName,
      respondentType: req.body.respondentType,
      respondentRole: req.body.respondentRole,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      claimSource: req.body.claimSource,
      claimUrl: req.body.claimUrl,
      claimDate: req.body.claimDate,
      claimSummary: req.body.claimSummary,
      claimCategory: req.body.claimCategory,
      responseTitle: req.body.responseTitle,
      responseBody: req.body.responseBody,
      responseType: req.body.responseType,
      requestedAction: req.body.requestedAction,
      files: files,
      timeline: timeline,
      consentAccurate: req.body.consentAccurate === "true",
      consentPublish: req.body.consentPublish === "true",
      consentContact: req.body.consentContact === "true",
      status: "pending",
      submittedAt: new Date(),
    });
    
    await submission.save();
    
    console.log(`✅ Submission saved! ID: ${submission._id}, Files: ${files.length}`);
    
    res.status(201).json({
      success: true,
      message: "Your Right of Reply has been submitted for review. Our editorial team will review it within 3-5 business days.",
      submissionId: submission._id,
      referenceId: `SUB-${new Date().getFullYear()}-${String(submission._id).slice(-6)}`,
    });
    
  } catch (error) {
    console.error("❌ Submission error:", error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to submit. Please try again.",
      error: error.message,
    });
  }
});

// Get submission status
router.get("/:id/status", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    
    res.json({
      success: true,
      status: submission.status,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
      reviewNotes: submission.adminNotes,
      publishedDocketId: submission.publishedDocketNumber,
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;