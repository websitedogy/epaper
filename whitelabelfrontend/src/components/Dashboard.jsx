import { useState, useEffect } from "react";
import { clientAPI, renewalAPI } from "../services/api";

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    expiredClients: 0,
    expiringIn30Days: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await renewalAPI.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchClients = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await clientAPI.getAll();
      setClients(res.data || []);
      setLoaded(true);
      // Refresh stats after loading clients
      await fetchStats();
    } catch (err) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    // Load clients when user clicks the All Clients box
    if (!loaded) fetchClients();
  };

  const handleRefresh = () => {
    fetchClients();
  };

  const filtered = clients.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.epaperName && c.epaperName.toLowerCase().includes(q)) ||
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.clientPhone && c.clientPhone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
    

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">
                Total Clients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalClients}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">
                Active
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeClients}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">
                Expiring in 30 Days
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.expiringIn30Days}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Expired Clients */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase">
                Expired
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.expiredClients}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick card row (All Clients) - separate card so it doesn't look nested */}
      {!loaded && (
        <div>
          <div className="bg-transparent">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 max-w-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    All Clients
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to view all clients
                  </p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleCardClick}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm font-semibold hover:bg-blue-100 transition"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loaded section: search + table inside its own card */}
      {loaded && (
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email or phone"
                className="w-full sm:w-64 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading && (
            <div className="py-6 text-center text-gray-500">
              Loading clients...
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-6 text-center text-gray-500">
              No clients found.
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Epaper
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.epaperName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.clientName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.clientPhone}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.startDate
                          ? new Date(c.startDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {c.expiryDate
                          ? new Date(c.expiryDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
