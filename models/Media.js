// models/Media.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  mediaId: { type: String, unique: true },
  outlet: { type: String, required: true },
  headline: { type: String, required: true },
  date: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Original Report", "Follow-up", "Opinion", "News", "Fact-Check", "Regional"],
    required: true 
  },
  stance: { 
    type: String, 
    enum: ["adversarial", "neutral", "supportive"], 
    required: true 
  },
  url: String,
  summary: String,
  docketId: { type: mongoose.Schema.Types.ObjectId, ref: "Docket", required: true },
  docketNumber: String,
  source: { type: String, enum: ["admin", "user_submission"] },
  sourceSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "MediaSubmission" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  approvedAt: Date,
  approvedBy: String,
  publishedDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Generate media ID - FIXED: No next() parameter
mediaSchema.pre("save", async function() {
  if (this.isNew && !this.mediaId) {
    const Media = mongoose.model("Media");
    const count = await Media.countDocuments();
    this.mediaId = `MW-${String(count + 1).padStart(4, "0")}`;
  }
});

export default mongoose.model("Media", mediaSchema);