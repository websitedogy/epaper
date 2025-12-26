import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  // Client who referred someone
  referringClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  // Details of the referred client
  referredClientDetails: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
      village: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
    },
  },
  // Amount to be awarded for this referral
  referralAmount: {
    type: Number,
    default: 0,
  },
  // Status of the referral
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  // Superadmin who approved/rejected
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming you have a User model for superadmins
  },
  // Date when reviewed
  reviewedAt: {
    type: Date,
  },
  // Notes from reviewer
  reviewNotes: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

// Index for better query performance
referralSchema.index({ referringClientId: 1 });
referralSchema.index({ status: 1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;