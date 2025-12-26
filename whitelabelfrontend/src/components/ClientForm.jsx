import { useState } from "react";
import { clientAPI, subscriptionAPI } from "../services/api";

const ClientForm = () => {
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
    // Add subscription fields
    subscriptionPlan: "",
    subscriptionPrice: 0,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const [createdClient, setCreatedClient] = useState(null);

  // Subscription plans
  const subscriptionPlans = [
    { id: 1, name: "1 Year Plan", price: 99, duration: "1 year" },
    { id: 2, name: "4 Years Plan", price: 299, duration: "4 years" },
    { id: 3, name: "Lifetime Plan", price: 499, duration: "100 years" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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
    // Validate subscription plan if selected
    if (formData.subscriptionPlan && !formData.subscriptionPrice) {
      newErrors.subscriptionPlan = "Invalid subscription plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First create the client
      const clientData = {
        epaperName: formData.epaperName,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        email: formData.email,
        street: formData.street,
        pincode: formData.pincode,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        alternativeNumber: formData.alternativeNumber,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        password: formData.password,
      };

      const clientResponse = await clientAPI.create(clientData);

      // If subscription plan is selected, create subscription
      let subscriptionResponse = null;
      if (formData.subscriptionPlan) {
        const subscriptionData = {
          client: clientResponse.data._id,
          plan: formData.subscriptionPlan,
          price: formData.subscriptionPrice,
        };

        subscriptionResponse = await subscriptionAPI.create(subscriptionData);
      }

      setSubmitMessage({
        type: "success",
        text: subscriptionResponse
          ? "Client and subscription added successfully!"
          : "Client added successfully!",
      });

      // Store created client data
      setCreatedClient(clientResponse.data);

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
        subscriptionPlan: "",
        subscriptionPrice: 0,
      });
      setErrors({});

      // Don't clear success message or createdClient immediately
      // Clear after 30 seconds
      setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
        setCreatedClient(null);
      }, 30000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error.message || "Failed to add client. Please try again.",
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Add E-Paper Client
          </h2>
          <p className="text-sm text-gray-500">
            Fill in the details below to add a new client
          </p>
        </div>

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

        {/* API Credentials Display */}
        {createdClient && createdClient.apiKey && (
          <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
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
              <h3 className="text-lg font-bold text-blue-900">
                API Credentials Created
              </h3>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Please save these credentials securely. You can copy them using
              the buttons below.
            </p>

            <div className="space-y-3">
              {/* API Key */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <label className="text-xs font-semibold text-blue-900 uppercase mb-1 block">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-800 bg-gray-50 px-3 py-2 rounded border break-all">
                    {createdClient.apiKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdClient.apiKey);
                      alert("API Key copied to clipboard!");
                    }}
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
                </div>
              </div>

              {/* API Passcode */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <label className="text-xs font-semibold text-blue-900 uppercase mb-1 block">
                  API Passcode
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-800 bg-gray-50 px-3 py-2 rounded border break-all">
                    {createdClient.apiPasscode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdClient.apiPasscode);
                      alert("API Passcode copied to clipboard!");
                    }}
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
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                    subscriptionPlan: "",
                    subscriptionPrice: 0,
                  });
                  setErrors({});
                  setSubmitMessage({ type: "", text: "" });
                }}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
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
  );
};

export default ClientForm;
