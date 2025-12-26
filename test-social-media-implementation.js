const mongoose = require("mongoose");
require("dotenv").config();
const ClientModule = require("./backend/models/Client.js");
const Client = ClientModule.default || ClientModule;

const testSocialMediaImplementation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://websitedogy_db_user:Zealstar_02@cluster0.p6nxafh.mongodb.net/epaper_db?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ Connected to MongoDB");

    // Find a client to test with
    const client = await Client.findOne({});
    
    if (!client) {
      console.log("❌ No client found in database");
      return;
    }

    console.log(`\n📋 Testing client: ${client.epaperName}`);
    console.log(`🆔 Client ID: ${client._id}`);

    // Test 1: Check if socialMedia data is stored in customization.socialMedia
    console.log("\n=== TEST 1: Checking socialMedia storage location ===");
    if (client.customization && client.customization.socialMedia) {
      console.log("✅ socialMedia data found in customization.socialMedia");
      
      // Check styles
      if (client.customization.socialMedia.styles) {
        console.log("✅ socialMedia.styles found");
        const styleKeys = Object.keys(client.customization.socialMedia.styles);
        console.log(`   Available styles: ${styleKeys.join(", ")}`);
        
        // Check a specific style
        if (client.customization.socialMedia.styles.style1) {
          console.log("✅ style1 found");
          if (client.customization.socialMedia.styles.style1.icons) {
            console.log("✅ style1.icons found");
            const platforms = Object.keys(client.customization.socialMedia.styles.style1.icons);
            console.log(`   Platforms: ${platforms.join(", ")}`);
          }
        }
      }
      
      // Check selected style
      if (client.customization.socialMedia.selectedStyle) {
        console.log(`✅ Selected style: ${client.customization.socialMedia.selectedStyle}`);
      }
    } else {
      console.log("❌ socialMedia data NOT found in customization.socialMedia");
      console.log("   This might indicate the implementation is not working correctly");
    }

    // Test 2: Verify data structure
    console.log("\n=== TEST 2: Verifying data structure ===");
    const expectedStructure = {
      customization: {
        socialMedia: {
          styles: "object with style1-style7",
          selectedStyle: "string"
        }
      }
    };
    
    if (client.customization && client.customization.socialMedia) {
      const socialMedia = client.customization.socialMedia;
      
      // Check if styles exist and have the right structure
      if (socialMedia.styles && typeof socialMedia.styles === 'object') {
        console.log("✅ socialMedia.styles has correct structure");
        
        // Check if selectedStyle exists and is a string
        if (socialMedia.selectedStyle && typeof socialMedia.selectedStyle === 'string') {
          console.log("✅ socialMedia.selectedStyle has correct structure");
        } else {
          console.log("❌ socialMedia.selectedStyle missing or incorrect type");
        }
      } else {
        console.log("❌ socialMedia.styles missing or incorrect type");
      }
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

testSocialMediaImplementation();