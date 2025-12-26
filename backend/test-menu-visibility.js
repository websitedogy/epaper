import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    return false;
  }
};

const testMenuVisibility = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    console.log("Testing menu visibility functionality...");
    
    // Find a client to test with
    const client = await Client.findOne();
    if (!client) {
      console.log("No clients found in database");
      return;
    }
    
    console.log("Found client:", client.epaperName);
    console.log("Current menu visibility:", client.customization.navbar.menuVisibility);
    
    // Test adding a new page to menu visibility
    const testPageSlug = "test-page-" + Date.now();
    client.customization.navbar.menuVisibility[testPageSlug] = true;
    
    await client.save();
    console.log("✅ Added test page to menu visibility");
    
    // Verify the change was saved
    const updatedClient = await Client.findById(client._id);
    console.log("Updated menu visibility:", updatedClient.customization.navbar.menuVisibility);
    
    // Test removing the test page
    delete updatedClient.customization.navbar.menuVisibility[testPageSlug];
    await updatedClient.save();
    console.log("✅ Removed test page from menu visibility");
    
  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

testMenuVisibility();