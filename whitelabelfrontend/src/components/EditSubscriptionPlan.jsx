import { useState, useEffect } from "react";
import { subscriptionPlanAPI } from "../services/api";

const EditSubscriptionPlan = ({ plan, onPlanUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    duration: "",
    discount: "",
    features: [""],
    description: "",
    paymentLink: "",
    bankDetails: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with plan data
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        amount: plan.amount || "",
        duration: plan.duration || "",
        discount: plan.discount || "",
        features: plan.features && plan.features.length > 0 ? plan.features : [""],
        description: plan.description || "",
        paymentLink: plan.paymentLink || "",
        bankDetails: plan.bankDetails || "",
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeaturesChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeatureField = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        features: newFeatures,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Filter out empty features
      const filteredFeatures = formData.features.filter(
        (feature) => feature.trim() !== ""
      );

      const planData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        duration: formData.duration,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        features: filteredFeatures,
        description: formData.description,
        paymentLink: formData.paymentLink,
        bankDetails: formData.bankDetails,
        isActive: formData.isActive,
      };

      const response = await subscriptionPlanAPI.update(plan._id, planData);

      if (response.success) {
        onPlanUpdated(response.data);
      } else {
        setError(response.message || "Failed to update subscription plan");
      }
    } catch (err) {
      setError(err.message || "An error occurred while updating the plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subscription plan? This action cannot be undone.")) {
      try {
        setLoading(true);
        const response = await subscriptionPlanAPI.delete(plan._id);
        
        if (response.success) {
          onPlanUpdated(null); // Pass null to indicate deletion
        } else {
          setError(response.message || "Failed to delete subscription plan");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the plan");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Subscription Plan
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Premium Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 99.99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1 year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) =>
                        handleFeaturesChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Feature ${index + 1}`}
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureField(index)}
                        className="text-red-500 hover:text-red-700"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeatureField}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter plan description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Link
                </label>
                <input
                  type="url"
                  name="paymentLink"
                  value={formData.paymentLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://payment-link.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Details
                </label>
                <textarea
                  name="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bank details for payment..."
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active Plan
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Deleting..." : "Delete Plan"}
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Updating..." : "Update Plan"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSubscriptionPlan;