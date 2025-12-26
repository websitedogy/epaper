import express from "express";
import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
  getClientSubscription,
} from "../controllers/subscriptionController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Apply admin authentication to all subscription routes
router.use(adminAuth);

router.route("/").post(createSubscription).get(getSubscriptions);

router.route("/:id").put(updateSubscription).delete(deleteSubscription);

router.route("/client/:clientId").get(getClientSubscription);

export default router;
