import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes.js";
import renewalRoutes from "./routes/renewalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import epaperRoutes from "./routes/epaperRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import clippingRoutes from "./routes/clippingRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
console.log("Referral routes imported successfully");
import Client from "./models/Client.js";

// Set timezone to Asia/Kolkata
process.env.TZ = 'Asia/Kolkata';

dotenv.config();

// Debug: Log environment variables
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);
console.log("Timezone set to:", process.env.TZ);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // clientadmin
    'http://localhost:5174',  // clientadmin (alternative port)
    'http://localhost:3000',   // whitelabelfrontend
    'http://localhost:5001'    // for direct API calls
  ],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    // Add options to handle index creation properly
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
    
    // Sync indexes to ensure they match the schema
    console.log("Syncing database indexes...");
    await Client.syncIndexes();
    console.log("✅ Database indexes synced successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
console.log("Registering referral routes at /api/referrals");
console.log("Referral routes object:", referralRoutes);
app.use("/api/referrals", referralRoutes);
console.log("Referral routes registered");

app.use("/api/clients", clientRoutes);
app.use("/api/renewals", renewalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/epaper", epaperRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/subscription-plans", subscriptionPlanRoutes);
app.use("/api/clippings", clippingRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Test referral route
app.get("/api/test-referral", (req, res) => {
  console.log("Test referral route hit");
  res.json({ message: "Referral routes are working!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  console.log(`Request headers:`, req.headers);
  console.log(`Base URL:`, req.baseUrl);
  console.log(`Original URL:`, req.originalUrl);
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Registered routes:`);
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
    }
  });
  
  // Log all middleware
  console.log("Middleware stack:");
  app._router.stack.forEach((r, i) => {
    if (r.name) {
      console.log(`  ${i}: ${r.name}`);
    }
  });
});