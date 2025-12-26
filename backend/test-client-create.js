import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";
import crypto from "crypto";

dotenv.config();

// Generate random API Key
const generateApiKey = () => {
  return "ak_" + crypto.randomBytes(24).toString("hex");
};

// Generate random API Passcode
const generateApiPasscode = () => {
  return "pc_" + crypto.randomBytes(16).toString("hex");
};

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

const testClientCreation = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    console.log("Testing client creation with sample data...");
    
    // Test data - completely new email and phone
    const testData = {
      epaperName: "Test Newspaper",
      clientName: "Test Client",
      clientPhone: "1234567890", // Completely new phone
      email: "test@example.com", // Completely new email
      address: {
        street: "123 Test Street",
        pincode: "123456",
        village: "Test Village",
        district: "Test District",
        state: "Test State"
      },
      alternativeNumber: "",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      password: "testpassword123",
      apiKey: generateApiKey(),
      apiPasscode: generateApiPasscode()
    };
    
    console.log("Test data:", testData);
    
    // Check if client with same email or phone already exists
    console.log("Checking for existing clients...");
    const existingClient = await Client.findOne({
      $or: [
        { clientPhone: testData.clientPhone },
        { email: testData.email }
      ]
    });
    
    if (existingClient) {
      console.log("❌ Found existing client:");
      console.log("Email match:", existingClient.email === testData.email);
      console.log("Phone match:", existingClient.clientPhone === testData.clientPhone);
      console.log("Existing client:", existingClient);
    } else {
      console.log("✅ No existing client found, proceeding with creation...");
      
      // Try to create the client
      const client = new Client(testData);
      await client.save();
      console.log("✅ Client created successfully:", client._id);
    }
    
  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

testClientCreation();