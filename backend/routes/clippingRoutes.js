import express from "express";
import {
  createClipping,
  getClippingByClipId,
  getClientClippings,
  deleteClipping
} from "../controllers/clippingController.js";
import protect from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// All routes except getClippingByClipId require authentication
router.route("/").post(protect, upload.single('clippingImage'), createClipping).get(protect, getClientClippings);
router.route("/:clipId").get(getClippingByClipId).delete(protect, deleteClipping);

export default router;