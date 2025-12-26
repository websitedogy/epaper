const ClientInfo = ({ clientData }) => {
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = () => {
    if (isExpired(clientData?.expiryDate))
      return "text-red-600 bg-red-50 border-red-200";
    if (getDaysRemaining(clientData?.expiryDate) <= 7)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getStatusText = () => {
    if (isExpired(clientData?.expiryDate)) return "Expired";
    if (getDaysRemaining(clientData?.expiryDate) <= 7) return "Expiring Soon";
    return "Active";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {clientData?.epaperName}
                </h1>
                <p className="text-sm text-gray-500">
                  Client Information Portal
                </p>
              </div>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Admin Login
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Banner */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full ${
                  isExpired(clientData?.expiryDate)
                    ? "bg-red-100"
                    : getDaysRemaining(clientData?.expiryDate) <= 7
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                <svg
                  className={`w-8 h-8 ${
                    isExpired(clientData?.expiryDate)
                      ? "text-red-600"
                      : getDaysRemaining(clientData?.expiryDate) <= 7
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isExpired(clientData?.expiryDate) ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold">{getStatusText()}</h2>
                <p className="text-sm mt-1">
                  {isExpired(clientData?.expiryDate)
                    ? "Your subscription has expired"
                    : `${getDaysRemaining(
                        clientData?.expiryDate
                      )} days remaining`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Client Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Client Name
                </label>
                <p className="text-base font-medium text-gray-900">
                  {clientData?.clientName}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Email
                </label>
                <p className="text-base font-medium text-gray-900">
                  {clientData?.email}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Phone
                </label>
                <p className="text-base font-medium text-gray-900">
                  {clientData?.clientPhone}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-600"
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
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Start Date
                </label>
                <p className="text-base font-medium text-gray-900">
                  {clientData?.startDate
                    ? new Date(clientData.startDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Expiry Date
                </label>
                <p
                  className={`text-base font-bold ${
                    isExpired(clientData?.expiryDate)
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {clientData?.expiryDate
                    ? new Date(clientData.expiryDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Days Remaining
                </label>
                <p className="text-2xl font-bold text-indigo-600">
                  {getDaysRemaining(clientData?.expiryDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* E-Paper Info */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-indigo-100 uppercase mb-2">
                Your E-Paper
              </h3>
              <p className="text-3xl font-bold">{clientData?.epaperName}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        {isExpired(clientData?.expiryDate) && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="text-sm font-bold text-red-900">
                  Subscription Expired
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Your subscription has expired. Please contact the
                  administrator to renew your subscription.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientInfo;
