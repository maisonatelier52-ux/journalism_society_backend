


// models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["created", "updated", "deleted"],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["submission", "docket", "media", "press_release", "document", "flag", "correction"],
      required: true,
    },
    entityId: String,
    entityTitle: String,
    entitySubtitle: String,
    performedBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);