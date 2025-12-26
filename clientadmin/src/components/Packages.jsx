import { useState, useEffect } from "react";
import { subscriptionPlanAPI, subscriptionAPI } from "../services/api";

const Packages = ({ clientData }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // razorpay, paypal, bank
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionPlanAPI.getActive();
        
        if (response.success) {
          setPlans(response.data);
          setError("");
        } else {
          setError("Failed to load subscription plans. Please try again later.");
        }
      } catch (err) {
        setError("Failed to load subscription plans. Please try again later.");
        console.error("Error fetching subscription plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      // In a real implementation, this would integrate with payment gateways
      // For now, we'll simulate the payment and then create the subscription
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create subscription in the backend
      const subscriptionData = {
        client: clientData._id,
        plan: selectedPlan.name,
        price: selectedPlan.amount
      };
      
      const response = await subscriptionAPI.create(subscriptionData);
      
      if (response.success) {
        setSuccessMessage(`Thank you for purchasing the ${selectedPlan.name}! Your subscription is now active.`);
        setShowPaymentModal(false);
        setSelectedPlan(null);
        
        // Reload client data to reflect the new subscription
        window.location.reload();
      } else {
        setError("Failed to process subscription. Please try again.");
      }
    } catch (err) {
      console.error("Error processing subscription:", err);
      setError("Failed to process subscription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setSuccessMessage("");
    setError("");
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose a plan that works best for you and your business needs.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {error && !showPaymentModal && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-t-xl">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{plan.amount}
                  </span>
                  <span className="text-gray-600">/{plan.duration}</span>
                </div>

                {plan.discount > 0 && (
                  <div className="mb-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {plan.discount}% OFF
                    </span>
                  </div>
                )}

                {plan.description && (
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                )}

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Purchase Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 mb-4">
          Contact our sales team to learn more about our subscription plans and find the perfect fit for your business.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Contact Sales
        </button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Purchase Plan</h3>
              <button
                onClick={handleClosePaymentModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={processing}
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
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-gray-900">{selectedPlan.name}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">₹{selectedPlan.amount}</p>
                <p className="text-gray-600">/{selectedPlan.duration}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300"
                      disabled={processing}
                    />
                    <span className="ml-2 text-gray-700">Razorpay</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300"
                      disabled={processing}
                    />
                    <span className="ml-2 text-gray-700">PayPal</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-indigo-600 border-gray-300"
                      disabled={processing}
                    />
                    <span className="ml-2 text-gray-700">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "bank" && selectedPlan.bankDetails && selectedPlan.bankDetails.trim() !== "" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-yellow-800 mb-2">Bank Details</h4>
                  <p className="text-yellow-700 whitespace-pre-line">{selectedPlan.bankDetails}</p>
                </div>
              )}

              {paymentMethod === "bank" && (!selectedPlan.bankDetails || selectedPlan.bankDetails.trim() === "") && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-yellow-800 mb-2">Bank Details Not Available</h4>
                  <p className="text-yellow-700">Please contact support for bank transfer details.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClosePaymentModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurchase}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={processing}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${selectedPlan.amount}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;