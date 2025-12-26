import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  features: [{
    type: String,
  }],
  description: {
    type: String,
  },
  paymentLink: {
    type: String,
  },
  bankDetails: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
subscriptionPlanSchema.index({ name: 1 });
subscriptionPlanSchema.index({ isActive: 1 });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;