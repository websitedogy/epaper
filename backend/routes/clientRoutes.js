import express from "express";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

const router = express.Router();

// Create a new client
router.post("/", createClient);

// Get all clients
router.get("/", getAllClients);

// Get a single client by ID
router.get("/:id", getClientById);

// Update a client
router.put("/:id", updateClient);

// Delete a client
router.delete("/:id", deleteClient);

export default router;
