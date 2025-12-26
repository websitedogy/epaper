import mongoose from "mongoose";

// Category Schema
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
      required: false, // Make it optional
      // Remove unique: true to prevent null duplicate issues
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

// SubCategory Schema
const subCategorySchema = new mongoose.Schema(
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
      required: false, // Make it optional
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client.categories",
      required: true,
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

// Page Schema
const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: false, // Make it optional
      // Remove unique: true to prevent null duplicate issues
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

// Customization Schema
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
      type: Map,
      of: Boolean,
      default: {
        home: true,
        contactUs: true,
        aboutUs: true
      }
    },
    textColor: {
      type: String,
      default: "#000000",
    },
    logoPosition: {
      type: String,
      enum: ["Left", "Center", "Right"],
      default: "Left",
    },
    logoSizePx: {
      type: Number,
      default: 120,
      min: 90,
      max: 200,
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
    // New fields for enhanced footer settings
    ownerPhotoUrl: {
      type: String,
      default: "",
    },
    ownerName: {
      type: String,
      default: "",
    },
    ownerTitle: {
      type: String,
      default: "",
    },
    ownerDescription: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    officeHours: {
      type: String,
      default: "",
    },
    trademark: {
      type: String,
      default: "",
    },
    privacyPolicyUrl: {
      type: String,
      default: "",
    },
    termsOfServiceUrl: {
      type: String,
      default: "",
    },
    newsletterSignup: {
      type: String,
      default: "",
    },
    developerName: {
      type: String,
      default: "",
    },
    developerWebsite: {
      type: String,
      default: "",
    },
    supportEmail: {
      type: String,
      default: "",
    },
    documentationUrl: {
      type: String,
      default: "",
    },
    versionInfo: {
      type: String,
      default: "",
    },
    // Fields for Content & Logo customization
    contentText: {
      type: String,
      default: "",
    },
    textColor: {
      type: String,
      default: "#000000",
    },
    fontSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 40,
    },
    fontWeight: {
      type: String,
      default: "normal",
    },
    fontFamily: {
      type: String,
      default: "Poppins",
    },
    logoSize: {
      type: Number,
      default: 100,
      min: 50,
      max: 300,
    },
    logoBorderRadius: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    // Fields for Owner Photo customization
    ownerPhotoSize: {
      type: Number,
      default: 100,
      min: 50,
      max: 300,
    },
    ownerPhotoBorderRadius: {
      type: Number,
      default: 50,
      min: 0,
      max: 50,
    },
    ownerMobileNo: {
      type: String,
      default: "",
    },
    ownerTextColor: {
      type: String,
      default: "#000000",
    },
    ownerTextSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 40,
    },
    ownerFontWeight: {
      type: String,
      default: "normal",
    },
    ownerFontFamily: {
      type: String,
      default: "Poppins",
    },
    // Fields for Contact Us customization
    contactName: {
      type: String,
      default: "",
    },
    contactMobileNo: {
      type: String,
      default: "",
    },
    contactGmail: {
      type: String,
      default: "",
    },
    contactTextColor: {
      type: String,
      default: "#000000",
    },
    contactTextSize: {
      type: Number,
      default: 14,
      min: 10,
      max: 40,
    },
    contactTextWeight: {
      type: String,
      default: "normal",
    },
    contactFontFamily: {
      type: String,
      default: "Poppins",
    },
    contactWebsiteLink: {
      type: String,
      default: "",
    },
    // Fields for Add-ons customization
    customFooterCode: {
      type: String,
      default: "",
    },
  },
  
  // Clip Settings
  clip: {
    borderColor: {
      type: String,
      default: "#10b981",
    },
    backgroundColor: {
      type: String,
      default: "rgba(16, 185, 129, 0.1)",
    },
    borderWidth: {
      type: Number,
      default: 2,
    },
    watermarkText: {
      type: String,
      default: "E-Paper",
    },
    watermarkFontSize: {
      type: Number,
      default: 12,
    },
    watermarkColor: {
      type: String,
      default: "rgba(255, 255, 255, 0.7)",
    },
    topClip: {
      position: {
        type: String,
        enum: ["Left", "Center", "Right"],
        default: "Left",
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      logoHeight: {
        type: Number,
        default: 50,
      },
    },
    footerClip: {
      position: {
        type: String,
        enum: ["Left", "Center", "Right"],
        default: "Left",
      },
      backgroundColor: {
        type: String,
        default: "#ffffff",
      },
      logoHeight: {
        type: Number,
        default: 50,
      },
    },
    displayOptions: {
      showDate: {
        type: Boolean,
        default: true,
      },
      showPageNumber: {
        type: Boolean,
        default: true,
      },
    },
    topLogoUrl: {
      type: String,
      default: "",
    },
    footerLogoUrl: {
      type: String,
      default: "",
    },
  },
  
  // Top Toolbar Settings
  topToolbarSettings: {
    showToolbar: {
      type: Boolean,
      default: true,
    },
    modifiedHtml: {
      type: String,
      default: "",
    },
    modifiedCss: {
      type: String,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    buttonSettings: {
      clip: { type: Boolean, default: true },
      pdf: { type: Boolean, default: true },
      calendar: { type: Boolean, default: true },
    },
  },
  
  // Breaking News Settings
  breakingNews: [
    {
      id: {
        type: String,
        required: true
      },
      enabled: {
        type: Boolean,
        default: false
      },
      backgroundColor: {
        type: String,
        default: "#dc2626"
      },
      text: {
        type: String,
        default: ""
      },
      textColor: {
        type: String,
        default: "#ffffff"
      },
      fontSize: {
        type: Number,
        default: 16,
        min: 12,
        max: 32
      },
      fontFamily: {
        type: String,
        default: "Arial, sans-serif"
      },
      scrollSpeed: {
        type: String,
        enum: ["slow", "normal", "fast"],
        default: "normal"
      },
      linkUrl: {
        type: String,
        default: ""
      }
    }
  ],
  
  // Promotional Banners Settings (Array of banners)
  promotionalBanners: [
    {
      id: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
      },
      imageUrl: {
        type: String,
        default: ""
      },
      redirectUrl: {
        type: String,
        default: ""
      },
      isActive: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ""
      },
      description: {
        type: String,
        default: ""
      }
    }
  ],
  
  // Social Links Settings
  socialLinks: {
    iconStyle: {
      type: String,
      default: "circle",
      enum: ["circle", "square-outline", "rounded-gradient", "flat-minimal", "shadow", "neon-glow", "material"]
    },
    links: {
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      x: { type: String, default: "" },
      telegram: { type: String, default: "" }
    }
  },
  
  // Social Media Icons Settings
  socialMediaStyles: {
    style1: {
      name: { type: String, default: "Style 1" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style2: {
      name: { type: String, default: "Style 2" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style3: {
      name: { type: String, default: "Style 3" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style4: {
      name: { type: String, default: "Style 4" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style5: {
      name: { type: String, default: "Style 5" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style6: {
      name: { type: String, default: "Style 6" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    },
    style7: {
      name: { type: String, default: "Style 7" },
      icons: {
        facebook: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        youtube: { type: String, default: "" },
        x: { type: String, default: "" },
        telegram: { type: String, default: "" },
      }
    }
  },
  selectedSocialMediaStyle: { type: String, default: "style1" }

});

// Ad Schema
const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
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

const clientSchema = new mongoose.Schema(
  {
    epaperName: {
      type: String,
      required: [true, "Epaper Name is required"],
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, "Client Name is required"],
      trim: true,
    },
    clientPhone: {
      type: String,
      required: [true, "Client Phone Number is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      unique: true,
    },
    address: {
      street: {
        type: String,
        required: [true, "Street is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
      village: {
        type: String,
        required: [true, "Village is required"],
        trim: true,
      },
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
    },
    alternativeNumber: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      required: [true, "Start Date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    apiPasscode: {
      type: String,
      required: true,
      trim: true,
    },
    // Categories
    categories: [categorySchema],
    // SubCategories
    subCategories: [subCategorySchema],
    // Pages
    pages: [pageSchema],
    // Customization Settings
    customization: {
      type: customizationSchema,
      default: () => ({}),
    },
    // Ads Management
    ads: [adSchema],
    
    // Referral Earnings
    referralEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Explicitly define indexes for better control
clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ clientPhone: 1 }, { unique: true });
clientSchema.index({ apiKey: 1 }, { unique: true });

const Client = mongoose.model("Client", clientSchema);

export default Client;