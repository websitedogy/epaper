import { useState, useEffect } from "react";
import { referralAPI } from "../services/api";

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Fetch referrals
  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    try {
      const status = filter !== "all" ? filter : null;
      const data = await referralAPI.getAll(status);
      setReferrals(data.data || []);
    } catch (err) {
      setError(err.message || "An error occurred while fetching referrals");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Open approval modal
  const openApprovalModal = (referral) => {
    setSelectedReferral(referral);
    setApprovalAmount(referral.referralAmount || "");
    setReviewNotes(referral.reviewNotes || "");
    setShowApprovalModal(true);
  };

  // Close approval modal
  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedReferral(null);
    setApprovalAmount("");
    setReviewNotes("");
  };

  // Approve or reject referral
  const handleApproval = async (status) => {
    if (!selectedReferral) return;

    try {
      // Ensure referralAmount is a valid number
      const referralAmount = status === "approved" ? parseFloat(approvalAmount) || 0 : 0;
      
      // Validate the amount
      if (status === "approved" && (isNaN(referralAmount) || referralAmount < 0)) {
        throw new Error("Please enter a valid referral amount");
      }
      
      console.log("Updating referral status with:", {
        id: selectedReferral._id,
        status,
        referralAmount,
        reviewNotes,
        reviewedBy: "superadmin"
      });
      
      await referralAPI.updateStatus(selectedReferral._id, status, referralAmount, reviewNotes);

      // Refresh referrals
      fetchReferrals();
      closeApprovalModal();
    } catch (err) {
      console.error("Error updating referral status:", err);
      setError(err.message || "An error occurred while updating referral status");
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Referral Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage client referrals and approve earnings
            </p>
          </div>
          <button
            onClick={fetchReferrals}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Referrals
          </button>
          <button
            onClick={() => handleFilterChange("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange("approved")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "approved"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange("rejected")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No referrals found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referring Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referredClientDetails.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.referredClientDetails.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referringClientId?.clientName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.referringClientId?.email || "Unknown"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div>{referral.referredClientDetails.phone}</div>
                      <div>{referral.referredClientDetails.village}, {referral.referredClientDetails.district}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ₹{referral.referralAmount || "0.00"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          referral.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : referral.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {referral.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApprovalModal(referral)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Review
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Referral
                </h3>
                <button
                  onClick={closeApprovalModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Referred Client
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReferral.referredClientDetails.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Referring Client
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReferral.referringClientId?.clientName || "Unknown"}
                  </p>
                  {selectedReferral.referringClientId?.referralEarnings !== undefined && (
                    <p className="mt-1 text-xs text-gray-500">
                      Current total earnings: ₹{selectedReferral.referringClientId.referralEarnings}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Referral Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={approvalAmount}
                    onChange={(e) => setApprovalAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Enter amount"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This amount will be added to the client's existing referral earnings.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Add any notes for this review"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeApprovalModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproval("rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApproval("approved")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManagement;