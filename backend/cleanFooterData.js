import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const cleanFooterData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all clients
    const clients = await Client.find({});
    console.log(`Found ${clients.length} clients`);

    let updatedCount = 0;

    for (const client of clients) {
      // Reset all footer fields except contentText
      client.customization.footer = {
        contentText: client.customization.footer.contentText || "",
        // All other fields will use schema defaults
        address: "",
        contactNumbers: [],
        socialMedia: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
          youtube: "",
        },
        backgroundColor: "#1a202c",
        logoUrl: "",
        copyright: "",
        ownerPhotoUrl: "",
        ownerName: "",
        ownerTitle: "",
        ownerDescription: "",
        email: "",
        officeHours: "",
        trademark: "",
        privacyPolicyUrl: "",
        termsOfServiceUrl: "",
        newsletterSignup: "",
        developerName: "",
        developerWebsite: "",
        supportEmail: "",
        documentationUrl: "",
        versionInfo: "",
        textColor: "#000000",
        fontSize: 14,
        fontWeight: "normal",
        fontFamily: "Poppins",
        logoSize: 100,
        logoBorderRadius: 0,
        ownerPhotoSize: 100,
        ownerPhotoBorderRadius: 50,
        ownerMobileNo: "",
        ownerTextColor: "#000000",
        ownerTextSize: 14,
        ownerFontWeight: "normal",
        ownerFontFamily: "Poppins",
        contactName: "",
        contactMobileNo: "",
        contactGmail: "",
        contactTextColor: "#000000",
        contactTextSize: 14,
        contactTextWeight: "normal",
        contactFontFamily: "Poppins",
        contactWebsiteLink: "",
        customFooterCode: "",
      };

      await client.save();
      updatedCount++;
      console.log(`✅ Cleaned footer data for client: ${client.epaperName}`);
    }

    console.log(`\n✅ Successfully cleaned footer data for ${updatedCount} clients`);
    console.log("Only 'contentText' field has been preserved. All other footer fields have been reset.");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning footer data:", error);
    process.exit(1);
  }
};

// Run the cleanup
cleanFooterData();
