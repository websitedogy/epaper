import express from "express";
import {
  createRenewal,
  getAllRenewals,
  getRenewalsByClient,
  getRenewalById,
  updateRenewal,
  deleteRenewal,
  getDashboardStats,
} from "../controllers/renewalController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Apply admin authentication to all renewal routes
router.use(adminAuth);

// Dashboard stats
router.get("/stats/dashboard", getDashboardStats);

// Get renewals by client
router.get("/client/:clientId", getRenewalsByClient);

// CRUD operations
router.post("/", createRenewal);
router.get("/", getAllRenewals);
router.get("/:id", getRenewalById);
router.put("/:id", updateRenewal);
router.delete("/:id", deleteRenewal);

export default router;
