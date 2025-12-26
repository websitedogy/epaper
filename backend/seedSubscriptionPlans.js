import mongoose from "mongoose";
import dotenv from "dotenv";
import SubscriptionPlan from "./models/SubscriptionPlan.js";

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Seed subscription plans
const seedSubscriptionPlans = async () => {
  try {
    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log("Cleared existing subscription plans");

    // Create sample subscription plans
    const plans = [
      {
        name: "1 Year Plan",
        amount: 99,
        duration: "1 year",
        discount: 0,
        features: [
          "Full access to all features",
          "Unlimited clients",
          "Priority support",
          "Regular updates",
          "Cloud storage",
        ],
        description: "Perfect for small businesses getting started",
      },
      {
        name: "4 Years Plan",
        amount: 299,
        duration: "4 years",
        discount: 10,
        features: [
          "Full access to all features",
          "Unlimited clients",
          "24/7 priority support",
          "Regular updates",
          "Cloud storage",
          "Custom branding",
          "Advanced analytics",
        ],
        description: "Best value for growing businesses",
        popular: true,
      },
      {
        name: "Lifetime Plan",
        amount: 499,
        duration: "100 years",
        discount: 20,
        features: [
          "Full access to all features",
          "Unlimited clients",
          "24/7 VIP support",
          "Regular updates",
          "Unlimited cloud storage",
          "Custom branding",
          "Advanced analytics",
          "Personal account manager",
          "Early access to new features",
        ],
        description: "Ultimate solution for established enterprises",
      },
    ];

    // Insert plans
    const createdPlans = await SubscriptionPlan.insertMany(plans);
    console.log("✅ Seeded subscription plans:");
    createdPlans.forEach(plan => {
      console.log(`  - ${plan.name}: ₹${plan.amount}/${plan.duration}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding subscription plans:", error.message);
    process.exit(1);
  }
};

// Run the seed script
connectDB().then(seedSubscriptionPlans);