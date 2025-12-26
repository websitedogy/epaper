import express from "express";
import {
  verifyClient,
  getClientProfile,
  loginClient,
} from "../controllers/authController.js";

const router = express.Router();

// Verify client credentials
router.post("/verify", verifyClient);

// Login with email and password
router.post("/login", loginClient);

// Get client profile
router.get("/profile", getClientProfile);

export default router;
