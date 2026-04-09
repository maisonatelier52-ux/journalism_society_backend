// models/Document.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: Number,
    fileType: String,
    checksum: String,
    exhibitId: {
      type: String,
      default: null,
    },
    sourceDocketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Docket",
    },
    sourceDocketNumber: String,
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Generate document ID
documentSchema.pre("save", async function() {
  if (this.isNew && !this.documentId) {
    const Document = mongoose.model("Document");
    const count = await Document.countDocuments();
    this.documentId = `DOC-${String(count + 1).padStart(4, "0")}`;
  }
});

export default mongoose.model("Document", documentSchema);