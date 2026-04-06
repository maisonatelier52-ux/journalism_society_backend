// models/PressRelease.js
import mongoose from "mongoose";

const pressReleaseSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: "Journalism Society Editorial Team" },
  tags: [{ type: String }],
  featuredImage: { type: String, default: "" },
  publishedDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Generate ID before saving
// Fixed - finds the highest existing ID and increments it
pressReleaseSchema.pre("save", async function() {
  if (this.isNew && !this.id) {
    const year = new Date().getFullYear();
    const latest = await mongoose.model("PressRelease")
      .findOne({ id: new RegExp(`^PR-${year}-`) })
      .sort({ id: -1 });
    
    const nextNum = latest
      ? parseInt(latest.id.split("-")[2]) + 1
      : 1;
    
    this.id = `PR-${year}-${String(nextNum).padStart(3, "0")}`;
  }
});

export default mongoose.model("PressRelease", pressReleaseSchema);