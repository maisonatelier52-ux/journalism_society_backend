// // routes/submissionRoutes.js
// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import Submission from "../models/Submission.js";

// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = "uploads/submissions";
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `file-${uniqueSuffix}${ext}`);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     "text/csv",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only PDF, images, and Office documents are allowed."), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 25 * 1024 * 1024, // 25MB limit
//   },
// });

// // CREATE submission with file upload
// router.post("/", upload.array("files", 10), async (req, res) => {
//   try {
//     // Parse timeline from JSON string
//     let timeline = [];
//     if (req.body.timeline) {
//       try {
//         timeline = JSON.parse(req.body.timeline);
//       } catch (e) {
//         console.error("Error parsing timeline:", e);
//       }
//     }

//     // Process uploaded files
//     const files = req.files
//       ? req.files.map((file, index) => ({
//           filename: file.filename,
//           originalName: file.originalname,
//           fileSize: file.size,
//           fileType: file.mimetype,
//           filePath: file.path,
//           exhibitId: `EX-${String(index + 1).padStart(2, "0")}`,
//           uploadedAt: new Date(),
//         }))
//       : [];

//     // Create submission object
//     const submissionData = {
//       respondentName: req.body.respondentName,
//       respondentType: req.body.respondentType,
//       respondentRole: req.body.respondentRole,
//       contactEmail: req.body.contactEmail,
//       contactPhone: req.body.contactPhone,
//       claimSource: req.body.claimSource,
//       claimUrl: req.body.claimUrl,
//       claimDate: req.body.claimDate,
//       claimSummary: req.body.claimSummary,
//       claimCategory: req.body.claimCategory,
//       responseTitle: req.body.responseTitle,
//       responseBody: req.body.responseBody,
//       responseType: req.body.responseType,
//       requestedAction: req.body.requestedAction,
//       timeline: timeline,
//       files: files,
//       consentAccurate: req.body.consentAccurate === "true",
//       consentPublish: req.body.consentPublish === "true",
//       consentContact: req.body.consentContact === "true",
//       status: "pending",
//       submittedAt: new Date(),
//     };

//     const newSubmission = new Submission(submissionData);
//     await newSubmission.save();

//     res.status(201).json({
//       success: true,
//       message: "Submission received successfully ✅",
//       submissionId: newSubmission._id,
//       referenceId: `JS-${new Date().getFullYear()}-${String(newSubmission._id).slice(-4)}`,
//     });
//   } catch (error) {
//     console.error("Submission error:", error);
    
//     // Clean up uploaded files if submission fails
//     if (req.files) {
//       req.files.forEach((file) => {
//         fs.unlink(file.path, (err) => {
//           if (err) console.error("Error deleting file:", err);
//         });
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Failed to submit. Please try again.",
//       error: error.message,
//     });
//   }
// });

// // GET all submissions
// router.get("/", async (req, res) => {
//   try {
//     const submissions = await Submission.find().sort({ submittedAt: -1 });
//     res.json(submissions);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET single submission
// router.get("/:id", async (req, res) => {
//   try {
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found" });
//     }
//     res.json(submission);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // UPDATE submission status (admin)
// router.patch("/:id/status", async (req, res) => {
//   try {
//     const { status, reviewNotes } = req.body;
//     const submission = await Submission.findById(req.params.id);
    
//     if (!submission) {
//       return res.status(404).json({ message: "Submission not found" });
//     }
    
//     submission.status = status;
//     submission.reviewedAt = new Date();
//     if (reviewNotes) submission.reviewNotes = reviewNotes;
    
//     await submission.save();
//     res.json({ success: true, message: "Submission status updated", submission });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;

// routes/submissionRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Submission from "../models/Submission.js";

const router = express.Router();

// Configure multer (same as before)
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

// Submit a new Right of Reply (goes to submissions collection)
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    console.log("📝 New submission received");
    
    // Parse timeline
    let timeline = [];
    if (req.body.timeline) {
      try {
        timeline = JSON.parse(req.body.timeline);
      } catch (e) {
        console.error("Timeline parse error:", e);
      }
    }
    
    // Process files
    const files = req.files ? req.files.map((file, index) => ({
      filename: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
      exhibitId: `EX-${String(index + 1).padStart(2, "0")}`,
      uploadedAt: new Date(),
    })) : [];
    
    // Create submission (NOT a docket yet)
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
    
    console.log(`✅ Submission saved! ID: ${submission._id}`);
    
    res.status(201).json({
      success: true,
      message: "Your Right of Reply has been submitted for review. Our editorial team will review it within 3-5 business days.",
      submissionId: submission._id,
      referenceId: `SUB-${new Date().getFullYear()}-${String(submission._id).slice(-6)}`,
    });
    
  } catch (error) {
    console.error("❌ Submission error:", error);
    
    // Clean up files on error
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

// Get submission status (for users to check their submission)
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
      reviewNotes: submission.reviewNotes,
      publishedDocketId: submission.publishedDocketNumber,
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;