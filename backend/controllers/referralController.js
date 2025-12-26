import Referral from "../models/Referral.js";
import Client from "../models/Client.js";
import mongoose from "mongoose";

console.log("Referral controller loaded");

// @desc    Submit a referral
// @route   POST /api/referrals
// @access  Client
export const submitReferral = async (req, res) => {
  console.log("=== REFERRAL SUBMISSION STARTED ===");
  console.log("submitReferral called with body:", req.body);
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", req.headers);
  
  try {
    const { referringClientId, referredClientDetails } = req.body;
    
    // Log the extracted data
    console.log("Extracted referringClientId:", referringClientId);
    console.log("Extracted referredClientDetails:", referredClientDetails);
    console.log("Type of referringClientId:", typeof referringClientId);

    // Validate required fields
    if (!referringClientId || !referredClientDetails) {
      console.log("Validation failed: missing required fields");
      return res.status(400).json({
        success: false,
        message: "Referring client ID and referred client details are required",
      });
    }

    // Validate referred client details
    const requiredFields = ["name", "phone", "email"];
    for (const field of requiredFields) {
      if (!referredClientDetails[field] || referredClientDetails[field].trim() === "") {
        console.log(`Validation failed: missing ${field}`);
        return res.status(400).json({
          success: false,
          message: `Referred client ${field} is required`,
        });
      }
    }

    // Validate address fields
    if (!referredClientDetails.address) {
      console.log("Validation failed: missing address");
      return res.status(400).json({
        success: false,
        message: "Referred client address details are required",
      });
    }

    const requiredAddressFields = ["street", "pincode", "village", "district", "state"];
    for (const field of requiredAddressFields) {
      if (!referredClientDetails.address[field] || referredClientDetails.address[field].trim() === "") {
        console.log(`Validation failed: missing address.${field}`);
        return res.status(400).json({
          success: false,
          message: `Referred client address ${field} is required`,
        });
      }
    }

    // Check if referring client exists
    console.log("Checking if referring client exists with ID:", referringClientId);
    const referringClient = await Client.findById(referringClientId);
    console.log("Found referring client:", referringClient);
    
    if (!referringClient) {
      console.log("Referring client not found");
      return res.status(404).json({
        success: false,
        message: "Referring client not found",
      });
    }

    // Create referral record
    const referral = new Referral({
      referringClientId,
      referredClientDetails,
      // Default amount, can be updated by superadmin during approval
      referralAmount: 0,
      status: "pending",
    });

    console.log("Creating referral object:", referral);

    await referral.save();

    console.log("Referral saved successfully:", referral);

    res.status(201).json({
      success: true,
      message: "Referral submitted successfully",
      data: referral,
    });
    
    console.log("=== REFERRAL SUBMISSION COMPLETED ===");
  } catch (error) {
    console.error("Error submitting referral:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting referral",
      error: error.message,
    });
  }
};

// @desc    Get referrals submitted by a specific client
// @route   GET /api/referrals/client/:clientId
// @access  Client/Superadmin
export const getReferralsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;

    const referrals = await Referral.find({ referringClientId: clientId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      data: referrals,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referrals",
      error: error.message,
    });
  }
};

// @desc    Get all referrals (for superadmin)
// @route   GET /api/referrals
// @access  Superadmin
export const getAllReferrals = async (req, res) => {
  console.log('getAllReferrals called with query:', req.query);
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const referrals = await Referral.find(filter)
      .populate("referringClientId", "clientName email clientPhone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Referral.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: referrals.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: referrals,
    });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referrals",
      error: error.message,
    });
  }
};

// @desc    Update referral status (approve/reject)
// @route   PUT /api/referrals/:id/status
// @access  Superadmin
export const updateReferralStatus = async (req, res) => {
  try {
    console.log("=== UPDATE REFERRAL STATUS STARTED ===");
    console.log("Full request object:", {
      params: req.params,
      body: req.body,
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl
    });
    
    const { id } = req.params;
    const { status, referralAmount, reviewNotes, reviewedBy } = req.body;

    console.log("Request params:", { id });
    console.log("Request body:", { status, referralAmount, reviewNotes, reviewedBy });

    // Validate required parameters
    if (!id) {
      console.log("Validation failed: Missing referral ID");
      return res.status(400).json({
        success: false,
        message: "Referral ID is required",
      });
    }

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      console.log("Validation failed: Invalid status", status);
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    // Validate referralAmount if provided
    if (status === "approved" && referralAmount !== undefined) {
      const amount = parseFloat(referralAmount);
      if (isNaN(amount) || amount < 0) {
        console.log("Validation failed: Invalid referralAmount", referralAmount);
        return res.status(400).json({
          success: false,
          message: "Referral amount must be a valid positive number",
        });
      }
    }

    // Find the referral
    console.log("Finding referral with ID:", id);
    const referral = await Referral.findById(id);
    if (!referral) {
      console.log("Referral not found with ID:", id);
      return res.status(404).json({
        success: false,
        message: "Referral not found",
      });
    }

    console.log("Found referral:", referral);

    // Update referral
    referral.status = status;
    // Only set reviewedBy if it's a valid ObjectId, otherwise set to null
    if (reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)) {
      referral.reviewedBy = reviewedBy;
    } else {
      referral.reviewedBy = null;
    }
    referral.reviewedAt = new Date();
    referral.reviewNotes = reviewNotes || "";

    // If approved, set the referral amount
    if (status === "approved") {
      const amount = parseFloat(referralAmount) || 0;
      referral.referralAmount = amount;
      
      console.log("Approving referral with amount:", amount);
      
      // Update client's referral earnings
      console.log("Finding referring client with ID:", referral.referringClientId);
      const referringClient = await Client.findById(referral.referringClientId);
      if (referringClient) {
        console.log("Found referring client:", referringClient.clientName);
        const earningsToAdd = amount;
        referringClient.referralEarnings = (referringClient.referralEarnings || 0) + earningsToAdd;
        console.log("Updating client earnings. Old:", referringClient.referralEarnings - earningsToAdd, "Added:", earningsToAdd, "New:", referringClient.referralEarnings);
        await referringClient.save();
        console.log("Client earnings updated successfully");
      } else {
        console.log("Warning: Referring client not found with ID:", referral.referringClientId);
      }
    }

    console.log("Saving referral updates");
    await referral.save();
    console.log("Referral saved successfully:", referral._id);

    res.status(200).json({
      success: true,
      message: `Referral ${status} successfully`,
      data: referral,
    });
    
    console.log("=== UPDATE REFERRAL STATUS COMPLETED ===");
  } catch (error) {
    console.error("Error updating referral status:", error);
    // Log the full error stack trace
    console.error("Full error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating referral status",
      error: error.message,
    });
  }
};

// @desc    Get total referral earnings for a client
// @route   GET /api/referrals/earnings/:clientId
// @access  Client/Superadmin
export const getReferralEarnings = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Method 1: Calculate from client document
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Method 2: Calculate from approved referrals (alternative approach)
    const approvedReferrals = await Referral.find({
      referringClientId: clientId,
      status: "approved"
    });

    const totalEarnings = approvedReferrals.reduce((sum, referral) => sum + (referral.referralAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        earnings: client.referralEarnings || 0,
        calculatedEarnings: totalEarnings
      }
    });
  } catch (error) {
    console.error("Error fetching referral earnings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral earnings",
      error: error.message,
    });
  }
};