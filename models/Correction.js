// models/Correction.js
import mongoose from "mongoose";

const correctionSchema = new mongoose.Schema(
  {
    correctionId: {
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
    type: {
      type: String,
      enum: ["Correction", "Clarification", "Update"],
      default: "Correction",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // If this correction was triggered by a flag, store the reference
    sourceFlagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flag",
      default: null,
    },
    sourceFlagNumber: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

correctionSchema.pre("save", async function () {
  if (this.correctionId) return;
  try {
    const count = await mongoose.model("Correction").countDocuments();
    this.correctionId = `COR-${String(count + 1).padStart(4, "0")}`;
  } catch (err) {
    throw err;
  }
});

export default mongoose.model("Correction", correctionSchema);