import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const testSocialMediaSave = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a client to test with
    const client = await Client.findOne({});
    
    if (!client) {
      console.log("❌ No client found in database");
      return;
    }

    console.log(`\n📋 Testing client: ${client.epaperName}`);
    console.log(`🆔 Client ID: ${client._id}`);

    // Simulate what the frontend sends - social media data in customization object
    const socialMediaData = {
      socialMediaStyles: {
        style1: {
          name: "Style 1",
          icons: {
            facebook: "https://facebook.com/actualtest",
            whatsapp: "https://wa.me/9876543210",
            instagram: "https://instagram.com/actualtest",
            linkedin: "https://linkedin.com/company/actualtest",
            youtube: "https://youtube.com/channel/actualtest",
            x: "https://x.com/actualtest",
            telegram: "https://t.me/actualtestgroup"
          }
        },
        style2: {
          name: "Style 2",
          icons: {
            facebook: "",
            whatsapp: "",
            instagram: "",
            linkedin: "",
            youtube: "",
            x: "",
            telegram: ""
          }
        },
        style3: {
          name: "Style 3",
          icons: {
            facebook: "",
            whatsapp: "",
            instagram: "",
            linkedin: "",
            youtube: "",
            x: "",
            telegram: ""
          }
        },
        style4: {
          name: "Style 4",
          icons: {
            facebook: "",
            whatsapp: "",
            instagram: "",
            linkedin: "",
            youtube: "",
            x: "",
            telegram: ""
          }
        },
        style5: {
          name: "Style 5",
          icons: {
            facebook: "",
            whatsapp: "",
            instagram: "",
            linkedin: "",
            youtube: "",
            x: "",
            telegram: ""
          }
        }
      },
      selectedSocialMediaStyle: "style1"
    };

    console.log("\n📤 Simulating frontend data send:");
    console.log(JSON.stringify(socialMediaData, null, 2));

    // This is what the backend does with the data
    console.log("\n🔄 Processing data in backend...");
    
    // Merge with existing customization
    if (!client.customization) {
      client.customization = {};
    }
    
    // Update social media styles
    client.customization.socialMediaStyles = {
      ...(client.customization.socialMediaStyles || {}),
      ...socialMediaData.socialMediaStyles
    };
    
    // Update selected style
    client.customization.selectedSocialMediaStyle = socialMediaData.selectedSocialMediaStyle;

    // Save to database
    await client.save();
    console.log("✅ Data saved to database!");

    // Verify the data was saved
    console.log("\n🔍 Verifying saved data:");
    
    // Re-fetch the client to ensure we have the latest data
    const updatedClient = await Client.findById(client._id);
    
    if (updatedClient.customization && updatedClient.customization.socialMediaStyles) {
      console.log("✅ Social media styles found in database!");
      console.log(`🎯 Selected Style: ${updatedClient.customization.selectedSocialMediaStyle}`);
      
      const style1 = updatedClient.customization.socialMediaStyles.style1;
      if (style1 && style1.icons) {
        console.log("\n📱 Style 1 URLs:");
        Object.keys(style1.icons).forEach(platform => {
          const url = style1.icons[platform];
          if (url && url.trim() !== "") {
            console.log(`  ${platform}: ${url}`);
          } else {
            console.log(`  ${platform}: (empty)`);
          }
        });
      }
    } else {
      console.log("❌ No social media styles found in database");
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

testSocialMediaSave();