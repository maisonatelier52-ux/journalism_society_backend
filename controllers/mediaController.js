import Media from "../models/Media.js";


// ✅ CREATE MEDIA (Submit citation)
export const createMedia = async (req, res) => {
  try {
    const {
      docketId,
      outlet,
      headline,
      url,
      date,
      type,
      summary
    } = req.body;

    // Validation
    if (!docketId || !outlet || !headline || !url || !date) {
      return res.status(400).json({
        error: "Required fields missing",
      });
    }

    const newMedia = new Media({
      docketId,
      outlet,
      headline,
      url,
      date,
      type,
      summary,
      status: "pending",
      stance: "pending",
    });

    await newMedia.save();

    res.status(201).json({
      message: "Media citation submitted ✅",
      data: newMedia,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};



// ✅ GET ALL MEDIA
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find();
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ✅ GET MEDIA BY DOCKET
export const getMediaByDocket = async (req, res) => {
  try {
    const { docketId } = req.params;

    const media = await Media.find({
      docketId,
      status: "approved", // only show approved
    });

    res.json(media);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ✅ APPROVE MEDIA (ADMIN)
export const approveMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findByIdAndUpdate(
      id,
      {
        status: "approved",
        stance: "neutral", // or decide later
      },
      { new: true }
    );

    res.json({
      message: "Media approved ✅",
      data: media,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ✅ DELETE MEDIA (optional)
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    await Media.findByIdAndDelete(id);

    res.json({
      message: "Media deleted 🗑️",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};