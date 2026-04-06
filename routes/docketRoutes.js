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

// // routes/docketRoutes.js
// import express from "express";
// import {
//   getAllDockets,
//   getDocketById,
//   getDocketByDocketId,
//   updateDocket,
//   deleteDocket,
// } from "../controllers/docketController.js";

// const router = express.Router();

// router.get("/", getAllDockets);
// router.get("/:id", getDocketById);
// router.get("/by-docket-id/:docketId", getDocketByDocketId);   // Optional
// router.patch("/:id", updateDocket);
// router.delete("/:id", deleteDocket);

// export default router;