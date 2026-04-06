import Docket from "../models/Docket.js";

// Get all dockets
export const getAllDockets = async (req, res) => {
  try {
    const dockets = await Docket.find()
      .sort({ publishedDate: -1, createdAt: -1 })
      .lean(); // Use lean for better performance

    res.status(200).json({
      success: true,
      count: dockets.length,
      dockets,
    });
  } catch (error) {
    console.error("Error fetching all dockets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dockets",
      error: error.message,
    });
  }
};

// Get single docket by ID
export const getDocketById = async (req, res) => {
  try {
    const docket = await Docket.findById(req.params.id);

    if (!docket) {
      return res.status(404).json({
        success: false,
        message: "Docket not found",
      });
    }

    res.status(200).json({
      success: true,
      docket,
    });
  } catch (error) {
    console.error("Error fetching docket by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching docket",
      error: error.message,
    });
  }
};

// Optional: Get docket by docketId (string like JS-2026-XXX)
export const getDocketByDocketId = async (req, res) => {
  try {
    const docket = await Docket.findOne({ docketId: req.params.docketId });

    if (!docket) {
      return res.status(404).json({
        success: false,
        message: `Docket with ID ${req.params.docketId} not found`,
      });
    }

    res.status(200).json({
      success: true,
      docket,
    });
  } catch (error) {
    console.error("Error fetching docket by docketId:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching docket",
      error: error.message,
    });
  }
};

// Update docket (basic)
export const updateDocket = async (req, res) => {
  try {
    const docket = await Docket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!docket) {
      return res.status(404).json({
        success: false,
        message: "Docket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Docket updated successfully",
      docket,
    });
  } catch (error) {
    console.error("Error updating docket:", error);
    res.status(500).json({
      success: false,
      message: "Error updating docket",
      error: error.message,
    });
  }
};

// Delete docket (You already have a powerful version in adminRoutes, so keeping this simple)
export const deleteDocket = async (req, res) => {
  try {
    const docket = await Docket.findByIdAndDelete(req.params.id);

    if (!docket) {
      return res.status(404).json({
        success: false,
        message: "Docket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Docket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting docket:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting docket",
      error: error.message,
    });
  }
};

export default {
  getAllDockets,
  getDocketById,
  getDocketByDocketId,
  updateDocket,
  deleteDocket,
};