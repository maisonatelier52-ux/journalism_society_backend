

// models/Submission.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  fileSize: Number,
  fileType: String,
  filePath: String,
  fileUrl: String,      // ← ADDED: stores /uploads/submissions/filename.ext
  exhibitId: String,    // ← ADDED: stores EX-01, EX-02 etc.
  uploadedAt: Date,
});

const timelineSchema = new mongoose.Schema({
  date: String,
  event: String,
  detail: String,
  type: String,
});

const submissionSchema = new mongoose.Schema({
  // User Info
  respondentName: { type: String, required: true },
  respondentType: { type: String, required: true },
  respondentRole: String,
  contactEmail: { type: String, required: true },
  contactPhone: String,
  
  // Claim Info
  claimSource: { type: String, required: true },
  claimUrl: String,
  claimDate: { type: String, required: true },
  claimSummary: { type: String, required: true },
  claimCategory: String,
  
  // Response
  responseTitle: { type: String, required: true },
  responseBody: { type: String, required: true },
  responseType: String,
  requestedAction: String,
  
  // Supporting
  files: [fileSchema],
  timeline: [timelineSchema],
  
  // Consent
  consentAccurate: Boolean,
  consentPublish: Boolean,
  consentContact: Boolean,
  
  // Admin Review
  status: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected", "published"],
    default: "pending",
  },
  adminNotes: String,
  reviewedAt: Date,
  reviewedBy: String,
  publishedDocketId: { type: mongoose.Schema.Types.ObjectId, ref: "Docket" },
  publishedDocketNumber: String,
  
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);