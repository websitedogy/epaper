import Renewal from "../models/Renewal.js";
import Client from "../models/Client.js";

// @desc    Create a new renewal
// @route   POST /api/renewals
// @access  Public
export const createRenewal = async (req, res) => {
  try {
    const { clientId, extensionDays, renewalAmount, paymentStatus, notes } =
      req.body;

    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const previousExpiryDate = new Date(client.expiryDate);
    const newExpiryDate = new Date(previousExpiryDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + extensionDays);

    // Create renewal record
    const renewal = new Renewal({
      clientId: client._id,
      clientName: client.clientName,
      epaperName: client.epaperName,
      previousExpiryDate,
      newExpiryDate,
      extensionDays,
      renewalAmount: renewalAmount || 0,
      paymentStatus: paymentStatus || "pending",
      notes: notes || "",
    });

    await renewal.save();

    // Update client's expiry date
    client.expiryDate = newExpiryDate;
    await client.save();

    res.status(201).json({
      success: true,
      message: "Renewal created successfully",
      data: {
        renewal,
        updatedClient: client,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating renewal",
      error: error.message,
    });
  }
};

// @desc    Get all renewals
// @route   GET /api/renewals
// @access  Public
export const getAllRenewals = async (req, res) => {
  try {
    const renewals = await Renewal.find()
      .populate("clientId", "clientName epaperName email clientPhone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching renewals",
      error: error.message,
    });
  }
};

// @desc    Get renewals by client ID
// @route   GET /api/renewals/client/:clientId
// @access  Public
export const getRenewalsByClient = async (req, res) => {
  try {
    const renewals = await Renewal.find({ clientId: req.params.clientId }).sort(
      { createdAt: -1 }
    );

    res.status(200).json({
      success: true,
      count: renewals.length,
      data: renewals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching client renewals",
      error: error.message,
    });
  }
};

// @desc    Get renewal by ID
// @route   GET /api/renewals/:id
// @access  Public
export const getRenewalById = async (req, res) => {
  try {
    const renewal = await Renewal.findById(req.params.id).populate(
      "clientId",
      "clientName epaperName email clientPhone"
    );

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found",
      });
    }

    res.status(200).json({
      success: true,
      data: renewal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching renewal",
      error: error.message,
    });
  }
};

// @desc    Update renewal
// @route   PUT /api/renewals/:id
// @access  Public
export const updateRenewal = async (req, res) => {
  try {
    const { renewalAmount, paymentStatus, notes } = req.body;

    const renewal = await Renewal.findByIdAndUpdate(
      req.params.id,
      { renewalAmount, paymentStatus, notes },
      { new: true, runValidators: true }
    );

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Renewal updated successfully",
      data: renewal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating renewal",
      error: error.message,
    });
  }
};

// @desc    Delete renewal
// @route   DELETE /api/renewals/:id
// @access  Public
export const deleteRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findByIdAndDelete(req.params.id);

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Renewal deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting renewal",
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/renewals/stats/dashboard
// @access  Public
export const getDashboardStats = async (req, res) => {
  try {
    const clients = await Client.find();
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const totalClients = clients.length;
    const expiredClients = clients.filter(
      (c) => new Date(c.expiryDate) < now
    ).length;
    const expiringIn30Days = clients.filter((c) => {
      const expiryDate = new Date(c.expiryDate);
      return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
    }).length;
    const activeClients = clients.filter(
      (c) => new Date(c.expiryDate) >= now
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalClients,
        activeClients,
        expiredClients,
        expiringIn30Days,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};
