import { useState, useEffect } from "react";
import { subscriptionPlanAPI } from "../services/api";
import AddSubscriptionPlan from "./AddSubscriptionPlan";
import EditSubscriptionPlan from "./EditSubscriptionPlan";

const Subscriptions = () => {
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  // Fetch plans
  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const data = await subscriptionPlanAPI.getActive();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      // Set empty array if API fails
      setPlans([]);
    }
  };

  const handlePlanAdded = (newPlan) => {
    setShowAddPlanModal(false);
    // Refresh plans list
    fetchSubscriptionPlans();
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowEditPlanModal(true);
  };

  const handlePlanUpdated = (updatedPlan) => {
    setShowEditPlanModal(false);
    setEditingPlan(null);
    // Refresh plans list
    fetchSubscriptionPlans();
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this subscription plan? This action cannot be undone.")) {
      try {
        const response = await subscriptionPlanAPI.delete(planId);
        if (response.success) {
          alert("Subscription plan deleted successfully!");
          // Refresh plans list
          fetchSubscriptionPlans();
        } else {
          alert(`Error: ${response.message}`);
        }
      } catch (error) {
        console.error("Error deleting subscription plan:", error);
        alert("Error deleting subscription plan");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Plans
            </h1>
            <p className="text-gray-600">
              Manage subscription plans for your clients.
            </p>
          </div>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Add Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular
                ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-50"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-t-xl">
                MOST POPULAR
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Edit Plan"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="text-gray-500 hover:text-red-600"
                    title="Delete Plan"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
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
            </div>
          </div>
        ))}
      </div>

      {/* Add Subscription Plan Modal */}
      {showAddPlanModal && (
        <AddSubscriptionPlan
          onPlanAdded={handlePlanAdded}
          onCancel={() => setShowAddPlanModal(false)}
        />
      )}

      {/* Edit Subscription Plan Modal */}
      {showEditPlanModal && (
        <EditSubscriptionPlan
          plan={editingPlan}
          onPlanUpdated={handlePlanUpdated}
          onCancel={() => setShowEditPlanModal(false)}
        />
      )}
    </div>
  );
};

export default Subscriptions;