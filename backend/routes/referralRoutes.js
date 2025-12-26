import express from "express";
import {
  submitReferral,
  getReferralsByClientId,
  getAllReferrals,
  updateReferralStatus,
  getReferralEarnings
} from "../controllers/referralController.js";

const router = express.Router();

console.log("Referral routes module loaded");

// Simple test route
router.get("/test", (req, res) => {
  console.log("Referral test route hit");
  res.json({ message: "Referral routes are working!" });
});

// Another test route
router.get("/ping", (req, res) => {
  console.log("Referral ping route hit");
  res.json({ message: "pong" });
});

// Client submits a referral
router.post("/", submitReferral);

// Get referrals submitted by a specific client
router.get("/client/:clientId", getReferralsByClientId);

// Superadmin gets all referrals (with filtering options)
router.get("/", getAllReferrals);

// Superadmin updates referral status (approve/reject)
router.put("/:id/status", updateReferralStatus);

// Get total referral earnings for a client
router.get("/earnings/:clientId", getReferralEarnings);

export default router;