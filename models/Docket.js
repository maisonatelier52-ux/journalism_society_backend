// models/Docket.js
import mongoose from "mongoose";

const exhibitSchema = new mongoose.Schema({
  exhibitId: String,
  title: String,
  description: String,
  fileUrl: String,
  fileType: String,
  fileSize: Number,
  pages: Number,
  category: {
    type: String,
    enum: ["Evidence", "Legal", "Regulatory", "Benchmark", "Analysis", "Institutional", "Claim"],
    default: "Evidence",
  },
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now },
});

const timelineEntrySchema = new mongoose.Schema({
  date: String,
  event: String,
  description: String,
  type: {
    type: String,
    enum: ["claim", "response", "third_party", "correction"],
    default: "response",
  },
});

// ── RESPONSE SUB-SCHEMA (explicitly defined as an Object, never a String) ──
const responseSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    body:  { type: String, default: "" },
    type:  { type: String, default: "" },
    requestedAction: { type: String, default: "" },
  },
  { _id: false }   // no extra _id on the subdocument
);

const docketSchema = new mongoose.Schema(
  {
    docketId: { type: String, unique: true, sparse: true },

    summary: {
      claim:       { type: String, required: true },
      context:     String,
      whyMatters:  String,
    },

    respondent: {
      name: { type: String, required: true },
      type: { type: String, required: true },
    },

    claim: {
      source:   String,
      url:      String,
      date:     String,
      category: String,
    },

    // ── THIS IS THE KEY FIX: use the sub-schema, not a plain String ──
    response: {
      type:     responseSchema,
      required: true,
    },

    exhibits: [exhibitSchema],
    timeline: [timelineEntrySchema],

    status: {
      type: String,
      enum: ["Open", "Under Review", "Closed"],
      default: "Open",
    },

    filedDate:     { type: Date, default: Date.now },
    publishedDate: Date,
    lastUpdated:   Date,

    sourceSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Submission",
    },
  },
  { timestamps: true }
);

// ── AUTO-GENERATE docketId ──
docketSchema.pre("save", async function() {
  if (this.isNew && !this.docketId) {
    const year   = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900) + 100;
    this.docketId = `JS-${year}-${random}`;
  }
});

// ── ALWAYS DELETE CACHED MODEL to avoid stale schema ──
if (mongoose.models.Docket) {
  delete mongoose.models.Docket;
}

export default mongoose.model("Docket", docketSchema);