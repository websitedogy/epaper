import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const debugSocialMediaStyles = async () => {
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

    // Debug social media styles structure
    console.log("\n=== DEBUGGING SOCIAL MEDIA STYLES ===");
    if (client.customization && client.customization.socialMediaStyles) {
      console.log("Checking all styles:");
      Object.keys(client.customization.socialMediaStyles).forEach(styleKey => {
        const style = client.customization.socialMediaStyles[styleKey];
        console.log(`\n${styleKey}:`);
        console.log(`  Name: ${style.name || "Not set"}`);
        if (style.icons) {
          console.log("  Icons:");
          Object.keys(style.icons).forEach(platform => {
            const url = style.icons[platform];
            console.log(`    ${platform}: ${url || "(empty)"}`);
          });
        }
      });
    } else {
      console.log("❌ No social media styles found in database");
    }

    // Check if all 7 styles exist
    console.log("\n=== STYLE VALIDATION ===");
    const expectedStyles = ['style1', 'style2', 'style3', 'style4', 'style5', 'style6', 'style7'];
    const missingStyles = expectedStyles.filter(style => !client.customization.socialMediaStyles[style]);
    
    if (missingStyles.length === 0) {
      console.log("✅ All 7 styles are present!");
    } else {
      console.log(`❌ Missing styles: ${missingStyles.join(', ')}`);
    }

    await mongoose.connection.close();
    console.log("\n🔒 Disconnected from MongoDB");
  } catch (error) {
    console.error("💥 Error:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
};

debugSocialMediaStyles();