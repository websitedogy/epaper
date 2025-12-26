import express from "express";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getActiveSubscriptionPlans,
} from "../controllers/subscriptionPlanController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route for active subscription plans
router.route("/active").get(getActiveSubscriptionPlans);

// Apply admin authentication to protected routes
router.use(adminAuth);

router.route("/").post(createSubscriptionPlan).get(getSubscriptionPlans);
router.route("/:id").get(getSubscriptionPlanById).put(updateSubscriptionPlan).delete(deleteSubscriptionPlan);

export default router;