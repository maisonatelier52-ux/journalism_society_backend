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
flagSchema.pre("save", async function () {
  if (this.flagId) return;

  try {
    const count = await mongoose.model("Flag").countDocuments();
    this.flagId = `FLAG-${String(count + 1).padStart(4, "0")}`;
  } catch (err) {
    throw err; // let mongoose handle errors
  }
});

export default mongoose.model("Flag", flagSchema);