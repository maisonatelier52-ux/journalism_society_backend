// models/MediaSubmission.js
import mongoose from "mongoose";

const mediaSubmissionSchema = new mongoose.Schema({
  outlet: { type: String, required: true },
  headline: { type: String, required: true },
  url: { type: String, required: true },
  date: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Original Report", "Follow-up", "Opinion", "Fact-Check", "News", "Regional", "Other"],
    default: "News"
  },
  note: String,
  docketId: { type: mongoose.Schema.Types.ObjectId, ref: "Docket", required: true },
  docketNumber: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNotes: String,
  approvedAt: Date,
  approvedBy: String,
  stance: { type: String, enum: ["adversarial", "neutral", "supportive"], default: "neutral" },
  summary: String,
  submittedAt: { type: Date, default: Date.now },
  submittedBy: { type: String, default: "user" },
}, { timestamps: true });

// No pre-save hook needed for MediaSubmission, or simplified version
mediaSubmissionSchema.pre("save", async function() {
  if (this.isNew && !this.submissionId) {
    this.submissionId = `MS-${Date.now()}`;
  }
});

export default mongoose.model("MediaSubmission", mediaSubmissionSchema);