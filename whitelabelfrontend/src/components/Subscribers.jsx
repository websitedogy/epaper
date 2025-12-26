import { useState, useEffect } from "react";
import { subscriptionAPI } from "../services/api";

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch subscribers
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionAPI.getAll();
      if (data.success) {
        setSubscribers(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      if (error.message.includes("authentication")) {
        setError("Authentication error. Please log in again.");
      } else {
        setError("Error fetching subscribers: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExtendSubscription = async (subscriptionId, days) => {
    try {
      const subscription = subscribers.find(
        (sub) => sub._id === subscriptionId
      );
      if (!subscription) return;

      const newEndDate = new Date(subscription.end_at);
      newEndDate.setDate(newEndDate.getDate() + days);

      const data = await subscriptionAPI.update(subscriptionId, {
        end_at: newEndDate,
      });

      if (data.success) {
        alert("Subscription extended successfully!");
        fetchSubscribers(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error extending subscription:", error);
      if (error.message.includes("authentication")) {
        alert("Authentication error. Please log in again.");
      } else {
        alert("Error extending subscription");
      }
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    try {
      const data = await subscriptionAPI.update(subscriptionId, {
        status: "cancelled",
      });

      if (data.success) {
        alert("Subscription cancelled successfully!");
        fetchSubscribers(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      if (error.message.includes("authentication")) {
        alert("Authentication error. Please log in again.");
      } else {
        alert("Error cancelling subscription");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Expired
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribers</h1>
        <p className="text-gray-600">
          Manage all subscription plans and subscribers.
        </p>
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No subscribers yet
          </h3>
          <p className="text-gray-500">
            Get started by activating a subscription for a client.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Start Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    End Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.client?.clientName || "Unknown Client"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscriber.client?.email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subscriber.plan}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${subscriber.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.start_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscriber.end_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(subscriber.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {subscriber.status === "active" && (
                          <>
                            <button
                              onClick={() =>
                                handleExtendSubscription(subscriber._id, 30)
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Extend 30 days
                            </button>
                            <button
                              onClick={() =>
                                handleExtendSubscription(subscriber._id, 365)
                              }
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Extend 1 year
                            </button>
                          </>
                        )}
                        {subscriber.status === "active" && (
                          <button
                            onClick={() =>
                              handleCancelSubscription(subscriber._id)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() =>
                            alert(
                              `View details for ${
                                subscriber.client?.clientName || "client"
                              }`
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
