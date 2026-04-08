

// // routes/adminRoutes.js
// import express from "express";
// import mongoose from "mongoose";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import Submission from "../models/Submission.js";
// import Docket from "../models/Docket.js";
// import Document from "../models/Document.js";
// import Media from "../models/Media.js";
// import MediaSubmission from "../models/MediaSubmission.js";
// import ActivityLog from "../models/ActivityLog.js";

// const router = express.Router();

// // ============ ACTIVITY LOG HELPER ============
// const logActivity = (action, entityType, entityId, entityTitle, entitySubtitle = "") => {
//   ActivityLog.create({
//     action,
//     entityType,
//     entityId: String(entityId),
//     entityTitle: entityTitle || "Untitled",
//     entitySubtitle,
//   }).catch(err => console.error("Activity log error:", err));
// };

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "documents");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `doc-${uniqueSuffix}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf", "image/jpeg", "image/png",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ];
//     allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type"));
//   },
// });

// // Configure multer for exhibit uploads
// const exhibitStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "exhibits");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `exhibit-${uniqueSuffix}${ext}`);
//   },
// });

// const exhibitUpload = multer({
//   storage: exhibitStorage,
//   limits: { fileSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf", "image/jpeg", "image/png",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "text/csv"
//     ];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Invalid file type. Only PDF, images, and Office documents are allowed."));
//   },
// });

// // Configure multer for press release images
// const pressReleaseImageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "press-releases");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `press-${uniqueSuffix}${ext}`);
//   },
// });

// const pressReleaseImageUpload = multer({
//   storage: pressReleaseImageStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
//   },
// });

// // ============ EXHIBIT UPLOAD ============
// router.post("/upload-exhibit", exhibitUpload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });
//     res.json({
//       success: true,
//       fileUrl: `/uploads/exhibits/${file.filename}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       message: "File uploaded successfully",
//     });
//   } catch (error) {
//     console.error("Error uploading exhibit:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ DASHBOARD STATS ============
// router.get("/stats", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const stats = {
//       pendingSubmissions: await Submission.countDocuments({ status: "pending" }),
//       pendingMedia: await MediaSubmission.countDocuments({ status: "pending" }),
//       totalDockets: await Docket.countDocuments(),
//       totalDocuments: await Document.countDocuments(),
//       totalPressReleases: await PressRelease.countDocuments(),
//     };
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ============ ACTIVITY LOG ============
// router.get("/activity-log", async (req, res) => {
//   try {
//     const logs = await ActivityLog.find()
//       .sort({ createdAt: -1 })
//       .limit(100);
//     res.json({ success: true, logs });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ SUBMISSIONS ============
// router.get("/submissions", async (req, res) => {
//   try {
//     const { status } = req.query;
//     const filter = status && status !== "all" ? { status } : {};
//     const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
//     res.json({ success: true, submissions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/submissions/:id", async (req, res) => {
//   try {
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
//     res.json({ success: true, submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/submissions/:id/status", async (req, res) => {
//   try {
//     const { status, reviewNotes } = req.body;
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = status;
//     if (reviewNotes) submission.adminNotes = reviewNotes;
//     if (["approved", "rejected", "published"].includes(status)) {
//       submission.reviewedAt = new Date();
//     }
//     await submission.save();

//     logActivity("updated", "submission",
//       submission._id,
//       submission.responseTitle || "Untitled Submission",
//       `Status → ${status}`
//     );

//     res.json({ success: true, message: "Status updated", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/submissions/:id/reject", async (req, res) => {
//   try {
//     const { reviewNotes } = req.body;
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = "rejected";
//     submission.adminNotes = reviewNotes || "Submission rejected";
//     submission.reviewedAt = new Date();
//     await submission.save();

//     logActivity("updated", "submission",
//       submission._id,
//       submission.responseTitle || "Untitled Submission",
//       "Status → rejected"
//     );

//     res.json({ success: true, message: "Submission rejected", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ CREATE DOCKET FROM SUBMISSION ============
// router.post("/create-docket", async (req, res) => {
//   try {
//     const { submissionId, docketData } = req.body;
//     const submission = await Submission.findById(submissionId);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     const formattedTimeline = (docketData.timeline || []).map(entry => ({
//       date: entry.date || "",
//       event: entry.event || "",
//       description: entry.description || "",
//       type: ["claim", "response", "third_party", "correction"].includes(entry.type)
//         ? entry.type : "response",
//     }));

//     const docket = new Docket({
//       summary: {
//         claim: docketData.summary.claim,
//         context: docketData.summary.context || "",
//         whyMatters: docketData.summary.whyMatters || "",
//       },
//       respondent: { name: submission.respondentName, type: submission.respondentType },
//       claim: {
//         source: submission.claimSource,
//         url: submission.claimUrl,
//         date: submission.claimDate,
//         category: submission.claimCategory,
//       },
//       response: {
//         title: docketData.title || "",
//         body: docketData.response?.body || "",
//         type: docketData.response?.type || "",
//         requestedAction: submission.requestedAction || "",
//       },
//       exhibits: docketData.exhibits || [],
//       timeline: formattedTimeline,
//       status: docketData.status || "Open",
//       filedDate: new Date(),
//       publishedDate: new Date(),
//       sourceSubmissionId: submission._id,
//     });

