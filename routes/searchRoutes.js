// routes/searchRoutes.js
import express from "express";
import Docket from "../models/Docket.js";
import Document from "../models/Document.js";
import Media from "../models/Media.js";
import PressRelease from "../models/PressRelease.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [] });
    }

    const query = q.trim();
    const regex = new RegExp(query, "i"); // case-insensitive

    // Run all searches in parallel
    const [dockets, documents, media, pressReleases] = await Promise.all([
      Docket.find({
        $or: [
          { docketId: regex },
          { "response.title": regex },
          { "respondent.name": regex },
          { "summary.claim": regex },
        ],
      }).select("docketId response.title respondent.name status publishedDate").limit(5),

      Document.find({
        $or: [
          { documentId: regex },
          { title: regex },
          { type: regex },
        ],
      }).select("documentId title type sourceDocketNumber").limit(5),

      Media.find({
        status: "approved",
        $or: [
          { mediaId: regex },
          { headline: regex },
          { outlet: regex },
        ],
      }).select("mediaId headline outlet date stance").limit(5),

      PressRelease.find({
        $or: [
          { id: regex },
          { title: regex },
          { category: regex },
        ],
      }).select("id title category date").limit(5),
    ]);

    const results = [
      ...dockets.map(d => ({
        type: "docket",
        id: d.docketId,
        _id: d._id,
        title: d.response?.title || "Untitled Docket",
        subtitle: d.respondent?.name,
        status: d.status,
        href: `/dockets/${d._id}`,
      })),
      ...documents.map(d => ({
        type: "document",
        id: d.documentId,
        _id: d._id,
        title: d.title,
        subtitle: d.type,
        href: `/document-room/${d._id}`,
      })),
      ...media.map(m => ({
        type: "media",
        id: m.mediaId,
        _id: m._id,
        title: m.headline,
        subtitle: m.outlet,
        stance: m.stance,
        href: `/media-watch`,
      })),
      ...pressReleases.map(p => ({
        type: "press_release",
        id: p.id,
        _id: p._id,
        title: p.title,
        subtitle: p.category,
        href: `/press-releases/${p._id}`,
      })),
    ];

    res.json({ success: true, results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;