import Client from "../models/Client.js";

// Simple admin authentication middleware
// In a production environment, you would use a more robust authentication system
// with JWT tokens, sessions, or other secure methods
const adminAuth = async (req, res, next) => {
  try {
    // For development, we'll allow access without strict authentication
    // In production, you would implement proper JWT or session-based authentication
    const authHeader = req.headers.authorization;

    // Allow access even without authorization header for development
    // In production, uncomment the following lines:
    
    // if (!authHeader) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Authorization header is required",
    //   });
    // }
    
    // Check if it's a Bearer token
    // if (!authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid authorization format. Use Bearer token.",
    //   });
    // }
    

    // If we reach here, authentication is successful (permissive for development)
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

export default adminAuth;
