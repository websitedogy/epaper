const Profile = ({ clientData }) => {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600 mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Subscription Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Current Status
            </label>
            <p
              className={`text-lg font-bold mt-1 ${
                isExpired(clientData?.expiryDate)
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {isExpired(clientData?.expiryDate) ? "Expired" : "Active"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Days Remaining
            </label>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {getDaysRemaining(clientData?.expiryDate)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Expiry Date
            </label>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {clientData?.expiryDate
                ? new Date(clientData.expiryDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
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
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              E-Paper Name
            </label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {clientData?.epaperName || "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Client Name
            </label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {clientData?.clientName || "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Email
            </label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {clientData?.email || "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-xs font-semibold text-gray-600 uppercase">
              Phone
            </label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {clientData?.clientPhone || "N/A"}
            </p>
          </div>
          {clientData?.alternativeNumber && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Alternative Phone
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.alternativeNumber}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      {clientData?.address && (
        <div className="bg-white rounded-xl shadow-md p-6">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Street
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.address.street || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Village
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.address.village || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                District
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.address.district || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                State
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.address.state || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Pincode
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {clientData.address.pincode || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Credentials */}
      <div className="bg-white rounded-xl shadow-md p-6">
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          API Credentials
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-yellow-800">
              Keep your API credentials secure. Do not share them with
              unauthorized users.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
            API Key
          </label>
          <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
            <code className="text-sm text-gray-900 font-mono break-all">
              {clientData?.apiKey || "N/A"}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