//     await docket.save();

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         await new Document({
//           title: exhibit.title,
//           type: exhibit.category || "Evidence",
//           description: `Exhibit from docket ${docket.docketId}`,
//           fileUrl: exhibit.fileUrl,
//           fileName: exhibit.title,
//           fileSize: exhibit.fileSize,
//           fileType: exhibit.fileType,
//           sourceDocketId: docket._id,
//           sourceDocketNumber: docket.docketId,
//           publishedDate: new Date(),
//           addedBy: "admin",
//           checksum: exhibit.checksum || null,
//         }).save();
//       }
//     }

//     submission.status = "published";
//     submission.publishedDocketId = docket._id;
//     submission.publishedDocketNumber = docket.docketId;
//     submission.reviewedAt = new Date();
//     await submission.save();

//     logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

//     res.json({
//       success: true,
//       message: "Docket created successfully!",
//       docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
//     });
//   } catch (error) {
//     console.error("❌ Error creating docket:", error);
//     res.status(500).json({ success: false, message: error.message, details: error.errors });
//   }
// });

// // ============ DOCKETS MANAGEMENT ============
// router.get("/dockets", async (req, res) => {
//   try {
//     const dockets = await Docket.find().sort({ publishedDate: -1 });
//     res.json({ success: true, dockets });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/dockets/:id", async (req, res) => {
//   try {
//     const docket = await Docket.findById(req.params.id);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });
//     res.json({ success: true, docket });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/dockets/:id", async (req, res) => {
//   try {
//     const docket = await Docket.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body, lastUpdated: new Date() },
//       { new: true }
//     );
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

//     res.json({ success: true, docket });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/dockets/:id", async (req, res) => {
//   try {
//     const docketId = req.params.id;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const mediaDeleteResult = await Media.deleteMany({ docketId });
//     const mediaSubmissionsDeleteResult = await MediaSubmission.deleteMany({ docketId });
//     const documentsDeleteResult = await Document.deleteMany({ sourceDocketId: docketId });

//     if (docket.sourceSubmissionId) {
//       const submission = await Submission.findById(docket.sourceSubmissionId);
//       if (submission) {
//         submission.status = "rejected";
//         submission.publishedDocketId = null;
//         submission.publishedDocketNumber = null;
//         submission.adminNotes = submission.adminNotes
//           ? `${submission.adminNotes}\n[Docket deleted on ${new Date().toISOString()}]`
//           : `Docket deleted on ${new Date().toISOString()}`;
//         await submission.save();
//       }
//     }

//     // Log BEFORE deleting so we capture the title
//     logActivity("deleted", "docket", docket._id, docket.response?.title, docket.docketId);

//     await Docket.findByIdAndDelete(docketId);

//     res.json({
//       success: true,
//       message: "Docket and all related data deleted successfully",
//       details: {
//         mediaDeleted: mediaDeleteResult.deletedCount,
//         mediaSubmissionsDeleted: mediaSubmissionsDeleteResult.deletedCount,
//         documentsDeleted: documentsDeleteResult.deletedCount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error deleting docket:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ MEDIA SUBMISSIONS MANAGEMENT ============
// router.get("/media-submissions", async (req, res) => {
//   try {
//     const { status } = req.query;
//     const filter = status && status !== "all" ? { status } : {};
//     const submissions = await MediaSubmission.find(filter)
//       .populate("docketId", "docketId response.title")
//       .sort({ submittedAt: -1 });
//     res.json({ success: true, submissions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media-submissions/:id", async (req, res) => {
//   try {
//     const submission = await MediaSubmission.findById(req.params.id)
//       .populate("docketId", "docketId response.title");
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
//     res.json({ success: true, submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, docketId, note } = req.body;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const submission = new MediaSubmission({
//       outlet, headline, url, date, type,
//       docketId, docketNumber: docket.docketId,
//       note, status: "pending", submittedAt: new Date(),
//     });
//     await submission.save();

//     res.json({ success: true, message: "Media citation submitted for review", submissionId: submission._id });
//   } catch (error) {
//     console.error("Submission error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions/:id/approve", async (req, res) => {
//   try {
//     const { stance, summary, adminNotes } = req.body;
//     const submission = await MediaSubmission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     const media = new Media({
//       outlet: submission.outlet,
//       headline: submission.headline,
//       date: submission.date,
//       type: submission.type,
//       stance: stance || "neutral",
//       url: submission.url,
//       summary: summary || submission.note || "",
//       docketId: submission.docketId,
//       docketNumber: submission.docketNumber,
//       source: "user_submission",
//       sourceSubmissionId: submission._id,
//       status: "approved",
//       approvedAt: new Date(),
//       publishedDate: new Date(),
//     });
//     await media.save();

//     submission.status = "approved";
//     submission.approvedAt = new Date();
//     submission.adminNotes = adminNotes || "";
//     submission.stance = stance || "neutral";
//     await submission.save();

//     logActivity("created", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, message: "Media approved and published", media });
//   } catch (error) {
//     console.error("Approval error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions/:id/reject", async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const submission = await MediaSubmission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = "rejected";
//     submission.adminNotes = reason || "Rejected by admin";
//     await submission.save();

//     res.json({ success: true, message: "Media rejected", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ MEDIA MANAGEMENT ============
// router.post("/media/create", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, stance, summary, docketId } = req.body;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const media = new Media({
//       outlet, headline, url, date, type, stance,
//       summary: summary || "",
//       docketId,
//       docketNumber: docket.docketId,
//       source: "admin",
//       status: "approved",
//       approvedAt: new Date(),
//       approvedBy: "admin",
//       publishedDate: new Date(),
//     });
//     await media.save();

//     logActivity("created", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, message: "Media created successfully", media });
//   } catch (error) {
//     console.error("Error creating media:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media", async (req, res) => {
//   try {
//     const { docketId, status } = req.query;
//     let filter = { status: "approved" };
//     if (docketId) filter.docketId = docketId;
//     if (status && status !== "all") filter.status = status;

//     const media = await Media.find(filter)
//       .populate("docketId", "docketId response.title")
//       .sort({ publishedDate: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media/pending", async (req, res) => {
//   try {
//     const media = await Media.find({ status: "pending" }).sort({ createdAt: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media/by-docket/:docketId", async (req, res) => {
//   try {
//     const media = await Media.find({ docketId: req.params.docketId, status: "approved" })
//       .sort({ publishedDate: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media/:id/approve", async (req, res) => {
//   try {
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });
//     media.status = "approved";
//     media.approvedAt = new Date();
//     await media.save();
//     logActivity("updated", "media", media._id, media.headline, media.outlet);
//     res.json({ success: true, message: "Media approved", media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media/:id/reject", async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });
//     media.status = "rejected";
//     media.adminNotes = reason;
//     await media.save();
//     res.json({ success: true, message: "Media rejected", media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/media/:id", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, stance, summary } = req.body;
//     const media = await Media.findByIdAndUpdate(
//       req.params.id,
//       { outlet, headline, url, date, type, stance, summary, updatedAt: new Date() },
//       { new: true }
//     );
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });

//     logActivity("updated", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/media/:id", async (req, res) => {
//   try {
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });

//     if (media.source === "user_submission" && media.sourceSubmissionId) {
//       await MediaSubmission.findByIdAndDelete(media.sourceSubmissionId);
//     }

//     // Log BEFORE deleting
//     logActivity("deleted", "media", media._id, media.headline, media.outlet);

