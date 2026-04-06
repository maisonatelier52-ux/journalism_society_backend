// routes/documentsRoutes.js
import express from "express";
import Document from "../models/Document.js";
import Docket from "../models/Docket.js";

const router = express.Router();

// Get all documents (exhibits from all dockets)
router.get("/", async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get document by ID
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get documents by docket ID
router.get("/by-docket/:docketId", async (req, res) => {
  try {
    const documents = await Document.find({ sourceDocketId: req.params.docketId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;