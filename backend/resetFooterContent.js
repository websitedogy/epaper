import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

// Load environment variables
dotenv.config();

const resetFooterContent = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Update all clients - reset footer contentText to empty
    const result = await Client.updateMany(
      {},
      {
        $set: {
          "customization.footer.contentText": "",
        },
      }
    );

    console.log(`✅ Successfully reset footer content for ${result.modifiedCount} clients`);
    console.log("All footer contentText fields have been cleared!");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting footer content:", error);
    process.exit(1);
  }
};

// Run the reset
resetFooterContent();
