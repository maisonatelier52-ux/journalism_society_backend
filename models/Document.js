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

// Generate document ID — uses timestamp + random to avoid collisions
// The old count-based approach (DOC-0001, DOC-0002...) causes E11000 errors
// when multiple documents are created concurrently in the same transaction
documentSchema.pre("save", async function () {
  if (this.isNew && !this.documentId) {
    // Use timestamp + random suffix for collision-proof IDs
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 9000 + 1000);
    this.documentId = `DOC-${ts}-${rand}`;
  }
});

export default mongoose.model("Document", documentSchema);