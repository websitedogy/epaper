import SubscriptionPlan from "../models/SubscriptionPlan.js";

// @desc    Create new subscription plan
// @route   POST /api/subscription-plans
// @access  Private/Admin
export const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, amount, duration, discount, features, description, paymentLink, bankDetails } = req.body;

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan with this name already exists",
      });
    }

    // Create subscription plan
    const subscriptionPlan = await SubscriptionPlan.create({
      name,
      amount,
      duration,
      discount: discount || 0,
      features: features || [],
      description,
      paymentLink,
      bankDetails,
    });

    res.status(201).json({
      success: true,
      data: subscriptionPlan,
      message: "Subscription plan created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all subscription plans
// @route   GET /api/subscription-plans
// @access  Private/Admin
export const getSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscriptionPlans,
      count: subscriptionPlans.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get active subscription plans
// @route   GET /api/subscription-plans/active
// @access  Public
export const getActiveSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subscriptionPlans,
      count: subscriptionPlans.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single subscription plan by ID
// @route   GET /api/subscription-plans/:id
// @access  Private/Admin
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscriptionPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update subscription plan
// @route   PUT /api/subscription-plans/:id
// @access  Private/Admin
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { name, amount, duration, discount, features, description, paymentLink, bankDetails, isActive } = req.body;

    // Check if another plan with same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name, _id: { $ne: req.params.id } });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Subscription plan with this name already exists",
      });
    }

    const subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        amount,
        duration,
        discount,
        features,
        description,
        paymentLink,
        bankDetails,
        isActive,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscriptionPlan,
      message: "Subscription plan updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete subscription plan
// @route   DELETE /api/subscription-plans/:id
// @access  Private/Admin
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};