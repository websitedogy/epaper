import Subscription from "../models/Subscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Client from "../models/Client.js";

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res) => {
  try {
    // For now, we'll allow access without authentication
    // In a production environment, you would add admin authentication here

    const { client, plan, price } = req.body;

    // Validate client exists
    let clientExists;
    try {
      clientExists = await Client.findById(client);
    } catch (dbError) {
      console.error("Database connection error in findById:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get plan details from SubscriptionPlan
    let planDetails;
    try {
      planDetails = await SubscriptionPlan.findOne({ name: plan, isActive: true });
    } catch (dbError) {
      console.error("Database connection error in finding plan:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    if (!planDetails) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Calculate end date based on plan duration
    const start_at = new Date();
    let end_at = new Date(start_at);

    // Parse duration (e.g., "1 year", "4 years", "100 years")
    const durationParts = planDetails.duration.split(' ');
    const durationValue = parseInt(durationParts[0]);
    const durationUnit = durationParts[1]?.toLowerCase();

    if (durationUnit === 'year' || durationUnit === 'years') {
      end_at.setFullYear(end_at.getFullYear() + durationValue);
    } else if (durationUnit === 'month' || durationUnit === 'months') {
      end_at.setMonth(end_at.getMonth() + durationValue);
    } else if (durationUnit === 'day' || durationUnit === 'days') {
      end_at.setDate(end_at.getDate() + durationValue);
    } else {
      // Default to adding years if unit is not recognized
      end_at.setFullYear(end_at.getFullYear() + durationValue);
    }

    // Create subscription
    let subscription;
    try {
      subscription = await Subscription.create({
        client,
        plan,
        price: planDetails.amount, // Use amount from plan
        start_at,
        end_at,
        status: "active",
      });
    } catch (dbError) {
      console.error("Database connection error in create:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    // Populate client details
    try {
      await subscription.populate("client", "clientName email");
    } catch (dbError) {
      console.error("Database connection error in populate:", dbError.message);
      // Continue even if populate fails
    }

    res.status(201).json({
      success: true,
      data: subscription,
      message: "Subscription created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private
export const getSubscriptions = async (req, res) => {
  try {
    // For now, we'll allow access without authentication
    // In a production environment, you would add admin authentication here

    // Update expired subscriptions
    try {
      await Subscription.updateMany(
        {
          end_at: { $lt: new Date() },
          status: "active",
        },
        {
          status: "expired",
          updatedAt: new Date(),
        }
      );
    } catch (dbError) {
      console.error(
        "Database connection error in updateMany:",
        dbError.message
      );
      // Continue even if database operation fails
    }

    // Get all subscriptions with populated client details
    let subscriptions = [];
    try {
      subscriptions = await Subscription.find()
        .populate("client", "clientName email")
        .sort({ createdAt: -1 });
    } catch (dbError) {
      console.error("Database connection error in find:", dbError.message);
      // Return empty array if database operation fails
    }

    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
export const updateSubscription = async (req, res) => {
  try {
    // For now, we'll allow access without authentication
    // In a production environment, you would add admin authentication here

    const { status, end_at } = req.body;
    const subscriptionId = req.params.id;

    // Find subscription
    let subscription;
    try {
      subscription = await Subscription.findById(subscriptionId);
    } catch (dbError) {
      console.error("Database connection error in findById:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Update fields
    if (status) subscription.status = status;
    if (end_at) subscription.end_at = new Date(end_at);

    subscription.updatedAt = new Date();

    try {
      await subscription.save();
    } catch (dbError) {
      console.error("Database connection error in save:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    // Populate client details
    try {
      await subscription.populate("client", "clientName email");
    } catch (dbError) {
      console.error("Database connection error in populate:", dbError.message);
      // Continue even if populate fails
    }

    res.status(200).json({
      success: true,
      data: subscription,
      message: "Subscription updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
export const deleteSubscription = async (req, res) => {
  try {
    // For now, we'll allow access without authentication
    // In a production environment, you would add admin authentication here

    const subscriptionId = req.params.id;

    // Find and delete subscription
    let subscription;
    try {
      subscription = await Subscription.findByIdAndDelete(subscriptionId);
    } catch (dbError) {
      console.error(
        "Database connection error in findByIdAndDelete:",
        dbError.message
      );
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get active subscription for a client
// @route   GET /api/subscriptions/client/:clientId
// @access  Private
export const getClientSubscription = async (req, res) => {
  try {
    // For now, we'll allow access without authentication
    // In a production environment, you would add admin authentication here

    const clientId = req.params.clientId;

    // Update expired subscriptions for this client
    try {
      await Subscription.updateMany(
        {
          client: clientId,
          end_at: { $lt: new Date() },
          status: "active",
        },
        {
          status: "expired",
          updatedAt: new Date(),
        }
      );
    } catch (dbError) {
      console.error(
        "Database connection error in updateMany:",
        dbError.message
      );
      // Continue even if database operation fails
    }

    // Get active subscription for client
    let subscription;
    try {
      subscription = await Subscription.findOne({
        client: clientId,
        status: "active",
      }).populate("client", "clientName email");
    } catch (dbError) {
      console.error("Database connection error in findOne:", dbError.message);
      return res.status(500).json({
        success: false,
        message: "Database connection error",
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found for this client",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
