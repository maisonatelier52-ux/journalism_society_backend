
import express from "express";
import Media from "../models/Media.js";
import MediaSubmission from "../models/MediaSubmission.js";
import Docket from "../models/Docket.js";

const router = express.Router();

// Helper: Check if media with same URL already exists (in Media or MediaSubmission)
const checkMediaExistsForDocket = async (url, docketId, excludeId = null) => {
  // Check in approved media
  const existingMedia = await Media.findOne({ 
    url, 
    docketId,
    ...(excludeId && { _id: { $ne: excludeId } })
  });
  
  if (existingMedia) return { exists: true, source: "approved", id: existingMedia._id };
  
  // Check in pending submissions
  const existingSubmission = await MediaSubmission.findOne({ 
    url, 
    docketId,
    status: "pending",
    ...(excludeId && { _id: { $ne: excludeId } })
  });
  
  if (existingSubmission) return { exists: true, source: "pending", id: existingSubmission._id };
  
  return { exists: false };
};

// GET all approved media (for media-watch page)
router.get("/", async (req, res) => {
  try {
    const { docketId } = req.query;
    const filter = { status: "approved" };
    if (docketId) filter.docketId = docketId;
    const media = await Media.find(filter).sort({ date: -1 });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET approved media by docket ID
router.get("/by-docket/:docketId", async (req, res) => {
  try {
    const media = await Media.find({
      docketId: req.params.docketId,
      status: "approved",
    }).sort({ date: -1 });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - User submits a media citation (goes to MediaSubmission, pending admin review)
router.post("/", async (req, res) => {
  try {
    const { docketId, outlet, headline, url, date, type, note, summary } = req.body;

    // Verify docket exists
    const docket = await Docket.findById(docketId);
    if (!docket) {
      return res.status(404).json({ success: false, message: "Docket not found" });
    }

    // Check if media with same URL already exists for this docket
    const duplicateCheck = await checkMediaExistsForDocket(url, docketId);
    
    if (duplicateCheck.exists) {
      let message = "";
      if (duplicateCheck.source === "approved") {
        message = "A media entry with this URL has already been approved for this docket. Please check the Media Watch section.";
      } else {
        message = "A media entry with this URL has already been submitted and is pending review. Please wait for the admin to review it.";
      }
      return res.status(409).json({ 
        success: false, 
        message: message
      });
    }

    const submission = new MediaSubmission({
      outlet,
      headline,
      url,
      date,
      type: type || "News",
      note: note || summary || "",
      docketId: docket._id,
      docketNumber: docket.docketId,
      status: "pending",
      submittedAt: new Date(),
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: "Media citation submitted for review ✅",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Error submitting media citation:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH approve (legacy)
router.patch("/:id/approve", async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { status: "approved", stance: "neutral" },
      { new: true }
    );
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;