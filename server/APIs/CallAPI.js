import express from "express";

import {
  createCall,
  getCalls,
  updateCall,
} from "../controllers/CallController.js";

const router = express.Router();

router.post("/create", createCall);

router.get("/history", getCalls);

router.put("/:id", updateCall);

export const callRoute = router;
