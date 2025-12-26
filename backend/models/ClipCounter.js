import mongoose from "mongoose";

const clipCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: "clipCounter"
  },
  lastClipId: {
    type: Number,
    default: 0
  }
});

// Ensure only one document exists for the counter
clipCounterSchema.statics.getNextClipId = async function() {
  const counter = await this.findOneAndUpdate(
    { _id: "clipCounter" },
    { $inc: { lastClipId: 1 } },
    { new: true, upsert: true }
  );
  return counter.lastClipId;
};

const ClipCounter = mongoose.model("ClipCounter", clipCounterSchema);

export default ClipCounter;