import mongoose from "mongoose";

const clippingSchema = new mongoose.Schema(
  {
    clipId: {
      type: Number,
      required: true,
      unique: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
    paperId: {
      type: String,
      required: false,
    },
    page: {
      type: Number,
      required: true,
    },
    coordinates: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
clippingSchema.index({ clipId: 1 });
clippingSchema.index({ clientId: 1 });
clippingSchema.index({ paperId: 1 });
clippingSchema.index({ createdAt: -1 });

const Clipping = mongoose.model("Clipping", clippingSchema);

export default Clipping;