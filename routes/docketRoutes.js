import express from "express";
import Docket from "../models/Docket.js";

const router = express.Router();

// GET all dockets
router.get("/", async (req, res) => {
  const data = await Docket.find();
  res.json(data);
});

// GET single docket
router.get("/:id", async (req, res) => {
  const data = await Docket.findById(req.params.id);
  res.json(data);
});

export default router;
