import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const testNeonMaterialStyles = async () => {
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

    // Check if style6 and style7 exist and have proper structure
    console.log("\n=== TESTING NEON AND MATERIAL STYLES ===");
    if (client.customization && client.customization.socialMediaStyles) {
      const style6 = client.customization.socialMediaStyles.style6;
      const style7 = client.customization.socialMediaStyles.style7;
      
      console.log("Style6 exists:", !!style6);
      if (style6) {
        console.log("Style6 name:", style6.name);
        console.log("Style6 icons object exists:", !!style6.icons);
        if (style6.icons) {
          console.log("Style6 icons keys:", Object.keys(style6.icons));
        }
      }
      
      console.log("Style7 exists:", !!style7);
      if (style7) {
        console.log("Style7 name:", style7.name);
        console.log("Style7 icons object exists:", !!style7.icons);
        if (style7.icons) {
          console.log("Style7 icons keys:", Object.keys(style7.icons));
        }
      }
    } else {
      console.log("❌ No customization data found");
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

testNeonMaterialStyles();