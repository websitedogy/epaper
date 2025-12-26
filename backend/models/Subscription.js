import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  start_at: {
    type: Date,
    default: Date.now,
  },
  end_at: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
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
subscriptionSchema.index({ client: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ end_at: 1 });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
