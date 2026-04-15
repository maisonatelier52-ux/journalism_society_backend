// models/Flag.js
import mongoose from "mongoose";

const flagSchema = new mongoose.Schema(
  {
    flagId: {
      type: String,
      unique: true,
    },
    docketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Docket",
      required: true,
    },
    docketNumber: {
      type: String,
      required: true,
    },
    docketTitle: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "Factual Error",
        "Date Inaccuracy",
        "Name / Entity Error",
        "Missing Information",
        "Document Error",
        "Other",
      ],
      default: "Factual Error",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolution: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ FIXED: async middleware WITHOUT next()
flagSchema.pre("save", function () {
  if (!this.flagId) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.flagId = `FLAG-${Date.now()}-${random}`;
  }
});

export default mongoose.model("Flag", flagSchema);