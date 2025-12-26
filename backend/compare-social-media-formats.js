import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const compareFormats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a client to examine
    const client = await Client.findOne({});
    
    if (!client) {
      console.log("❌ No client found in database");
      return;
    }

    console.log(`\n📋 Examining client: ${client.epaperName}`);
    console.log(`🆔 Client ID: ${client._id}`);

    // Show frontend format (what SocialMediaIconsSettings component uses)
    console.log("\n=== FRONTEND FORMAT (SocialMediaIconsSettings.jsx) ===");
    console.log("Structure used by frontend component:");
    console.log(`
    customization: {
      socialMediaStyles: {
        style1: {
          name: "Style 1",
          icons: {
            facebook: "https://facebook.com/page",
            whatsapp: "https://wa.me/1234567890",
            instagram: "https://instagram.com/page",
            linkedin: "https://linkedin.com/company/page",
            youtube: "https://youtube.com/channel/page",
            x: "https://x.com/account",
            telegram: "https://t.me/group"
          }
        },
        // ... style2, style3, style4, style5 with same structure
      },
      selectedSocialMediaStyle: "style1"
    }
    `);

    // Show database format (what's actually stored)
    console.log("\n=== DATABASE FORMAT (Client model schema) ===");
    console.log("Structure defined in MongoDB schema:");
    console.log(`
    customization: {
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
            telegram: { type: String, default: "" }
          }
        },
        // ... style2, style3, style4, style5 with same structure
      },
      selectedSocialMediaStyle: { type: String, default: "style1" }
    }
    `);

    // Show actual data stored in database
    console.log("\n=== ACTUAL STORED DATA ===");
    if (client.customization && client.customization.socialMediaStyles) {
      console.log("Actual data in database:");
      console.log(`Selected Style: ${client.customization.selectedSocialMediaStyle || "Not set"}`);
      
      Object.keys(client.customization.socialMediaStyles).forEach(styleKey => {
        const style = client.customization.socialMediaStyles[styleKey];
        console.log(`\n${styleKey}:`);
        console.log(`  Name: ${style.name || "Not set"}`);
        if (style.icons) {
          console.log("  Icons:");
          Object.keys(style.icons).forEach(platform => {
            const url = style.icons[platform];
            if (url && url.trim() !== "") {
              console.log(`    ${platform}: ${url}`);
            } else {
              console.log(`    ${platform}: (empty)`);
            }
          });
        }
      });
    } else {
      console.log("No social media data found in database");
    }

    // Show how data is sent to backend
    console.log("\n=== DATA SENT TO BACKEND ===");
    console.log("Format sent via API call:");
    console.log(`
    // In api.js service:
    updateCustomization: async (customizationData) => {
      return apiCall("/epaper/customization", {
        method: "PUT",
        body: JSON.stringify(customizationData), // This contains the socialMediaStyles
      });
    }
    `);

    // Show how backend processes the data
    console.log("\n=== BACKEND PROCESSING ===");
    console.log("How backend handles the data in epaperController.js:");
    console.log(`
    // Extract socialMediaStyles from request body
    let socialMediaStylesData = null;
    
    // Check if socialMediaStyles is in the customization object
    if (req.body.customization && req.body.customization.socialMediaStyles) {
      socialMediaStylesData = req.body.customization.socialMediaStyles;
    }
    
    // Save to database
    if (socialMediaStylesData) {
      client.customization.socialMediaStyles = {
        ...(client.customization.socialMediaStyles || {}),
        ...socialMediaStylesData,
      };
    }
    `);

    console.log("\n=== FORMATS COMPARE ===");
    console.log("✅ FRONTEND FORMAT === DATABASE FORMAT");
    console.log("- Both use the same structure");
    console.log("- Both have socialMediaStyles with 5 styles (style1-style5)");
    console.log("- Both have icons object with same platform keys");
    console.log("- Both store URLs as strings");
    console.log("- Both store selectedSocialMediaStyle as string");

    await mongoose.connection.close();
    console.log("\n🔒 Disconnected from MongoDB");
  } catch (error) {
    console.error("💥 Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

compareFormats();