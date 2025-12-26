import Clipping from "../models/Clipping.js";
import ClipCounter from "../models/ClipCounter.js";
import Client from "../models/Client.js";
import Epaper from "../models/Epaper.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Create new clipping with sequential numeric ID
// @route   POST /api/clippings
// @access  Private
export const createClipping = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    let client = await Client.findOne({ apiKey });

    // Parse coordinates
    let x = parseFloat(req.body['coordinates[x]']) || parseFloat(req.body.coordinates?.x);
    let y = parseFloat(req.body['coordinates[y]']) || parseFloat(req.body.coordinates?.y);
    let width = parseFloat(req.body['coordinates[width]']) || parseFloat(req.body.coordinates?.width);
    let height = parseFloat(req.body['coordinates[height]']) || parseFloat(req.body.coordinates?.height);
    
    // Validate coordinates
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates: x, y, width, and height must be valid numbers' 
      });
    }
    
    // Prepare clipping data
    const clippingData = {
      paperId: req.body.paperId,
      page: req.body.page,
      coordinates: { x, y, width, height }
    };

    // Add clientId only if a real client was found
    if (client) {
      clippingData.clientId = client._id;
    }

    // If we have an uploaded file, save its URL
    if (req.file) {
      clippingData.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    } 
    // If we have an imageUrl in the body, use it directly
    else if (req.body.imageUrl) {
      clippingData.imageUrl = req.body.imageUrl;
    }

    // Perform atomic counter update
    const counter = await ClipCounter.findOneAndUpdate(
      { _id: "clipCounter" },
      { $inc: { lastClipId: 1 } },
      { new: true, upsert: true }
    );

    // Assign this to clipping
    const newClipId = counter.lastClipId;
    clippingData.clipId = newClipId;

    const clipping = await Clipping.create(clippingData);

    // Return response with the correct format
    res.status(201).json({
      success: true,
      clipId: newClipId,
      imageUrl: clippingData.imageUrl,
      data: clipping
    });
  } catch (error) {
    console.error("Error in createClipping:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get clipping by numeric clipId
// @route   GET /api/clippings/:clipId
// @access  Public
export const getClippingByClipId = async (req, res) => {
  try {
    const { clipId } = req.params;
    
    // Find clipping by numeric clipId
    const clipping = await Clipping.findOne({ clipId: parseInt(clipId) })
      .populate('clientId', 'name')
      .populate('paperId');

    if (!clipping) {
      return res
        .status(404)
        .json({ success: false, message: "Clipping not found" });
    }

    res.status(200).json({
      success: true,
      data: clipping,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all clippings for a client
// @route   GET /api/clippings
// @access  Private
export const getClientClippings = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Find all clippings for this client
    const clippings = await Clipping.find({ clientId: client._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clippings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete clipping by numeric clipId
// @route   DELETE /api/clippings/:clipId
// @access  Private
export const deleteClipping = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const { clipId } = req.params;
    
    // Find and delete clipping by numeric clipId
    const clipping = await Clipping.findOneAndDelete({ 
      clipId: parseInt(clipId),
      clientId: client._id
    });

    if (!clipping) {
      return res
        .status(404)
        .json({ success: false, message: "Clipping not found" });
    }

    res.status(200).json({
      success: true,
      message: "Clipping deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};