//     await Media.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Media deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting media:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ DOCUMENTS MANAGEMENT ============
// router.get("/documents", async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ publishedDate: -1 });
//     res.json({ success: true, documents });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/documents/upload", upload.single("file"), async (req, res) => {
//   try {
//     const { title, type, description, docketId } = req.body;
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const document = new Document({
//       title, type, description,
//       fileUrl: `/uploads/documents/${file.filename}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       sourceDocketId: docketId || null,
//       publishedDate: new Date(),
//       addedBy: "admin",
//     });
//     await document.save();

//     logActivity("created", "document", document._id, document.title, type);

//     res.json({ success: true, document });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/documents/:id", async (req, res) => {
//   try {
//     const document = await Document.findById(req.params.id);
//     if (!document) return res.status(404).json({ success: false, message: "Document not found" });

//     logActivity("deleted", "document", document._id, document.title, document.type);

//     await Document.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Document deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ ADMIN AUTH ============
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (email === "admin@journalismsociety.org" && password === "admin123") {
//     res.json({ success: true, message: "Login successful", token: "demo-token" });
//   } else {
//     res.status(401).json({ success: false, message: "Invalid credentials" });
//   }
// });

// // ============ CREATE DOCKET DIRECT ============
// router.post("/create-docket-direct", async (req, res) => {
//   try {
//     const { docketData } = req.body;

//     const formattedTimeline = (docketData.timeline || []).map(entry => ({
//       date: entry.date || "",
//       event: entry.event || "",
//       description: entry.description || "",
//       type: ["claim", "response", "third_party", "correction"].includes(entry.type)
//         ? entry.type : "response",
//     }));

//     const docket = new Docket({
//       summary: {
//         claim: docketData.summary.claim,
//         context: docketData.summary.context || "",
//         whyMatters: docketData.summary.whyMatters || "",
//       },
//       respondent: { name: docketData.respondent.name, type: docketData.respondent.type },
//       claim: {
//         source: docketData.claim.source,
//         url: docketData.claim.url,
//         date: docketData.claim.date,
//         category: docketData.claim.category,
//       },
//       response: {
//         title: docketData.title,
//         body: docketData.response.body,
//         type: docketData.response.type || "",
//         requestedAction: docketData.response.requestedAction || "",
//       },
//       exhibits: docketData.exhibits || [],
//       timeline: formattedTimeline,
//       status: docketData.status || "Open",
//       filedDate: new Date(),
//       publishedDate: new Date(),
//     });

//     await docket.save();

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         await new Document({
//           title: exhibit.title,
//           type: exhibit.category || "Evidence",
//           description: `Exhibit from docket ${docket.docketId}`,
//           fileUrl: exhibit.fileUrl,
//           fileName: exhibit.title,
//           fileSize: exhibit.fileSize,
//           fileType: exhibit.fileType,
//           sourceDocketId: docket._id,
//           sourceDocketNumber: docket.docketId,
//           publishedDate: new Date(),
//           addedBy: "admin",
//           checksum: exhibit.checksum || null,
//         }).save();
//       }
//     }

//     logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

//     res.json({
//       success: true,
//       message: "Docket created successfully!",
//       docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
//     });
//   } catch (error) {
//     console.error("❌ Error creating docket:", error);
//     res.status(500).json({ success: false, message: error.message, details: error.errors });
//   }
// });

// // ============ UPDATE DOCKET FULL ============
// router.patch("/dockets/:id/full", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;
//     const { docketData, deletedExhibits, deletedMedia, mediaItems } = req.body;

//     const docket = await Docket.findByIdAndUpdate(
//       id,
//       {
//         summary: docketData.summary,
//         respondent: docketData.respondent,
//         claim: docketData.claim,
//         response: docketData.response,
//         timeline: docketData.timeline,
//         exhibits: docketData.exhibits,
//         status: docketData.status,
//         lastUpdated: new Date(),
//       },
//       { new: true, session }
//     );

//     if (!docket) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Docket not found" });
//     }

//     if (deletedExhibits?.length > 0) {
//       await Document.deleteMany({
//         sourceDocketId: id,
//         exhibitId: { $in: deletedExhibits }
//       }).session(session);
//     }

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         const existingDoc = await Document.findOne({
//           sourceDocketId: id,
//           title: exhibit.title,
//         }).session(session);

//         if (!existingDoc && exhibit.fileUrl) {
//           await new Document({
//             title: exhibit.title,
//             type: exhibit.category || "Evidence",
//             description: `Exhibit from docket ${docket.docketId}`,
//             fileUrl: exhibit.fileUrl,
//             fileName: exhibit.title,
//             fileSize: exhibit.fileSize,
//             fileType: exhibit.fileType,
//             sourceDocketId: docket._id,
//             sourceDocketNumber: docket.docketId,
//             publishedDate: new Date(),
//             addedBy: "admin",
//           }).save({ session });
//         } else if (existingDoc && exhibit.fileUrl !== existingDoc.fileUrl) {
//           existingDoc.fileUrl = exhibit.fileUrl;
//           existingDoc.fileSize = exhibit.fileSize;
//           existingDoc.fileType = exhibit.fileType;
//           existingDoc.title = exhibit.title;
//           existingDoc.type = exhibit.category || "Evidence";
//           await existingDoc.save({ session });
//         }
//       }
//     }

//     if (deletedMedia?.length > 0) {
//       await Media.deleteMany({ _id: { $in: deletedMedia } }).session(session);
//     }

//     if (mediaItems?.length > 0) {
//       for (const media of mediaItems) {
//         if (media._id) {
//           await Media.findByIdAndUpdate(
//             media._id,
//             { outlet: media.outlet, headline: media.headline, url: media.url,
//               date: media.date, type: media.type, stance: media.stance,
//               summary: media.summary, updatedAt: new Date() },
//             { session }
//           );
//         } else {
//           const count = await Media.countDocuments().session(session);
//           const newMediaId = `MW-${String(count + 1).padStart(4, "0")}`;
//           await new Media({
//             ...media,
//             mediaId: newMediaId,
//             docketId: docket._id,
//             docketNumber: docket.docketId,
//             source: "admin",
//             status: "approved",
//             publishedDate: new Date(),
//           }).save({ session });
//         }
//       }
//     }

//     await session.commitTransaction();
//     session.endSession();

//     // Log after successful commit
//     logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

//     res.json({ success: true, message: "Docket updated successfully", docket });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating docket:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ PRESS RELEASES MANAGEMENT ============
// router.get("/press-releases", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const releases = await PressRelease.find().sort({ date: -1 });
//     res.json({ success: true, releases });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findById(req.params.id);
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });
//     res.json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/press-releases", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = new PressRelease(req.body);
//     await release.save();

//     logActivity("created", "press_release", release._id, release.title, release.category);

//     res.status(201).json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body, updatedAt: new Date() },
//       { new: true }
//     );
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });

//     logActivity("updated", "press_release", release._id, release.title, release.category);

//     res.json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findById(req.params.id);
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });

//     logActivity("deleted", "press_release", release._id, release.title, release.category);

//     await PressRelease.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Press release deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/press-releases/upload-image", pressReleaseImageUpload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;
//     const fileUrl = `/uploads/press-releases/${file.filename}`;

//     res.json({
//       success: true,
//       fileUrl,
//       fullUrl: `${baseUrl}${fileUrl}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       message: "Image uploaded successfully",
//     });
//   } catch (error) {
//     console.error("Error uploading press release image:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // DELETE /admin/activity-log
// router.delete("/activity-log", async (req, res) => {
//   try {
//     await ActivityLog.deleteMany({});
//     res.json({ success: true, message: "Activity log cleared" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;

// routes/adminRoutes.js
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import Submission from "../models/Submission.js";
import Docket from "../models/Docket.js";
import Document from "../models/Document.js";
import Media from "../models/Media.js";
import MediaSubmission from "../models/MediaSubmission.js";
import ActivityLog from "../models/ActivityLog.js";
import Flag from "../models/Flag.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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

// Apply middleware to all admin routes except login
const protectedRoutes = [
  "/stats", "/submissions", "/submissions/:id", "/submissions/:id/status",
  "/submissions/:id/reject", "/create-docket", "/create-docket-direct",
  "/dockets", "/dockets/:id", "/dockets/:id/full", "/media", "/media/:id",
  "/media/create", "/media/by-docket/:docketId", "/media-submissions",
  "/media-submissions/:id/approve", "/media-submissions/:id/reject",
  "/documents", "/documents/upload", "/press-releases", "/press-releases/:id",
  "/press-releases/upload-image", "/upload-exhibit", "/activity-log",
];

router.use(protectedRoutes, verifyAdminToken);

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

// ============ ADMIN LOGIN ============
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@journalismsociety.org";
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (email !== adminEmail) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (adminPasswordHash) {
      const isValid = bcrypt.compareSync(password, adminPasswordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } else {
      if (password !== "admin123") {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      console.warn("⚠️ Using default password. Set ADMIN_PASSWORD_HASH in .env for production.");
    }

    const token = jwt.sign(
      { email: adminEmail, role: "admin", iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// ============ VERIFY TOKEN ENDPOINT ============
router.get("/verify", verifyAdminToken, async (req, res) => {
  res.json({ success: true, message: "Token valid", admin: req.admin });
});

// ============ Configure multer for file uploads ============
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "documents");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf", "image/jpeg", "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type"));
  },
});

// Configure multer for exhibit uploads
const exhibitStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "exhibits");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `exhibit-${uniqueSuffix}${ext}`);
  },
});

const exhibitUpload = multer({
  storage: exhibitStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf", "image/jpeg", "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type. Only PDF, images, and Office documents are allowed."));
  },
});

// Configure multer for press release images
const pressReleaseImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads", "press-releases");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `press-${uniqueSuffix}${ext}`);
  },
});

const pressReleaseImageUpload = multer({
  storage: pressReleaseImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
  },
});

