import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Client model
const clientSchema = new mongoose.Schema({
  epaperName: String,
  clientName: String,
  clientPhone: {
    type: String,
    required: [true, "Client Phone Number is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  address: {
    street: String,
    pincode: String,
    village: String,
    district: String,
    state: String,
  },
  alternativeNumber: {
    type: String,
    trim: true,
    default: "",
  },
  startDate: Date,
  expiryDate: Date,
  password: String,
  apiKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  apiPasscode: {
    type: String,
    required: true,
    trim: true,
  },
});

// Index for better query performance
clientSchema.index({ email: 1 });
clientSchema.index({ clientPhone: 1 });

const Client = mongoose.model("Client", clientSchema);

// Check indexes
const checkIndexes = async () => {
  await connectDB();

  try {
    const indexes = await Client.collection.getIndexes();
    console.log("📋 Current indexes on Client collection:");
    console.log(JSON.stringify(indexes, null, 2));

    // Check for duplicate entries
    console.log("\n🔍 Checking for duplicate emails:");
    const duplicateEmails = await Client.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          clients: { $push: { _id: "$_id", clientName: "$clientName" } },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (duplicateEmails.length > 0) {
      console.log("⚠️  Found duplicate emails:");
      duplicateEmails.forEach((item) => {
        console.log(`  Email: ${item._id} (${item.count} occurrences)`);
        item.clients.forEach((client) => {
          console.log(`    - ${client.clientName} (${client._id})`);
        });
      });
    } else {
      console.log("✅ No duplicate emails found");
    }

    console.log("\n🔍 Checking for duplicate phone numbers:");
    const duplicatePhones = await Client.aggregate([
      {
        $group: {
          _id: "$clientPhone",
          count: { $sum: 1 },
          clients: { $push: { _id: "$_id", clientName: "$clientName" } },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (duplicatePhones.length > 0) {
      console.log("⚠️  Found duplicate phone numbers:");
      duplicatePhones.forEach((item) => {
        console.log(`  Phone: ${item._id} (${item.count} occurrences)`);
        item.clients.forEach((client) => {
          console.log(`    - ${client.clientName} (${client._id})`);
        });
      });
    } else {
      console.log("✅ No duplicate phone numbers found");
    }
  } catch (error) {
    console.error("❌ Error checking indexes:", error.message);
  }

  mongoose.connection.close();
};

checkIndexes();
