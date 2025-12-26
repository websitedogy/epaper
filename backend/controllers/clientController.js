import Client from "../models/Client.js";
import crypto from "crypto";

// Generate random API Key
const generateApiKey = () => {
  return "ak_" + crypto.randomBytes(24).toString("hex");
};

// Generate random API Passcode
const generateApiPasscode = () => {
  return "pc_" + crypto.randomBytes(16).toString("hex");
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Public
export const createClient = async (req, res) => {
  try {
    // Check if client with same email or phone already exists
    const existingClient = await Client.findOne({
      $or: [
        { clientPhone: req.body.clientPhone },
        { email: req.body.email }
      ]
    });
    
    if (existingClient) {
      let message = "Client with this ";
      if (existingClient.email === req.body.email) {
        message += "email already exists";
      } else if (existingClient.clientPhone === req.body.clientPhone) {
        message += "phone number already exists";
      } else {
        message += "email or phone number already exists";
      }
      
      return res.status(400).json({
        success: false,
        message,
      });
    }

    const clientData = {
      epaperName: req.body.epaperName.trim(),
      clientName: req.body.clientName.trim(),
      clientPhone: req.body.clientPhone.trim(),
      email: req.body.email.trim().toLowerCase(),
      address: {
        street: req.body.street.trim(),
        pincode: req.body.pincode.trim(),
        village: req.body.village.trim(),
        district: req.body.district.trim(),
        state: req.body.state.trim(),
      },
      alternativeNumber: req.body.alternativeNumber ? req.body.alternativeNumber.trim() : "",
      startDate: req.body.startDate,
      expiryDate: req.body.expiryDate,
      password: req.body.password,
      apiKey: generateApiKey(),
      apiPasscode: generateApiPasscode(),
    };

    const client = new Client(clientData);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      data: client,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (error.code === 11000) {
      // Get the duplicate key field name
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = "Client with this ";
      
      // More descriptive error messages
      switch (duplicateField) {
        case "email":
          message += "email already exists";
          break;
        case "clientPhone":
          message += "phone number already exists";
          break;
        default:
          message += "email or phone number already exists";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error.message,
    });
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Public
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error.message,
    });
  }
};

// @desc    Get a single client by ID
// @route   GET /api/clients/:id
// @access  Public
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error.message,
    });
  }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Public
export const updateClient = async (req, res) => {
  try {
    const updateData = {
      epaperName: req.body.epaperName.trim(),
      clientName: req.body.clientName.trim(),
      clientPhone: req.body.clientPhone.trim(),
      email: req.body.email.trim().toLowerCase(),
      address: {
        street: req.body.street.trim(),
        pincode: req.body.pincode.trim(),
        village: req.body.village.trim(),
        district: req.body.district.trim(),
        state: req.body.state.trim(),
      },
      alternativeNumber: req.body.alternativeNumber ? req.body.alternativeNumber.trim() : "",
      startDate: req.body.startDate,
      expiryDate: req.body.expiryDate,
      password: req.body.password,
    };

    const client = await Client.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (error.code === 11000) {
      // Get the duplicate key field name
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = "Client with this ";
      
      // More descriptive error messages
      switch (duplicateField) {
        case "email":
          message += "email already exists";
          break;
        case "clientPhone":
          message += "phone number already exists";
          break;
        default:
          message += "email or phone number already exists";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
};

// @desc    Delete a client
// @route   DELETE /api/clients/:id
// @access  Public
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    });
  }
};