// ============ EXHIBIT UPLOAD ============
router.post("/upload-exhibit", exhibitUpload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });
    res.json({
      success: true,
      fileUrl: `/uploads/exhibits/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading exhibit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DASHBOARD STATS ============
router.get("/stats", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const stats = {
      pendingSubmissions: await Submission.countDocuments({ status: "pending" }),
      pendingMedia: await MediaSubmission.countDocuments({ status: "pending" }),
      totalDockets: await Docket.countDocuments(),
      totalDocuments: await Document.countDocuments(),
      totalPressReleases: await PressRelease.countDocuments(),
      pendingFlags: await Flag.countDocuments({ status: "pending" }),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ACTIVITY LOG ============
router.get("/activity-log", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/activity-log", async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: "Activity log cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ SUBMISSIONS ============
router.get("/submissions", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/submissions/:id", async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/submissions/:id/status", async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    submission.status = status;
    if (reviewNotes) submission.adminNotes = reviewNotes;
    if (["approved", "rejected", "published"].includes(status)) {
      submission.reviewedAt = new Date();
    }
    await submission.save();

    logActivity(
      "updated", "submission",
      submission._id,
      submission.responseTitle || "Untitled Submission",
      `Status → ${status}`
    );

    res.json({ success: true, message: "Status updated", submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/submissions/:id/reject", async (req, res) => {
  try {
    const { reviewNotes } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    submission.status = "rejected";
    submission.adminNotes = reviewNotes || "Submission rejected";
    submission.reviewedAt = new Date();
    await submission.save();

    logActivity(
      "updated", "submission",
      submission._id,
      submission.responseTitle || "Untitled Submission",
      "Status → rejected"
    );

    res.json({ success: true, message: "Submission rejected", submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CREATE DOCKET FROM SUBMISSION ============
router.post("/create-docket", async (req, res) => {
  try {
    const { submissionId, docketData } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    const formattedTimeline = (docketData.timeline || []).map((entry) => ({
      date: entry.date || "",
      event: entry.event || "",
      description: entry.description || "",
      type: ["claim", "response", "third_party", "correction"].includes(entry.type)
        ? entry.type
        : "response",
    }));

    const docket = new Docket({
      summary: {
        claim: docketData.summary.claim,
        context: docketData.summary.context || "",
        whyMatters: docketData.summary.whyMatters || "",
      },
      respondent: { name: submission.respondentName, type: submission.respondentType },
      claim: {
        source: submission.claimSource,
        url: submission.claimUrl,
        date: submission.claimDate,
        category: submission.claimCategory,
      },
      response: {
        title: docketData.title || "",
        body: docketData.response?.body || "",
        type: docketData.response?.type || "",
        requestedAction: submission.requestedAction || "",
      },
      exhibits: docketData.exhibits || [],
      timeline: formattedTimeline,
      status: docketData.status || "Open",
      filedDate: new Date(),
      publishedDate: new Date(),
      sourceSubmissionId: submission._id,
    });

    await docket.save();

    if (docketData.exhibits?.length > 0) {
      for (const exhibit of docketData.exhibits) {
        await new Document({
          title: exhibit.title,
          type: exhibit.category || "Evidence",
          description: `Exhibit from docket ${docket.docketId}`,
          fileUrl: exhibit.fileUrl,
          fileName: exhibit.title,
          fileSize: exhibit.fileSize,
          fileType: exhibit.fileType,
          sourceDocketId: docket._id,
          sourceDocketNumber: docket.docketId,
          publishedDate: new Date(),
          addedBy: "admin",
          checksum: exhibit.checksum || null,
        }).save();
      }
    }

    submission.status = "published";
    submission.publishedDocketId = docket._id;
    submission.publishedDocketNumber = docket.docketId;
    submission.reviewedAt = new Date();
    await submission.save();

    logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

    res.json({
      success: true,
      message: "Docket created successfully!",
      docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
    });
  } catch (error) {
    console.error("❌ Error creating docket:", error);
    res.status(500).json({ success: false, message: error.message, details: error.errors });
  }
});

// ============ DOCKETS MANAGEMENT ============
router.get("/dockets", async (req, res) => {
  try {
    const dockets = await Docket.find().sort({ publishedDate: -1 });
    res.json({ success: true, dockets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/dockets/:id", async (req, res) => {
  try {
    const docket = await Docket.findById(req.params.id);
    if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });
    res.json({ success: true, docket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/dockets/:id", async (req, res) => {
  try {
    const docket = await Docket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

    logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

    res.json({ success: true, docket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DELETE DOCKET (with cascade to flags) ============
router.delete("/dockets/:id", async (req, res) => {
  try {
    const docketId = req.params.id;
    const docket = await Docket.findById(docketId);
    if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

    const [mediaDeleteResult, mediaSubmissionsDeleteResult, documentsDeleteResult, flagsDeleteResult] =
      await Promise.all([
        Media.deleteMany({ docketId }),
        MediaSubmission.deleteMany({ docketId }),
        Document.deleteMany({ sourceDocketId: docketId }),
        Flag.deleteMany({ docketId }),          // ← cascade delete flags
      ]);

    if (docket.sourceSubmissionId) {
      const submission = await Submission.findById(docket.sourceSubmissionId);
      if (submission) {
        submission.status = "rejected";
        submission.publishedDocketId = null;
        submission.publishedDocketNumber = null;
        submission.adminNotes = submission.adminNotes
          ? `${submission.adminNotes}\n[Docket deleted on ${new Date().toISOString()}]`
          : `Docket deleted on ${new Date().toISOString()}`;
        await submission.save();
      }
    }

    logActivity("deleted", "docket", docket._id, docket.response?.title, docket.docketId);

    await Docket.findByIdAndDelete(docketId);

    res.json({
      success: true,
      message: "Docket and all related data deleted successfully",
      details: {
        mediaDeleted: mediaDeleteResult.deletedCount,
        mediaSubmissionsDeleted: mediaSubmissionsDeleteResult.deletedCount,
        documentsDeleted: documentsDeleteResult.deletedCount,
        flagsDeleted: flagsDeleteResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting docket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ MEDIA SUBMISSIONS MANAGEMENT ============
router.get("/media-submissions", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const submissions = await MediaSubmission.find(filter)
      .populate("docketId", "docketId response.title")
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/media-submissions/:id", async (req, res) => {
  try {
    const submission = await MediaSubmission.findById(req.params.id).populate(
      "docketId",
      "docketId response.title"
    );
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media-submissions", async (req, res) => {
  try {
    const { outlet, headline, url, date, type, docketId, note } = req.body;
    const docket = await Docket.findById(docketId);
    if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

    const submission = new MediaSubmission({
      outlet, headline, url, date, type,
      docketId, docketNumber: docket.docketId,
      note, status: "pending", submittedAt: new Date(),
    });
    await submission.save();

    res.json({
      success: true,
      message: "Media citation submitted for review",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media-submissions/:id/approve", async (req, res) => {
  try {
    const { stance, summary, adminNotes } = req.body;
    const submission = await MediaSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    const media = new Media({
      outlet: submission.outlet,
      headline: submission.headline,
      date: submission.date,
      type: submission.type,
      stance: stance || "neutral",
      url: submission.url,
      summary: summary || submission.note || "",
      docketId: submission.docketId,
      docketNumber: submission.docketNumber,
      source: "user_submission",
      sourceSubmissionId: submission._id,
      status: "approved",
      approvedAt: new Date(),
      publishedDate: new Date(),
    });
    await media.save();

    submission.status = "approved";
    submission.approvedAt = new Date();
    submission.adminNotes = adminNotes || "";
    submission.stance = stance || "neutral";
    await submission.save();

    logActivity("created", "media", media._id, media.headline, media.outlet);

    res.json({ success: true, message: "Media approved and published", media });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media-submissions/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const submission = await MediaSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

    submission.status = "rejected";
    submission.adminNotes = reason || "Rejected by admin";
    await submission.save();

    res.json({ success: true, message: "Media rejected", submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ MEDIA MANAGEMENT ============
router.post("/media/create", async (req, res) => {
  try {
    const { outlet, headline, url, date, type, stance, summary, docketId } = req.body;
    const docket = await Docket.findById(docketId);
    if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

    const media = new Media({
      outlet, headline, url, date, type, stance,
      summary: summary || "",
      docketId,
      docketNumber: docket.docketId,
      source: "admin",
      status: "approved",
      approvedAt: new Date(),
      approvedBy: "admin",
      publishedDate: new Date(),
    });
    await media.save();

    logActivity("created", "media", media._id, media.headline, media.outlet);

    res.json({ success: true, message: "Media created successfully", media });
  } catch (error) {
    console.error("Error creating media:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/media", async (req, res) => {
  try {
    const { docketId, status } = req.query;
    const filter = { status: "approved" };
    if (docketId) filter.docketId = docketId;
    if (status && status !== "all") filter.status = status;

    const media = await Media.find(filter)
      .populate("docketId", "docketId response.title")
      .sort({ publishedDate: -1 });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/media/pending", async (req, res) => {
  try {
    const media = await Media.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/media/by-docket/:docketId", async (req, res) => {
  try {
    const media = await Media.find({ docketId: req.params.docketId, status: "approved" }).sort({
      publishedDate: -1,
    });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media/:id/approve", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Media not found" });
    media.status = "approved";
    media.approvedAt = new Date();
    await media.save();
    logActivity("updated", "media", media._id, media.headline, media.outlet);
    res.json({ success: true, message: "Media approved", media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Media not found" });
    media.status = "rejected";
    media.adminNotes = reason;
    await media.save();
    res.json({ success: true, message: "Media rejected", media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/media/:id", async (req, res) => {
  try {
    const { outlet, headline, url, date, type, stance, summary } = req.body;
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { outlet, headline, url, date, type, stance, summary, updatedAt: new Date() },
      { new: true }
    );
    if (!media) return res.status(404).json({ success: false, message: "Media not found" });
    logActivity("updated", "media", media._id, media.headline, media.outlet);
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/media/:id", async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Media not found" });

    if (media.source === "user_submission" && media.sourceSubmissionId) {
      await MediaSubmission.findByIdAndDelete(media.sourceSubmissionId);
    }

    logActivity("deleted", "media", media._id, media.headline, media.outlet);

    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ DOCUMENTS MANAGEMENT ============
router.get("/documents", async (req, res) => {
  try {
    const documents = await Document.find().sort({ publishedDate: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/documents/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, type, description, docketId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const document = new Document({
      title, type, description,
      fileUrl: `/uploads/documents/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      sourceDocketId: docketId || null,
      publishedDate: new Date(),
      addedBy: "admin",
    });
    await document.save();

    logActivity("created", "document", document._id, document.title, type);

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/documents/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: "Document not found" });

    logActivity("deleted", "document", document._id, document.title, document.type);

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CREATE DOCKET DIRECT ============
router.post("/create-docket-direct", async (req, res) => {
  try {
    const { docketData } = req.body;

    const formattedTimeline = (docketData.timeline || []).map((entry) => ({
      date: entry.date || "",
      event: entry.event || "",
      description: entry.description || "",
      type: ["claim", "response", "third_party", "correction"].includes(entry.type)
        ? entry.type
        : "response",
    }));

    const docket = new Docket({
      summary: {
        claim: docketData.summary.claim,
        context: docketData.summary.context || "",
        whyMatters: docketData.summary.whyMatters || "",
      },
      respondent: { name: docketData.respondent.name, type: docketData.respondent.type },
      claim: {
        source: docketData.claim.source,
        url: docketData.claim.url,
        date: docketData.claim.date,
        category: docketData.claim.category,
      },
      response: {
        title: docketData.title,
        body: docketData.response.body,
        type: docketData.response.type || "",
        requestedAction: docketData.response.requestedAction || "",
      },
      exhibits: docketData.exhibits || [],
      timeline: formattedTimeline,
      status: docketData.status || "Open",
      filedDate: new Date(),
      publishedDate: new Date(),
    });

    await docket.save();

    if (docketData.exhibits?.length > 0) {
      for (const exhibit of docketData.exhibits) {
        await new Document({
          title: exhibit.title,
          type: exhibit.category || "Evidence",
          description: `Exhibit from docket ${docket.docketId}`,
          fileUrl: exhibit.fileUrl,
          fileName: exhibit.title,
          fileSize: exhibit.fileSize,
          fileType: exhibit.fileType,
          sourceDocketId: docket._id,
          sourceDocketNumber: docket.docketId,
          publishedDate: new Date(),
          addedBy: "admin",
          checksum: exhibit.checksum || null,
        }).save();
      }
    }

    logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

    res.json({
      success: true,
      message: "Docket created successfully!",
      docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
    });
  } catch (error) {
    console.error("❌ Error creating docket:", error);
    res.status(500).json({ success: false, message: error.message, details: error.errors });
  }
});

