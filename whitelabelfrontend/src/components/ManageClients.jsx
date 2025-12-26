import { useState, useEffect } from "react";
import { clientAPI, healthCheck } from "../services/api";

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, expired
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewClient, setViewClient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // State for the add client popup
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [formData, setFormData] = useState({
    epaperName: "",
    clientName: "",
    clientPhone: "",
    email: "",
    street: "",
    pincode: "",
    village: "",
    district: "",
    state: "",
    alternativeNumber: "",
    startDate: "",
    expiryDate: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [backendHealthy, setBackendHealthy] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      // Check backend health first
      try {
        await healthCheck();
        setBackendHealthy(true);
        await fetchClients();
      } catch (err) {
        setBackendHealthy(false);
        setError("Unable to connect to the backend server. Please make sure the server is running.");
        setLoading(false);
      }
    };
    
    initialize();
  }, []);

  const fetchClients = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await clientAPI.getAll();
      setClients(res.data || []);
    } catch (err) {
      // Handle network errors specifically
      if (err.message && err.message.includes('Unable to connect to the server')) {
        setBackendHealthy(false);
        setError("Unable to connect to the backend server. Please make sure the server is running.");
      } else {
        setError(err.message || "Failed to load clients");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await clientAPI.delete(id);
      setClients(clients.filter((c) => c._id !== id));
      alert("Client deleted successfully");
    } catch (err) {
      alert("Failed to delete client: " + (err.message || "Unknown error"));
    }
  };

  // Filter clients based on search query and status
  const getFilteredClients = () => {
    let filtered = clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (c.epaperName && c.epaperName.toLowerCase().includes(q)) ||
        (c.clientName && c.clientName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.clientPhone && c.clientPhone.toLowerCase().includes(q)) ||
        (c.apiKey && c.apiKey.toLowerCase().includes(q));

      const now = new Date();
      const expiryDate = c.expiryDate ? new Date(c.expiryDate) : null;
      const isExpired = expiryDate && expiryDate < now;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !isExpired) ||
        (filterStatus === "expired" && isExpired);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (
        sortField === "createdAt" ||
        sortField === "startDate" ||
        sortField === "expiryDate"
      ) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredClients = getFilteredClients();

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const openViewModal = (client) => {
    setViewClient(client);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setViewClient(null);
    setShowViewModal(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Trim whitespace for email and phone fields to prevent issues
    const trimmedValue = (name === 'email' || name === 'clientPhone') ? value.trim() : value;
    setFormData((prev) => ({
      ...prev,
      [name]: trimmedValue,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.epaperName.trim())
      newErrors.epaperName = "Epaper Name is required";
    if (!formData.clientName.trim())
      newErrors.clientName = "Client Name is required";
    if (!formData.clientPhone.trim())
      newErrors.clientPhone = "Client Phone Number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.street.trim()) newErrors.street = "Street is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!formData.village.trim()) newErrors.village = "Village is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry Date is required";
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);

    try {
      // Ensure we're sending trimmed data
      const clientData = {
        epaperName: formData.epaperName.trim(),
        clientName: formData.clientName.trim(),
        clientPhone: formData.clientPhone.trim(),
        email: formData.email.trim(),
        street: formData.street.trim(),
        pincode: formData.pincode.trim(),
        village: formData.village.trim(),
        district: formData.district.trim(),
        state: formData.state.trim(),
        alternativeNumber: formData.alternativeNumber.trim(),
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        password: formData.password,
      };

      const response = await clientAPI.create(clientData);
      
      setSubmitMessage({
        type: "success",
        text: "Client added successfully!",
      });

      // Add the new client to the list
      setClients([response.data, ...clients]);
      
      // Reset form
      setFormData({
        epaperName: "",
        clientName: "",
        clientPhone: "",
        email: "",
        street: "",
        pincode: "",
        village: "",
        district: "",
        state: "",
        alternativeNumber: "",
        startDate: "",
        expiryDate: "",
        password: "",
      });
      setErrors({});
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAddClientModal(false);
        setSubmitMessage({ type: "", text: "" });
      }, 2000);
    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = "Failed to add client. Please try again.";
      
      // Handle network errors specifically
      if (error.message && error.message.includes('Unable to connect to the server')) {
        errorMessage = error.message;
      }
      // Handle specific duplicate error cases
      else if (error.message && error.message.includes("already exists")) {
        errorMessage = error.message;
        // Try to extract which field is duplicated
        if (error.message.includes("email")) {
          setErrors(prev => ({ ...prev, email: "A client with this email already exists" }));
        }
        if (error.message.includes("phone")) {
          setErrors(prev => ({ ...prev, clientPhone: "A client with this phone number already exists" }));
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitMessage({
        type: "error",
        text: errorMessage,
      });

      // If there are validation errors from the server
      if (error.errors) {
        const serverErrors = {};
        error.errors.forEach((err) => {
          // Map server errors to form fields if possible
          if (err.includes("Epaper Name")) serverErrors.epaperName = err;
          else if (err.includes("Client Name")) serverErrors.clientName = err;
          else if (err.includes("Phone")) serverErrors.clientPhone = err;
          else if (err.includes("Email")) serverErrors.email = err;
          else if (err.includes("Street")) serverErrors.street = err;
          else if (err.includes("Pincode")) serverErrors.pincode = err;
          else if (err.includes("Village")) serverErrors.village = err;
          else if (err.includes("District")) serverErrors.district = err;
          else if (err.includes("State")) serverErrors.state = err;
          else if (err.includes("Start Date")) serverErrors.startDate = err;
          else if (err.includes("Expiry Date")) serverErrors.expiryDate = err;
          else if (err.includes("Password")) serverErrors.password = err;
        });
        setErrors(serverErrors);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading clients...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show backend connection error
  if (!backendHealthy) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Backend Connection Error:</strong> Unable to connect to the backend server. 
                  Please make sure the backend server is running on <code className="bg-red-100 px-1 rounded">http://localhost:5001</code>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Troubleshooting Tips:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Make sure you've started the backend server with <code className="bg-blue-100 px-1 rounded">npm start</code> in the backend directory</li>
                    <li>Check that the backend is running on port 5001</li>
                    <li>Verify your internet connection</li>
                    <li>Refresh this page after starting the backend server</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Manage Clients
              </h2>
              <p className="text-sm text-gray-500">
                View, search, and manage all clients
              </p>
            </div>
            <button
              onClick={() => setShowAddClientModal(true)}
              className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Client
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, phone, or API key..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>

              <button
                onClick={fetchClients}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Items per page */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredClients.length)} of{" "}
              {filteredClients.length}
            </span>
          </div>
        </div>

        {/* Table */}
        {paginatedClients.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <p className="text-lg font-medium">No clients found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("epaperName")}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Epaper
                      {sortField === "epaperName" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("clientName")}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Client
                      {sortField === "clientName" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Credentials
                  </th>
                  <th
                    onClick={() => handleSort("startDate")}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Start
                      {sortField === "startDate" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("expiryDate")}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      Expiry
                      {sortField === "expiryDate" && (
                        <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.epaperName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.clientName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {client.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {client.clientPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        {/* API Key */}
                        <div>
                          <div className="text-xs font-semibold text-gray-600 uppercase mb-0.5">
                            API Key
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs text-gray-700 font-mono truncate max-w-[150px]"
                              title={client.apiKey}
                            >
                              {client.apiKey || "N/A"}
                            </span>
                            {client.apiKey && (
                              <button
                                onClick={() => copyToClipboard(client.apiKey)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Copy API Key"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {/* API Passcode */}
                        <div>
                          <div className="text-xs font-semibold text-gray-600 uppercase mb-0.5">
                            Passcode
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs text-gray-700 font-mono truncate max-w-[150px]"
                              title={client.apiPasscode}
                            >
                              {client.apiPasscode || "N/A"}
                            </span>
                            {client.apiPasscode && (
                              <button
                                onClick={() =>
                                  copyToClipboard(client.apiPasscode)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="Copy Passcode"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {client.startDate
                        ? new Date(client.startDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {client.expiryDate
                        ? new Date(client.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isExpired(client.expiryDate) ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openViewModal(client)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Client Modal */}
      {showViewModal && viewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  Client Details
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      E-Paper Name
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.epaperName}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Client Name
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.clientName}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.email}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Phone Number
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.clientPhone}
                    </p>
                  </div>
                  {viewClient.alternativeNumber && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-xs font-semibold text-gray-600 uppercase">
                        Alternative Number
                      </label>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {viewClient.alternativeNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Street:</span>{" "}
                    {viewClient.address?.street}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Village:</span>{" "}
                    {viewClient.address?.village}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">District:</span>{" "}
                    {viewClient.address?.district}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">State:</span>{" "}
                    {viewClient.address?.state}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Pincode:</span>{" "}
                    {viewClient.address?.pincode}
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Subscription Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Start Date
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.startDate
                        ? new Date(viewClient.startDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Expiry Date
                    </label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {viewClient.expiryDate
                        ? new Date(viewClient.expiryDate).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </label>
                    <p className="mt-1">
                      {isExpired(viewClient.expiryDate) ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* API Credentials */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  API Credentials
                </h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="text-xs font-semibold text-blue-900 uppercase mb-2 block">
                      API Key
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-gray-800 bg-white px-3 py-2 rounded border break-all">
                        {viewClient.apiKey || "N/A"}
                      </code>
                      {viewClient.apiKey && (
                        <button
                          onClick={() => copyToClipboard(viewClient.apiKey)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                          title="Copy API Key"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="text-xs font-semibold text-blue-900 uppercase mb-2 block">
                      API Passcode
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-gray-800 bg-white px-3 py-2 rounded border break-all">
                        {viewClient.apiPasscode || "N/A"}
                      </code>
                      {viewClient.apiPasscode && (
                        <button
                          onClick={() =>
                            copyToClipboard(viewClient.apiPasscode)
                          }
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                          title="Copy API Passcode"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeViewModal}
                className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  Add New Client
                </h3>
                <button
                  onClick={() => {
                    setShowAddClientModal(false);
                    setSubmitMessage({ type: "", text: "" });
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Success/Error Message */}
              {submitMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center ${
                    submitMessage.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <span className="mr-2 text-xl">
                    {submitMessage.type === "success" ? "✅" : "❌"}
                  </span>
                  <span className="font-medium">{submitMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5 sm:space-y-6">
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Epaper Name */}
                  <div>
                    <label
                      htmlFor="epaperName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Epaper Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="epaperName"
                      name="epaperName"
                      value={formData.epaperName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.epaperName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Epaper Name"
                    />
                    {errors.epaperName && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.epaperName}
                      </p>
                    )}
                  </div>

                  {/* Client Name */}
                  <div>
                    <label
                      htmlFor="clientName"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.clientName
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Client Name"
                    />
                    {errors.clientName && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  {/* Client Phone Number */}
                  <div>
                    <label
                      htmlFor="clientPhone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Client Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.clientPhone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Phone Number"
                    />
                    {errors.clientPhone && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.clientPhone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Email Address"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Address Details
                    </h3>
                    <p className="text-xs text-gray-500">
                      Please provide the complete address information
                    </p>
                  </div>

                  {/* Street - Full Width */}
                  <div className="mb-4">
                    <label
                      htmlFor="street"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Street <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.street
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Street Address"
                    />
                    {errors.street && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* Address Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {/* Pincode */}
                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.pincode
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                        placeholder="Enter Pincode"
                      />
                      {errors.pincode && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                          <span className="mr-1">⚠</span>
                          {errors.pincode}
                        </p>
                      )}
                    </div>

                    {/* Village */}
                    <div>
                      <label
                        htmlFor="village"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Village <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="village"
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.village
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                        placeholder="Enter Village"
                      />
                      {errors.village && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                          <span className="mr-1">⚠</span>
                          {errors.village}
                        </p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label
                        htmlFor="district"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.district
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                        placeholder="Enter District"
                      />
                      {errors.district && (
                        <p className="mt-1.5 text-xs text-red-600 flex items-center">
                          <span className="mr-1">⚠</span>
                          {errors.district}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State */}
                  <div className="mt-4">
                    <label
                      htmlFor="state"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.state
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter State"
                    />
                    {errors.state && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* Alternative Number */}
                  <div>
                    <label
                      htmlFor="alternativeNumber"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Alternative Number
                    </label>
                    <input
                      type="tel"
                      id="alternativeNumber"
                      name="alternativeNumber"
                      value={formData.alternativeNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-400"
                      placeholder="Enter Alternative Number (Optional)"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.password
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                      placeholder="Enter Password"
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.startDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        errors.expiryDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          epaperName: "",
                          clientName: "",
                          clientPhone: "",
                          email: "",
                          street: "",
                          pincode: "",
                          village: "",
                          district: "",
                          state: "",
                          alternativeNumber: "",
                          startDate: "",
                          expiryDate: "",
                          password: "",
                        });
                        setErrors({});
                        setSubmitMessage({ type: "", text: "" });
                      }}
                      disabled={submitLoading}
                      className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        submitLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {submitLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Adding Client...
                        </span>
                      ) : (
                        "Add Client"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClients;