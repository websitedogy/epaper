import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "./models/Client.js";

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    return false;
  }
};

const cleanupClients = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    process.exit(1);
  }

  try {
    console.log("Starting client data cleanup...");
    
    // 1. Remove old records with empty phone/email
    console.log("Removing records with empty clientPhone or email...");
    const deleteResult = await Client.deleteMany({
      $or: [
        { clientPhone: { $in: [null, "", " "] } },
        { email: { $in: [null, "", " "] } }
      ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} records with empty phone/email`);
    
    // 2. Sync indexes to recreate clean unique indexes
    console.log("Syncing database indexes...");
    await Client.syncIndexes();
    console.log("✅ Database indexes synced successfully");
    
    // 3. Verify the cleanup
    const remainingClients = await Client.find({});
    console.log(`Remaining clients in database: ${remainingClients.length}`);
    
    console.log("✅ Client data cleanup completed successfully");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

cleanupClients();