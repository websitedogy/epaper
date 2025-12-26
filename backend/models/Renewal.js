import mongoose from "mongoose";

const renewalSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    epaperName: {
      type: String,
      required: true,
    },
    previousExpiryDate: {
      type: Date,
      required: true,
    },
    newExpiryDate: {
      type: Date,
      required: true,
    },
    extensionDays: {
      type: Number,
      required: true,
    },
    renewalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
renewalSchema.index({ clientId: 1 });
renewalSchema.index({ createdAt: -1 });

const Renewal = mongoose.model("Renewal", renewalSchema);

export default Renewal;
