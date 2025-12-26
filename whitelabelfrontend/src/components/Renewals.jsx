import { useState, useEffect } from "react";
import { renewalAPI, clientAPI } from "../services/api";

const Renewals = () => {
  const [renewals, setRenewals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [renewalDays, setRenewalDays] = useState(30);
  const [renewalAmount, setRenewalAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [renewalLoading, setRenewalLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [renewalsRes, clientsRes] = await Promise.all([
        renewalAPI.getAll(),
        clientAPI.getAll(),
      ]);
      setRenewals(renewalsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const openRenewalModal = (client) => {
    setSelectedClient(client);
    setShowRenewalModal(true);
    setRenewalDays(30);
    setRenewalAmount(0);
    setPaymentStatus("pending");
    setNotes("");
  };

  const closeRenewalModal = () => {
    setShowRenewalModal(false);
    setSelectedClient(null);
    setRenewalDays(30);
    setRenewalAmount(0);
    setPaymentStatus("pending");
    setNotes("");
  };

  const handleCreateRenewal = async () => {
    if (!selectedClient || renewalDays <= 0) {
      alert("Please select a client and enter valid extension days");
      return;
    }

    setRenewalLoading(true);
    try {
      const renewalData = {
        clientId: selectedClient._id,
        extensionDays: parseInt(renewalDays),
        renewalAmount: parseFloat(renewalAmount) || 0,
        paymentStatus,
        notes,
      };

      await renewalAPI.create(renewalData);
      alert("Renewal created successfully!");
      closeRenewalModal();
      fetchData();
    } catch (err) {
      alert("Failed to create renewal: " + (err.message || "Unknown error"));
    } finally {
      setRenewalLoading(false);
    }
  };

  const filteredRenewals = renewals.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.clientName && r.clientName.toLowerCase().includes(q)) ||
      (r.epaperName && r.epaperName.toLowerCase().includes(q))
    );
  });

  const getActiveClients = () => {
    const now = new Date();
    return clients.filter((c) => new Date(c.expiryDate) >= now);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading renewals...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Renewals
            </h2>
            <p className="text-sm text-gray-500">
              Manage client subscription renewals
            </p>
          </div>
          <button
            onClick={() => setShowRenewalModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Renewal
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name or epaper..."
            className="w-full sm:w-96 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Renewals Table */}
        {filteredRenewals.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium">No renewals found</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a renewal to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Epaper
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Previous Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    New Expiry
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Extension
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRenewals.map((renewal) => (
                  <tr key={renewal._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {renewal.clientName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {renewal.epaperName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(
                        renewal.previousExpiryDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(renewal.newExpiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {renewal.extensionDays} days
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      ${renewal.renewalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          renewal.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : renewal.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {renewal.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(renewal.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renewal Modal */}
      {showRenewalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Create Renewal
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClient?._id || ""}
                  onChange={(e) => {
                    const client = getActiveClients().find(
                      (c) => c._id === e.target.value
                    );
                    setSelectedClient(client || null);
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Client --</option>
                  {getActiveClients().map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.clientName} - {client.epaperName} (Expires:{" "}
                      {new Date(client.expiryDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Extension Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Extension Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={renewalDays}
                  onChange={(e) => setRenewalDays(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter number of days"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Renewal Amount ($)
                </label>
                <input
                  type="number"
                  value={renewalAmount}
                  onChange={(e) => setRenewalAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any notes or comments"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeRenewalModal}
                disabled={renewalLoading}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRenewal}
                disabled={renewalLoading}
                className={`px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                  renewalLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {renewalLoading ? "Creating..." : "Create Renewal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Renewals;
