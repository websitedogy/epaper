import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const customizationSchema = new mongoose.Schema({
  // Navbar Settings
  navbar: {
    logoUrl: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    menuVisibility: {
      home: { type: Boolean, default: true },
      contactUs: { type: Boolean, default: true },
      aboutUs: { type: Boolean, default: true },
    },
    textColor: {
      type: String,
      default: "#000000",
    },
    logoSize: {
      type: Number,
      default: 120, // Default logo size in pixels
      min: 90,
    },
  },

  // Footer Settings
  footer: {
    address: {
      type: String,
      default: "",
    },
    contactNumbers: [
      {
        type: String,
      },
    ],
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    backgroundColor: {
      type: String,
      default: "#1a202c",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    copyright: {
      type: String,
      default: "",
    },
  },
});

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  redirectUrl: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String,
    enum: ["top", "bottom"],
    default: "top",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const paperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Paper title is required"],
      trim: true,
      default: "Untitled Edition",
    },
    slug: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client.categories",
      // Allow null or empty values for "none" option
      default: null,
      set: function(v) {
        // If "none" is passed, convert to null
        return v === "none" || v === "" ? null : v;
      }
    },
    subCategory: {
      type: String,
      trim: true,
    },
    scheduleDate: {
      type: Date,
    },
    scheduleTime: {
      type: String,
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    pdfSize: {
      type: Number, // Size in bytes
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        page: {
          type: Number,
        },
        imageUrl: {
          type: String,
        },
      },
    ],
    publishDate: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const epaperSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      unique: true,
    },

    // E-Paper Papers
    papers: [paperSchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// clientId already has unique: true, so no need for explicit index
epaperSchema.index({ "papers.publishDate": -1 });
epaperSchema.index({ "papers.isPublished": 1 });

const Epaper = mongoose.model("Epaper", epaperSchema);

export default Epaper;
