/**
 * API Service for Client Admin Panel
 *
 * CREDENTIAL STORAGE PRIORITY:
 * 1. First checks .env file (VITE_CLIENT_API_KEY, VITE_CLIENT_API_PASSCODE)
 * 2. Falls back to localStorage if not in .env
 *
 * On every app load, credentials are:
 * 1. Retrieved from .env or localStorage
 * 2. Verified with backend server
 * 3. Only if valid, the app continues
 * 4. If invalid or missing, user must re-enter
 *
 * TO SET CREDENTIALS PERMANENTLY:
 * Add to .env or .env.local file:
 *   VITE_CLIENT_API_KEY=your_api_key_here
 *   VITE_CLIENT_API_PASSCODE=your_passcode_here
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Get stored credentials from .env file or localStorage
export const getStoredCredentials = () => {
  // Priority 1: Check environment variables (.env file)
  let apiKey = import.meta.env.VITE_CLIENT_API_KEY;
  let apiPasscode = import.meta.env.VITE_CLIENT_API_PASSCODE;

  if (apiKey && apiPasscode) {
    console.log("✓ API credentials loaded from .env file");
    console.log("  API Key:", apiKey.substring(0, 10) + "...");
    return { apiKey, apiPasscode };
  }

  // Priority 2: Fallback to localStorage
  apiKey = localStorage.getItem("clientApiKey");
  apiPasscode = localStorage.getItem("clientApiPasscode");

  if (apiKey && apiPasscode) {
    console.log("✓ API credentials found in localStorage");
    console.log("  (To make permanent, add to .env file)");
  } else {
    console.log("✗ No API credentials found");
    console.log("  Please enter credentials or add to .env file:");
    console.log("  VITE_CLIENT_API_KEY=your_key");
    console.log("  VITE_CLIENT_API_PASSCODE=your_passcode");
  }

  return { apiKey, apiPasscode };
};

// Save credentials to localStorage (cannot write to .env at runtime)
export const saveCredentials = (apiKey, apiPasscode) => {
  console.log("Saving API credentials to localStorage...");
  console.log("⚠️  Note: To save permanently, add these to your .env file:");
  console.log(`  VITE_CLIENT_API_KEY=${apiKey}`);
  console.log(`  VITE_CLIENT_API_PASSCODE=${apiPasscode}`);
  localStorage.setItem("clientApiKey", apiKey);
  localStorage.setItem("clientApiPasscode", apiPasscode);
  console.log("✓ Credentials saved to localStorage (temporary)");
  console.log("  Restart the app after adding to .env for permanent storage");
};

// Clear credentials
export const clearCredentials = () => {
  localStorage.removeItem("clientApiKey");
  localStorage.removeItem("clientApiPasscode");
  localStorage.removeItem("clientData");
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const { apiKey } = getStoredCredentials();
    console.log("API Key client :", apiKey ? apiKey : "Missing")
    
    // Log the request for debugging
    console.log(`API Call: ${API_BASE_URL}${endpoint}`, options);
    console.log("API Key:", apiKey ? apiKey : "Missing");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "x-api-key": apiKey }),
        ...options.headers,
      },
      ...options,
    });

    // Log the response for debugging
    console.log(`API Response for ${endpoint}:`, response.status, response.statusText);

    const data = await response.json();

    console.log(`API Response Data for ${endpoint}:`, data);

    if (!response.ok) {
      console.log(`API Error for ${endpoint}:`, response.status, data.message);
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Verify client credentials
  verify: async (apiKey, apiPasscode) => {
    return apiCall("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ apiKey, apiPasscode }),
    });
  },

  // Login with email and password
  login: async (email, password, apiKey) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, apiKey }),
    });
  },

  // Get client profile
  getProfile: async () => {
    return apiCall("/auth/profile");
  },
};

// E-Paper API
export const epaperAPI = {
  // Get all epaper data
  getEpaper: async () => {
    return apiCall("/epaper");
  },
  
  // Check if epaper exists for a specific date
  checkEpaperByDate: async (date) => {
    return apiCall(`/epaper/check?date=${date}`);
  },

  // Papers
  createPaper: async (paperData) => {
    try {
      const { apiKey } = getStoredCredentials();

      // Check if we're sending FormData (multipart) or JSON
      const isFormData = paperData instanceof FormData;

      const response = await fetch(`${API_BASE_URL}/epaper/papers`, {
        method: "POST",
        headers: {
          ...(apiKey && { "x-api-key": apiKey }),
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        body: isFormData ? paperData : JSON.stringify(paperData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  updatePaper: async (paperId, paperData) => {
    try {
      const { apiKey } = getStoredCredentials();

      // Check if we're sending FormData (multipart) or JSON
      const isFormData = paperData instanceof FormData;

      const response = await fetch(`${API_BASE_URL}/epaper/papers/${paperId}`, {
        method: "PUT",
        headers: {
          ...(apiKey && { "x-api-key": apiKey }),
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        body: isFormData ? paperData : JSON.stringify(paperData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  deletePaper: async (paperId) => {
    return apiCall(`/epaper/papers/${paperId}`, {
      method: "DELETE",
    });
  },

  // Customization
  updateCustomization: async (customizationData) => {
    return apiCall("/epaper/customization", {
      method: "PUT",
      body: JSON.stringify(customizationData),
    });
  },

  updateCustomizationWithFiles: async (formData) => {
    try {
      const { apiKey } = getStoredCredentials();

      const response = await fetch(
        `${API_BASE_URL}/epaper/customization/files`,
        {
          method: "PUT",
          headers: {
            ...(apiKey && { "x-api-key": apiKey }),
            // Don't set Content-Type header when sending FormData
            // Browser will set it automatically with the correct boundary
          },
          body: formData,
        }
      );

      const textResponse = await response.text();
      
      // Handle empty response
      if (!textResponse) {
        return { success: true, data: null };
      }

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", textResponse);
        throw new Error("Invalid response format from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error in updateCustomizationWithFiles:", error);
      throw error;
    }
  },

  // Ads
  createAd: async (adData) => {
    return apiCall("/epaper/ads", {
      method: "POST",
      body: JSON.stringify(adData),
    });
  },

  updateAd: async (adId, adData) => {
    return apiCall(`/epaper/ads/${adId}`, {
      method: "PUT",
      body: JSON.stringify(adData),
    });
  },

  deleteAd: async (adId) => {
    return apiCall(`/epaper/ads/${adId}`, {
      method: "DELETE",
    });
  },

  // Categories
  createCategory: async (categoryData) => {
    return apiCall("/epaper/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  updateCategory: async (categoryId, categoryData) => {
    return apiCall(`/epaper/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  deleteCategory: async (categoryId) => {
    return apiCall(`/epaper/categories/${categoryId}`, {
      method: "DELETE",
    });
  },

  // SubCategories
  createSubCategory: async (subCategoryData) => {
    return apiCall("/epaper/subcategories", {
      method: "POST",
      body: JSON.stringify(subCategoryData),
    });
  },

  updateSubCategory: async (subCategoryId, subCategoryData) => {
    return apiCall(`/epaper/subcategories/${subCategoryId}`, {
      method: "PUT",
      body: JSON.stringify(subCategoryData),
    });
  },

  deleteSubCategory: async (subCategoryId) => {
    return apiCall(`/epaper/subcategories/${subCategoryId}`, {
      method: "DELETE",
    });
  },

  // Pages
  createPage: async (pageData) => {
    return apiCall("/epaper/pages", {
      method: "POST",
      body: JSON.stringify(pageData),
    });
  },

  updatePage: async (pageId, pageData) => {
    return apiCall(`/epaper/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(pageData),
    });
  },

  deletePage: async (pageId) => {
    return apiCall(`/epaper/pages/${pageId}`, {
      method: "DELETE",
    });
  },

  // Get today's pages for a specific paper
  getTodayPages: async (epaperId) => {
    return apiCall(`/epaper/pages/today?epaperId=${epaperId}`);
  },

  // Replace a single page in a paper
  replacePage: async (paperId, pageNumber, formData) => {
    try {
      const { apiKey } = getStoredCredentials();

      const response = await fetch(
        `${API_BASE_URL}/epaper/papers/${paperId}/pages/${pageNumber}`,
        {
          method: "PUT",
          headers: {
            ...(apiKey && { "x-api-key": apiKey }),
            // Don't set Content-Type for FormData
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to replace page");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

// Subscription Plan API
export const subscriptionPlanAPI = {
  // Get all active subscription plans
  getActive: async () => {
    return apiCall("/subscription-plans/active");
  },
};

// Subscription API
export const subscriptionAPI = {
  // Create a new subscription
  create: async (subscriptionData) => {
    return apiCall("/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  },

  // Get client's active subscription
  getClientSubscription: async (clientId) => {
    return apiCall(`/subscriptions/client/${clientId}`);
  },
};

// Clippings API
export const clippingsAPI = {
  // Create a new clipping
  createClipping: async (clippingData) => {
    try {
      const { apiKey } = getStoredCredentials();

      // Check if we're sending FormData (multipart) or JSON
      const isFormData = clippingData instanceof FormData;

      const response = await fetch(`${API_BASE_URL}/clippings`, {
        method: "POST",
        headers: {
          ...(apiKey && { "x-api-key": apiKey }),
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        body: isFormData ? clippingData : JSON.stringify(clippingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // Get clipping by clipId
  getClipping: async (clipId) => {
    // This endpoint doesn't require authentication
    const response = await fetch(`${API_BASE_URL}/clippings/${clipId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  },
};

// Referral API
export const referralAPI = {
  // Submit a referral
  submitReferral: async (referralData) => {
    console.log("=== REFERRAL API CALL STARTED ===");
    console.log("Submitting referral via API service:", referralData);
    
    // Validate that we have the required data
    if (!referralData.referringClientId || !referralData.referredClientDetails) {
      console.log("Validation failed in API service");
      throw new Error("Referring client ID and referred client details are required");
    }
    
    console.log("Calling apiCall with referral data");
    const response = await apiCall("/referrals", {
      method: "POST",
      body: JSON.stringify(referralData),
    });
    
    console.log("Referral API response:", response);
    console.log("=== REFERRAL API CALL COMPLETED ===");
    return response;
  },

  // Get referrals by client ID
  getReferralsByClientId: async (clientId) => {
    return apiCall(`/referrals/client/${clientId}`);
  },

  // Get referral earnings for a client
  getReferralEarnings: async (clientId) => {
    return apiCall(`/referrals/earnings/${clientId}`);
  },
};
