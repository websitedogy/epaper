import { useState } from "react";

// Icon Components
const ClientIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const DashboardIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChevronIcon = ({ className, isOpen }) => (
  <svg
    className={`${className} transform transition-transform duration-200 ${
      isOpen ? "rotate-180" : ""
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const Sidebar = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Super Admin</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors"
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
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-3">
            {/* Dashboard */}
            <button
              onClick={() => {
                setActiveView("dashboard");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "dashboard"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <DashboardIcon
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "dashboard" ? "text-white" : "text-gray-400"
                }`}
              />
              <span className="font-medium text-sm">Dashboard</span>
            </button>

            {/* Clients Dropdown */}
            <div className="mb-1">
              <button
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  activeView === "manageClients"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <ClientIcon
                    className={`mr-3 w-5 h-5 flex-shrink-0 ${
                      activeView === "manageClients"
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium text-sm">Clients</span>
                </div>
                <ChevronIcon
                  className={`w-4 h-4 ${
                    activeView === "manageClients"
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                  isOpen={clientDropdownOpen}
                />
              </button>

              {/* Dropdown Items */}
              {clientDropdownOpen && (
                <div className="mt-1 ml-4 space-y-1">
                  <button
                    onClick={() => {
                      setActiveView("manageClients");
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-all duration-200 text-sm ${
                      activeView === "manageClients"
                        ? "bg-blue-500 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span className="mr-3">•</span>
                    Manage Clients
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => {
                setActiveView("renewals");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "renewals"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "renewals" ? "text-white" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="font-medium text-sm">Renewals</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setActiveView("settings");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "settings"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <SettingsIcon
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "settings" ? "text-white" : "text-gray-400"
                }`}
              />
              <span className="font-medium text-sm">Settings</span>
            </button>

            {/* Subscriptions */}
            <button
              onClick={() => {
                setActiveView("subscriptions");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "subscriptions"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "subscriptions"
                    ? "text-white"
                    : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium text-sm">Subscriptions</span>
            </button>

            {/* Subscribers */}
            <button
              onClick={() => {
                setActiveView("subscribers");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "subscribers"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "subscribers" ? "text-white" : "text-gray-400"
                }`}
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
              <span className="font-medium text-sm">Subscribers</span>
            </button>

            {/* Referral Management */}
            <button
              onClick={() => {
                setActiveView("referrals");
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg transition-all duration-200 ${
                activeView === "referrals"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg
                className={`mr-3 w-5 h-5 flex-shrink-0 ${
                  activeView === "referrals" ? "text-white" : "text-gray-400"
              }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="font-medium text-sm">Referral Management</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              © 2025 Super Admin
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
