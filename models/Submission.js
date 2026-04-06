// // models/Submission.js
// import mongoose from "mongoose";

// const fileSchema = new mongoose.Schema({
//   filename: String,
//   originalName: String,
//   fileSize: Number,
//   fileType: String,
//   filePath: String,
//   exhibitId: String,
//   uploadedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const timelineSchema = new mongoose.Schema({
//   date: String,
//   event: String,
//   detail: String,
//   type: String,
// });

// const submissionSchema = new mongoose.Schema(
//   {
//     // Step 1: Your Details
//     respondentName: {
//       type: String,
//       required: true,
//     },
//     respondentType: {
//       type: String,
//       required: true,
//     },
//     respondentRole: String,
//     contactEmail: {
//       type: String,
//       required: true,
//     },
//     contactPhone: String,

//     // Step 2: The Claim
//     claimSource: {
//       type: String,
//       required: true,
//     },
//     claimUrl: String,
//     claimDate: {
//       type: String,
//       required: true,
//     },
//     claimSummary: {
//       type: String,
//       required: true,
//     },
//     claimCategory: String,

//     // Step 3: Your Response
//     responseTitle: {
//       type: String,
//       required: true,
//     },
//     responseBody: {
//       type: String,
//       required: true,
//     },
//     responseType: String,
//     requestedAction: String,

//     // Step 4: Evidence
//     files: [fileSchema],
//     timeline: [timelineSchema],

//     // Step 5: Consent
//     consentAccurate: {
//       type: Boolean,
//       default: false,
//     },
//     consentPublish: {
//       type: Boolean,
//       default: false,
//     },
//     consentContact: {
//       type: Boolean,
//       default: false,
//     },

//     // Metadata
//     status: {
//       type: String,
//       enum: ["pending", "under_review", "approved", "rejected", "published"],
//       default: "pending",
//     },
//     submittedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     reviewedAt: Date,
//     reviewedBy: String,
//     reviewNotes: String,
//     publishedDocketId: String,
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Submission", submissionSchema);

// models/Submission.js
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  fileSize: Number,
  fileType: String,
  filePath: String,
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