// ============ UPDATE DOCKET FULL ============
router.patch("/dockets/:id/full", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { docketData, deletedExhibits, deletedMedia, mediaItems } = req.body;

    const docket = await Docket.findByIdAndUpdate(
      id,
      {
        summary: docketData.summary,
        respondent: docketData.respondent,
        claim: docketData.claim,
        response: docketData.response,
        timeline: docketData.timeline,
        exhibits: docketData.exhibits,
        status: docketData.status,
        lastUpdated: new Date(),
      },
      { new: true, session }
    );

    if (!docket) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Docket not found" });
    }

    if (deletedExhibits?.length > 0) {
      await Document.deleteMany({
        sourceDocketId: id,
        exhibitId: { $in: deletedExhibits },
      }).session(session);
    }

    if (docketData.exhibits?.length > 0) {
      for (const exhibit of docketData.exhibits) {
        const existingDoc = await Document.findOne({
          sourceDocketId: id,
          title: exhibit.title,
        }).session(session);

        if (!existingDoc && exhibit.fileUrl) {
          await new Document({
            title: exhibit.title,
            type: exhibit.category || "Evidence",
            description: `Exhibit from docket ${docket.docketId}`,
            fileUrl: exhibit.fileUrl,
            fileName: exhibit.title,
            fileSize: exhibit.fileSize,
            fileType: exhibit.fileType,
            sourceDocketId: docket._id,
            sourceDocketNumber: docket.docketId,
            publishedDate: new Date(),
            addedBy: "admin",
          }).save({ session });
        } else if (existingDoc && exhibit.fileUrl !== existingDoc.fileUrl) {
          existingDoc.fileUrl = exhibit.fileUrl;
          existingDoc.fileSize = exhibit.fileSize;
          existingDoc.fileType = exhibit.fileType;
          existingDoc.title = exhibit.title;
          existingDoc.type = exhibit.category || "Evidence";
          await existingDoc.save({ session });
        }
      }
    }

    if (deletedMedia?.length > 0) {
      await Media.deleteMany({ _id: { $in: deletedMedia } }).session(session);
    }

    if (mediaItems?.length > 0) {
      for (const media of mediaItems) {
        if (media._id) {
          await Media.findByIdAndUpdate(
            media._id,
            {
              outlet: media.outlet, headline: media.headline, url: media.url,
              date: media.date, type: media.type, stance: media.stance,
              summary: media.summary, updatedAt: new Date(),
            },
            { session }
          );
        } else {
          const count = await Media.countDocuments().session(session);
          const newMediaId = `MW-${String(count + 1).padStart(4, "0")}`;
          await new Media({
            ...media,
            mediaId: newMediaId,
            docketId: docket._id,
            docketNumber: docket.docketId,
            source: "admin",
            status: "approved",
            publishedDate: new Date(),
          }).save({ session });
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

    res.json({ success: true, message: "Docket updated successfully", docket });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating docket:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PRESS RELEASES MANAGEMENT ============
router.get("/press-releases", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const releases = await PressRelease.find().sort({ date: -1 });
    res.json({ success: true, releases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/press-releases/:id", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const release = await PressRelease.findById(req.params.id);
    if (!release) return res.status(404).json({ success: false, message: "Press release not found" });
    res.json({ success: true, release });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/press-releases", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const release = new PressRelease(req.body);
    await release.save();
    logActivity("created", "press_release", release._id, release.title, release.category);
    res.status(201).json({ success: true, release });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/press-releases/:id", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const release = await PressRelease.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!release) return res.status(404).json({ success: false, message: "Press release not found" });
    logActivity("updated", "press_release", release._id, release.title, release.category);
    res.json({ success: true, release });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/press-releases/:id", async (req, res) => {
  try {
    const PressRelease = mongoose.model("PressRelease");
    const release = await PressRelease.findById(req.params.id);
    if (!release) return res.status(404).json({ success: false, message: "Press release not found" });
    logActivity("deleted", "press_release", release._id, release.title, release.category);
    await PressRelease.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Press release deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  "/press-releases/upload-image",
  pressReleaseImageUpload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fileUrl = `/uploads/press-releases/${file.filename}`;

      res.json({
        success: true,
        fileUrl,
        fullUrl: `${baseUrl}${fileUrl}`,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading press release image:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;


// // routes/adminRoutes.js
// import express from "express";
// import mongoose from "mongoose";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// import Submission from "../models/Submission.js";
// import Docket from "../models/Docket.js";
// import Document from "../models/Document.js";
// import Media from "../models/Media.js";
// import MediaSubmission from "../models/MediaSubmission.js";
// import ActivityLog from "../models/ActivityLog.js";

// dotenv.config();

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// // ============ JWT MIDDLEWARE ============
// const verifyAdminToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ success: false, message: "No token provided" });
//   }
  
//   const token = authHeader.split(" ")[1];
  
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.admin = decoded;
//     next();
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ success: false, message: "Token expired" });
//     }
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };

// // Apply middleware to all admin routes except login
// const protectedRoutes = [
//   "/stats", "/submissions", "/submissions/:id", "/submissions/:id/status",
//   "/submissions/:id/reject", "/create-docket", "/create-docket-direct",
//   "/dockets", "/dockets/:id", "/dockets/:id/full", "/media", "/media/:id",
//   "/media/create", "/media/by-docket/:docketId", "/media-submissions",
//   "/media-submissions/:id/approve", "/media-submissions/:id/reject",
//   "/documents", "/documents/upload", "/press-releases", "/press-releases/:id",
//   "/press-releases/upload-image", "/upload-exhibit", "/activity-log"
// ];

// router.use(protectedRoutes, verifyAdminToken);

// // ============ ACTIVITY LOG HELPER ============
// const logActivity = (action, entityType, entityId, entityTitle, entitySubtitle = "") => {
//   ActivityLog.create({
//     action,
//     entityType,
//     entityId: String(entityId),
//     entityTitle: entityTitle || "Untitled",
//     entitySubtitle,
//   }).catch(err => console.error("Activity log error:", err));
// };

// // ============ ADMIN LOGIN ============
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Get admin credentials from environment
//     const adminEmail = process.env.ADMIN_EMAIL || "admin@journalismsociety.org";
//     const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
//     // Check if email matches
//     if (email !== adminEmail) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }
    
//     // If we have a hash in env, verify with bcrypt
//     if (adminPasswordHash) {
//       const isValid = bcrypt.compareSync(password, adminPasswordHash);
//       if (!isValid) {
//         return res.status(401).json({ success: false, message: "Invalid credentials" });
//       }
//     } else {
//       // Fallback for development (remove in production)
//       if (password !== "admin123") {
//         return res.status(401).json({ success: false, message: "Invalid credentials" });
//       }
//       console.warn("⚠️ Using default password. Set ADMIN_PASSWORD_HASH in .env for production.");
//     }
    
//     // Generate JWT token
//     const token = jwt.sign(
//       { 
//         email: adminEmail,
//         role: "admin",
//         iat: Math.floor(Date.now() / 1000)
//       },
//       JWT_SECRET,
//       { expiresIn: JWT_EXPIRES_IN }
//     );
    
//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       expiresIn: JWT_EXPIRES_IN,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ success: false, message: "Login failed" });
//   }
// });

// // ============ VERIFY TOKEN ENDPOINT ============
// router.get("/verify", verifyAdminToken, async (req, res) => {
//   res.json({ success: true, message: "Token valid", admin: req.admin });
// });

// // ============ Configure multer for file uploads ============
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "documents");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `doc-${uniqueSuffix}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf", "image/jpeg", "image/png",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ];
//     allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type"));
//   },
// });

// // Configure multer for exhibit uploads
// const exhibitStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "exhibits");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `exhibit-${uniqueSuffix}${ext}`);
//   },
// });

// const exhibitUpload = multer({
//   storage: exhibitStorage,
//   limits: { fileSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf", "image/jpeg", "image/png",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "text/csv"
//     ];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Invalid file type. Only PDF, images, and Office documents are allowed."));
//   },
// });

// // Configure multer for press release images
// const pressReleaseImageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(process.cwd(), "uploads", "press-releases");
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, `press-${uniqueSuffix}${ext}`);
//   },
// });

// const pressReleaseImageUpload = multer({
//   storage: pressReleaseImageStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//     allowedTypes.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
//   },
// });

// // ============ EXHIBIT UPLOAD ============
// router.post("/upload-exhibit", exhibitUpload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });
//     res.json({
//       success: true,
//       fileUrl: `/uploads/exhibits/${file.filename}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       message: "File uploaded successfully",
//     });
//   } catch (error) {
//     console.error("Error uploading exhibit:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ DASHBOARD STATS ============
// router.get("/stats", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const stats = {
//       pendingSubmissions: await Submission.countDocuments({ status: "pending" }),
//       pendingMedia: await MediaSubmission.countDocuments({ status: "pending" }),
//       totalDockets: await Docket.countDocuments(),
//       totalDocuments: await Document.countDocuments(),
//       totalPressReleases: await PressRelease.countDocuments(),
//     };
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ============ ACTIVITY LOG ============
// router.get("/activity-log", async (req, res) => {
//   try {
//     const logs = await ActivityLog.find()
//       .sort({ createdAt: -1 })
//       .limit(100);
//     res.json({ success: true, logs });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/activity-log", async (req, res) => {
//   try {
//     await ActivityLog.deleteMany({});
//     res.json({ success: true, message: "Activity log cleared" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ SUBMISSIONS ============
// router.get("/submissions", async (req, res) => {
//   try {
//     const { status } = req.query;
//     const filter = status && status !== "all" ? { status } : {};
//     const submissions = await Submission.find(filter).sort({ submittedAt: -1 });
//     res.json({ success: true, submissions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/submissions/:id", async (req, res) => {
//   try {
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
//     res.json({ success: true, submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/submissions/:id/status", async (req, res) => {
//   try {
//     const { status, reviewNotes } = req.body;
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = status;
//     if (reviewNotes) submission.adminNotes = reviewNotes;
//     if (["approved", "rejected", "published"].includes(status)) {
//       submission.reviewedAt = new Date();
//     }
//     await submission.save();

//     logActivity("updated", "submission",
//       submission._id,
//       submission.responseTitle || "Untitled Submission",
//       `Status → ${status}`
//     );

//     res.json({ success: true, message: "Status updated", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/submissions/:id/reject", async (req, res) => {
//   try {
//     const { reviewNotes } = req.body;
//     const submission = await Submission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = "rejected";
//     submission.adminNotes = reviewNotes || "Submission rejected";
//     submission.reviewedAt = new Date();
//     await submission.save();

//     logActivity("updated", "submission",
//       submission._id,
//       submission.responseTitle || "Untitled Submission",
//       "Status → rejected"
//     );

//     res.json({ success: true, message: "Submission rejected", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ CREATE DOCKET FROM SUBMISSION ============
// router.post("/create-docket", async (req, res) => {
//   try {
//     const { submissionId, docketData } = req.body;
//     const submission = await Submission.findById(submissionId);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     const formattedTimeline = (docketData.timeline || []).map(entry => ({
//       date: entry.date || "",
//       event: entry.event || "",
//       description: entry.description || "",
//       type: ["claim", "response", "third_party", "correction"].includes(entry.type)
//         ? entry.type : "response",
//     }));

//     const docket = new Docket({
//       summary: {
//         claim: docketData.summary.claim,
//         context: docketData.summary.context || "",
//         whyMatters: docketData.summary.whyMatters || "",
//       },
//       respondent: { name: submission.respondentName, type: submission.respondentType },
//       claim: {
//         source: submission.claimSource,
//         url: submission.claimUrl,
//         date: submission.claimDate,
//         category: submission.claimCategory,
//       },
//       response: {
//         title: docketData.title || "",
//         body: docketData.response?.body || "",
//         type: docketData.response?.type || "",
//         requestedAction: submission.requestedAction || "",
//       },
//       exhibits: docketData.exhibits || [],
//       timeline: formattedTimeline,
//       status: docketData.status || "Open",
//       filedDate: new Date(),
//       publishedDate: new Date(),
//       sourceSubmissionId: submission._id,
//     });

//     await docket.save();

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         await new Document({
//           title: exhibit.title,
//           type: exhibit.category || "Evidence",
//           description: `Exhibit from docket ${docket.docketId}`,
//           fileUrl: exhibit.fileUrl,
//           fileName: exhibit.title,
//           fileSize: exhibit.fileSize,
//           fileType: exhibit.fileType,
//           sourceDocketId: docket._id,
//           sourceDocketNumber: docket.docketId,
//           publishedDate: new Date(),
//           addedBy: "admin",
//           checksum: exhibit.checksum || null,
//         }).save();
//       }
//     }

//     submission.status = "published";
//     submission.publishedDocketId = docket._id;
//     submission.publishedDocketNumber = docket.docketId;
//     submission.reviewedAt = new Date();
//     await submission.save();

//     logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

//     res.json({
//       success: true,
//       message: "Docket created successfully!",
//       docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
//     });
//   } catch (error) {
//     console.error("❌ Error creating docket:", error);
//     res.status(500).json({ success: false, message: error.message, details: error.errors });
//   }
// });

// // ============ DOCKETS MANAGEMENT ============
// router.get("/dockets", async (req, res) => {
//   try {
//     const dockets = await Docket.find().sort({ publishedDate: -1 });
//     res.json({ success: true, dockets });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/dockets/:id", async (req, res) => {
//   try {
//     const docket = await Docket.findById(req.params.id);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });
//     res.json({ success: true, docket });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/dockets/:id", async (req, res) => {
//   try {
//     const docket = await Docket.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body, lastUpdated: new Date() },
//       { new: true }
//     );
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

//     res.json({ success: true, docket });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/dockets/:id", async (req, res) => {
//   try {
//     const docketId = req.params.id;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const mediaDeleteResult = await Media.deleteMany({ docketId });
//     const mediaSubmissionsDeleteResult = await MediaSubmission.deleteMany({ docketId });
//     const documentsDeleteResult = await Document.deleteMany({ sourceDocketId: docketId });

//     if (docket.sourceSubmissionId) {
//       const submission = await Submission.findById(docket.sourceSubmissionId);
//       if (submission) {
//         submission.status = "rejected";
//         submission.publishedDocketId = null;
//         submission.publishedDocketNumber = null;
//         submission.adminNotes = submission.adminNotes
//           ? `${submission.adminNotes}\n[Docket deleted on ${new Date().toISOString()}]`
//           : `Docket deleted on ${new Date().toISOString()}`;
//         await submission.save();
//       }
//     }

//     logActivity("deleted", "docket", docket._id, docket.response?.title, docket.docketId);

//     await Docket.findByIdAndDelete(docketId);

//     res.json({
//       success: true,
//       message: "Docket and all related data deleted successfully",
//       details: {
//         mediaDeleted: mediaDeleteResult.deletedCount,
//         mediaSubmissionsDeleted: mediaSubmissionsDeleteResult.deletedCount,
//         documentsDeleted: documentsDeleteResult.deletedCount,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error deleting docket:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ MEDIA SUBMISSIONS MANAGEMENT ============
// router.get("/media-submissions", async (req, res) => {
//   try {
//     const { status } = req.query;
//     const filter = status && status !== "all" ? { status } : {};
//     const submissions = await MediaSubmission.find(filter)
//       .populate("docketId", "docketId response.title")
//       .sort({ submittedAt: -1 });
//     res.json({ success: true, submissions });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media-submissions/:id", async (req, res) => {
//   try {
//     const submission = await MediaSubmission.findById(req.params.id)
//       .populate("docketId", "docketId response.title");
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
//     res.json({ success: true, submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, docketId, note } = req.body;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const submission = new MediaSubmission({
//       outlet, headline, url, date, type,
//       docketId, docketNumber: docket.docketId,
//       note, status: "pending", submittedAt: new Date(),
//     });
//     await submission.save();

//     res.json({ success: true, message: "Media citation submitted for review", submissionId: submission._id });
//   } catch (error) {
//     console.error("Submission error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions/:id/approve", async (req, res) => {
//   try {
//     const { stance, summary, adminNotes } = req.body;
//     const submission = await MediaSubmission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     const media = new Media({
//       outlet: submission.outlet,
//       headline: submission.headline,
//       date: submission.date,
//       type: submission.type,
//       stance: stance || "neutral",
//       url: submission.url,
//       summary: summary || submission.note || "",
//       docketId: submission.docketId,
//       docketNumber: submission.docketNumber,
//       source: "user_submission",
//       sourceSubmissionId: submission._id,
//       status: "approved",
//       approvedAt: new Date(),
//       publishedDate: new Date(),
//     });
//     await media.save();

//     submission.status = "approved";
//     submission.approvedAt = new Date();
//     submission.adminNotes = adminNotes || "";
//     submission.stance = stance || "neutral";
//     await submission.save();

//     logActivity("created", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, message: "Media approved and published", media });
//   } catch (error) {
//     console.error("Approval error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media-submissions/:id/reject", async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const submission = await MediaSubmission.findById(req.params.id);
//     if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });

//     submission.status = "rejected";
//     submission.adminNotes = reason || "Rejected by admin";
//     await submission.save();

//     res.json({ success: true, message: "Media rejected", submission });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ MEDIA MANAGEMENT ============
// router.post("/media/create", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, stance, summary, docketId } = req.body;
//     const docket = await Docket.findById(docketId);
//     if (!docket) return res.status(404).json({ success: false, message: "Docket not found" });

//     const media = new Media({
//       outlet, headline, url, date, type, stance,
//       summary: summary || "",
//       docketId,
//       docketNumber: docket.docketId,
//       source: "admin",
//       status: "approved",
//       approvedAt: new Date(),
//       approvedBy: "admin",
//       publishedDate: new Date(),
//     });
//     await media.save();

//     logActivity("created", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, message: "Media created successfully", media });
//   } catch (error) {
//     console.error("Error creating media:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media", async (req, res) => {
//   try {
//     const { docketId, status } = req.query;
//     let filter = { status: "approved" };
//     if (docketId) filter.docketId = docketId;
//     if (status && status !== "all") filter.status = status;

//     const media = await Media.find(filter)
//       .populate("docketId", "docketId response.title")
//       .sort({ publishedDate: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media/pending", async (req, res) => {
//   try {
//     const media = await Media.find({ status: "pending" }).sort({ createdAt: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/media/by-docket/:docketId", async (req, res) => {
//   try {
//     const media = await Media.find({ docketId: req.params.docketId, status: "approved" })
//       .sort({ publishedDate: -1 });
//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media/:id/approve", async (req, res) => {
//   try {
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });
//     media.status = "approved";
//     media.approvedAt = new Date();
//     await media.save();
//     logActivity("updated", "media", media._id, media.headline, media.outlet);
//     res.json({ success: true, message: "Media approved", media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/media/:id/reject", async (req, res) => {
//   try {
//     const { reason } = req.body;
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });
//     media.status = "rejected";
//     media.adminNotes = reason;
//     await media.save();
//     res.json({ success: true, message: "Media rejected", media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/media/:id", async (req, res) => {
//   try {
//     const { outlet, headline, url, date, type, stance, summary } = req.body;
//     const media = await Media.findByIdAndUpdate(
//       req.params.id,
//       { outlet, headline, url, date, type, stance, summary, updatedAt: new Date() },
//       { new: true }
//     );
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });

//     logActivity("updated", "media", media._id, media.headline, media.outlet);

//     res.json({ success: true, media });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/media/:id", async (req, res) => {
//   try {
//     const media = await Media.findById(req.params.id);
//     if (!media) return res.status(404).json({ success: false, message: "Media not found" });

//     if (media.source === "user_submission" && media.sourceSubmissionId) {
//       await MediaSubmission.findByIdAndDelete(media.sourceSubmissionId);
//     }

//     logActivity("deleted", "media", media._id, media.headline, media.outlet);

//     await Media.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Media deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting media:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ DOCUMENTS MANAGEMENT ============
// router.get("/documents", async (req, res) => {
//   try {
//     const documents = await Document.find().sort({ publishedDate: -1 });
//     res.json({ success: true, documents });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/documents/upload", upload.single("file"), async (req, res) => {
//   try {
//     const { title, type, description, docketId } = req.body;
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const document = new Document({
//       title, type, description,
//       fileUrl: `/uploads/documents/${file.filename}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       sourceDocketId: docketId || null,
//       publishedDate: new Date(),
//       addedBy: "admin",
//     });
//     await document.save();

//     logActivity("created", "document", document._id, document.title, type);

//     res.json({ success: true, document });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/documents/:id", async (req, res) => {
//   try {
//     const document = await Document.findById(req.params.id);
//     if (!document) return res.status(404).json({ success: false, message: "Document not found" });

//     logActivity("deleted", "document", document._id, document.title, document.type);

//     await Document.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Document deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ CREATE DOCKET DIRECT ============
// router.post("/create-docket-direct", async (req, res) => {
//   try {
//     const { docketData } = req.body;

//     const formattedTimeline = (docketData.timeline || []).map(entry => ({
//       date: entry.date || "",
//       event: entry.event || "",
//       description: entry.description || "",
//       type: ["claim", "response", "third_party", "correction"].includes(entry.type)
//         ? entry.type : "response",
//     }));

//     const docket = new Docket({
//       summary: {
//         claim: docketData.summary.claim,
//         context: docketData.summary.context || "",
//         whyMatters: docketData.summary.whyMatters || "",
//       },
//       respondent: { name: docketData.respondent.name, type: docketData.respondent.type },
//       claim: {
//         source: docketData.claim.source,
//         url: docketData.claim.url,
//         date: docketData.claim.date,
//         category: docketData.claim.category,
//       },
//       response: {
//         title: docketData.title,
//         body: docketData.response.body,
//         type: docketData.response.type || "",
//         requestedAction: docketData.response.requestedAction || "",
//       },
//       exhibits: docketData.exhibits || [],
//       timeline: formattedTimeline,
//       status: docketData.status || "Open",
//       filedDate: new Date(),
//       publishedDate: new Date(),
//     });

//     await docket.save();

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         await new Document({
//           title: exhibit.title,
//           type: exhibit.category || "Evidence",
//           description: `Exhibit from docket ${docket.docketId}`,
//           fileUrl: exhibit.fileUrl,
//           fileName: exhibit.title,
//           fileSize: exhibit.fileSize,
//           fileType: exhibit.fileType,
//           sourceDocketId: docket._id,
//           sourceDocketNumber: docket.docketId,
//           publishedDate: new Date(),
//           addedBy: "admin",
//           checksum: exhibit.checksum || null,
//         }).save();
//       }
//     }

//     logActivity("created", "docket", docket._id, docket.response.title, docket.docketId);

//     res.json({
//       success: true,
//       message: "Docket created successfully!",
//       docket: { id: docket._id, docketId: docket.docketId, title: docket.response.title },
//     });
//   } catch (error) {
//     console.error("❌ Error creating docket:", error);
//     res.status(500).json({ success: false, message: error.message, details: error.errors });
//   }
// });

// // ============ UPDATE DOCKET FULL ============
// router.patch("/dockets/:id/full", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;
//     const { docketData, deletedExhibits, deletedMedia, mediaItems } = req.body;

//     const docket = await Docket.findByIdAndUpdate(
//       id,
//       {
//         summary: docketData.summary,
//         respondent: docketData.respondent,
//         claim: docketData.claim,
//         response: docketData.response,
//         timeline: docketData.timeline,
//         exhibits: docketData.exhibits,
//         status: docketData.status,
//         lastUpdated: new Date(),
//       },
//       { new: true, session }
//     );

//     if (!docket) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Docket not found" });
//     }

//     if (deletedExhibits?.length > 0) {
//       await Document.deleteMany({
//         sourceDocketId: id,
//         exhibitId: { $in: deletedExhibits }
//       }).session(session);
//     }

//     if (docketData.exhibits?.length > 0) {
//       for (const exhibit of docketData.exhibits) {
//         const existingDoc = await Document.findOne({
//           sourceDocketId: id,
//           title: exhibit.title,
//         }).session(session);

//         if (!existingDoc && exhibit.fileUrl) {
//           await new Document({
//             title: exhibit.title,
//             type: exhibit.category || "Evidence",
//             description: `Exhibit from docket ${docket.docketId}`,
//             fileUrl: exhibit.fileUrl,
//             fileName: exhibit.title,
//             fileSize: exhibit.fileSize,
//             fileType: exhibit.fileType,
//             sourceDocketId: docket._id,
//             sourceDocketNumber: docket.docketId,
//             publishedDate: new Date(),
//             addedBy: "admin",
//           }).save({ session });
//         } else if (existingDoc && exhibit.fileUrl !== existingDoc.fileUrl) {
//           existingDoc.fileUrl = exhibit.fileUrl;
//           existingDoc.fileSize = exhibit.fileSize;
//           existingDoc.fileType = exhibit.fileType;
//           existingDoc.title = exhibit.title;
//           existingDoc.type = exhibit.category || "Evidence";
//           await existingDoc.save({ session });
//         }
//       }
//     }

//     if (deletedMedia?.length > 0) {
//       await Media.deleteMany({ _id: { $in: deletedMedia } }).session(session);
//     }

//     if (mediaItems?.length > 0) {
//       for (const media of mediaItems) {
//         if (media._id) {
//           await Media.findByIdAndUpdate(
//             media._id,
//             { outlet: media.outlet, headline: media.headline, url: media.url,
//               date: media.date, type: media.type, stance: media.stance,
//               summary: media.summary, updatedAt: new Date() },
//             { session }
//           );
//         } else {
//           const count = await Media.countDocuments().session(session);
//           const newMediaId = `MW-${String(count + 1).padStart(4, "0")}`;
//           await new Media({
//             ...media,
//             mediaId: newMediaId,
//             docketId: docket._id,
//             docketNumber: docket.docketId,
//             source: "admin",
//             status: "approved",
//             publishedDate: new Date(),
//           }).save({ session });
//         }
//       }
//     }

//     await session.commitTransaction();
//     session.endSession();

//     logActivity("updated", "docket", docket._id, docket.response?.title, docket.docketId);

//     res.json({ success: true, message: "Docket updated successfully", docket });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating docket:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // ============ PRESS RELEASES MANAGEMENT ============
// router.get("/press-releases", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const releases = await PressRelease.find().sort({ date: -1 });
//     res.json({ success: true, releases });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.get("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findById(req.params.id);
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });
//     res.json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/press-releases", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = new PressRelease(req.body);
//     await release.save();

//     logActivity("created", "press_release", release._id, release.title, release.category);

//     res.status(201).json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.patch("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body, updatedAt: new Date() },
//       { new: true }
//     );
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });

//     logActivity("updated", "press_release", release._id, release.title, release.category);

//     res.json({ success: true, release });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.delete("/press-releases/:id", async (req, res) => {
//   try {
//     const PressRelease = mongoose.model("PressRelease");
//     const release = await PressRelease.findById(req.params.id);
//     if (!release) return res.status(404).json({ success: false, message: "Press release not found" });

//     logActivity("deleted", "press_release", release._id, release.title, release.category);

//     await PressRelease.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: "Press release deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.post("/press-releases/upload-image", pressReleaseImageUpload.single("file"), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;
//     const fileUrl = `/uploads/press-releases/${file.filename}`;

//     res.json({
//       success: true,
//       fileUrl,
//       fullUrl: `${baseUrl}${fileUrl}`,
//       fileName: file.originalname,
//       fileSize: file.size,
//       fileType: file.mimetype,
//       message: "Image uploaded successfully",
//     });
//   } catch (error) {
//     console.error("Error uploading press release image:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;