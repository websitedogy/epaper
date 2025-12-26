import Client from "../models/Client.js";

// @desc    Verify client credentials (API Key + Passcode)
// @route   POST /api/auth/verify
// @access  Public
export const verifyClient = async (req, res) => {
  try {
    const { apiKey, apiPasscode } = req.body;

    if (!apiKey || !apiPasscode) {
      return res.status(400).json({
        success: false,
        message: "API Key and Passcode are required",
      });
    }

    // Find client by API key and passcode
    const client = await Client.findOne({ apiKey, apiPasscode });

    if (!client) {
      return res.status(401).json({
        success: false,
        message: "Invalid API Key or Passcode",
      });
    }

    // Check if client subscription is active
    const now = new Date();
    const expiryDate = new Date(client.expiryDate);

    if (expiryDate < now) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please contact administrator.",
        expired: true,
      });
    }

    // Return client data (excluding password)
    const clientData = {
      id: client._id,
      epaperName: client.epaperName,
      clientName: client.clientName,
      email: client.email,
      clientPhone: client.clientPhone,
      startDate: client.startDate,
      expiryDate: client.expiryDate,
      apiKey: client.apiKey,
      referralEarnings: client.referralEarnings || 0,
    };

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: clientData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

// @desc    Get client profile
// @route   GET /api/auth/profile
// @access  Private (requires API key in header)
export const getClientProfile = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API Key is required",
      });
    }

    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const clientData = {
      id: client._id,
      epaperName: client.epaperName,
      clientName: client.clientName,
      email: client.email,
      clientPhone: client.clientPhone,
      alternativeNumber: client.alternativeNumber,
      address: client.address,
      startDate: client.startDate,
      expiryDate: client.expiryDate,
      apiKey: client.apiKey,
      referralEarnings: client.referralEarnings || 0,
    };

    res.status(200).json({
      success: true,
      data: clientData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// @desc    Login client with email and password
// @route   POST /api/auth/login
// @access  Public
export const loginClient = async (req, res) => {
  try {
    const { email, password, apiKey } = req.body;

    if (!email || !password || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and API Key are required",
      });
    }

    // Find client by email and API key
    const client = await Client.findOne({ email: email.toLowerCase(), apiKey });

    if (!client) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password (plain text comparison as stored)
    if (client.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if client subscription is active
    const now = new Date();
    const expiryDate = new Date(client.expiryDate);

    if (expiryDate < now) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please contact administrator.",
        expired: true,
      });
    }

    // Return client data
    const clientData = {
      id: client._id,
      epaperName: client.epaperName,
      clientName: client.clientName,
      email: client.email,
      clientPhone: client.clientPhone,
      startDate: client.startDate,
      expiryDate: client.expiryDate,
      apiKey: client.apiKey,
      referralEarnings: client.referralEarnings || 0,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: clientData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
};
