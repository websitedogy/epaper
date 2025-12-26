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

const listClients = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    console.log("Fetching all clients...");
    const clients = await Client.find({});
    console.log(`Found ${clients.length} clients:`);
    
    clients.forEach((client, index) => {
      console.log(`\n--- Client ${index + 1} ---`);
      console.log(`ID: ${client._id}`);
      console.log(`Email: ${client.email}`);
      console.log(`Phone: ${client.clientPhone}`);
      console.log(`Name: ${client.clientName}`);
      console.log(`E-Paper Name: ${client.epaperName}`);
    });
    
  } catch (error) {
    console.error("❌ Error fetching clients:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
    process.exit(0);
  }
};

listClients();