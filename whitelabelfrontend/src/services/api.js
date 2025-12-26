const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making API call to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer dummy-token-for-development",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    // Provide more specific error information
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please make sure the backend is running on ' + API_BASE_URL);
    }
    throw error;
  }
};

// Client API functions
export const clientAPI = {
  // Create a new client
  create: async (clientData) => {
    return apiCall("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    });
  },

  // Get all clients
  getAll: async () => {
    return apiCall("/clients");
  },

  // Get a single client by ID
  getById: async (id) => {
    return apiCall(`/clients/${id}`);
  },

  // Update a client
  update: async (id, clientData) => {
    return apiCall(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    });
  },

  // Delete a client
  delete: async (id) => {
    return apiCall(`/clients/${id}`, {
      method: "DELETE",
    });
  },
};

// Renewal API functions
export const renewalAPI = {
  // Create a new renewal
  create: async (renewalData) => {
    return apiCall("/renewals", {
      method: "POST",
      body: JSON.stringify(renewalData),
    });
  },

  // Get all renewals
  getAll: async () => {
    return apiCall("/renewals");
  },

  // Get renewals by client ID
  getByClient: async (clientId) => {
    return apiCall(`/renewals/client/${clientId}`);
  },

  // Get a single renewal by ID
  getById: async (id) => {
    return apiCall(`/renewals/${id}`);
  },

  // Update a renewal
  update: async (id, renewalData) => {
    return apiCall(`/renewals/${id}`, {
      method: "PUT",
      body: JSON.stringify(renewalData),
    });
  },

  // Delete a renewal
  delete: async (id) => {
    return apiCall(`/renewals/${id}`, {
      method: "DELETE",
    });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiCall("/renewals/stats/dashboard");
  },
};

// Subscription API functions
export const subscriptionAPI = {
  // Get all subscriptions
  getAll: async () => {
    return apiCall("/subscriptions");
  },

  // Create a new subscription
  create: async (subscriptionData) => {
    return apiCall("/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  },

  // Update a subscription
  update: async (id, subscriptionData) => {
    return apiCall(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(subscriptionData),
    });
  },

  // Delete a subscription
  delete: async (id) => {
    return apiCall(`/subscriptions/${id}`, {
      method: "DELETE",
    });
  },

  // Get client subscription
  getClientSubscription: async (clientId) => {
    return apiCall(`/subscriptions/client/${clientId}`);
  },
};

// Subscription Plan API functions
export const subscriptionPlanAPI = {
  // Get all subscription plans
  getAll: async () => {
    return apiCall("/subscription-plans");
  },

  // Get active subscription plans
  getActive: async () => {
    return apiCall("/subscription-plans/active");
  },

  // Create a new subscription plan
  create: async (planData) => {
    return apiCall("/subscription-plans", {
      method: "POST",
      body: JSON.stringify(planData),
    });
  },

  // Update a subscription plan
  update: async (id, planData) => {
    return apiCall(`/subscription-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    });
  },

  // Delete a subscription plan
  delete: async (id) => {
    return apiCall(`/subscription-plans/${id}`, {
      method: "DELETE",
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiCall("/health");
};

// Referral API functions
export const referralAPI = {
  // Get all referrals with optional status filter
  getAll: async (status = null) => {
    const endpoint = status ? `/referrals?status=${status}` : '/referrals';
    return apiCall(endpoint, { method: 'GET' });
  },

  // Update referral status (approve/reject)
  updateStatus: async (id, status, referralAmount = 0, reviewNotes = "") => {
    return apiCall(`/referrals/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
        referralAmount,
        reviewNotes,
        reviewedBy: "superadmin"
      }),
    });
  },
};

// Clippings API functions
export const clippingsAPI = {
  // Get clipping by clipId
  getById: async (clipId) => {
    // This endpoint doesn't require authentication
    const response = await fetch(`${API_BASE_URL}/clippings/${clipId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  },
};