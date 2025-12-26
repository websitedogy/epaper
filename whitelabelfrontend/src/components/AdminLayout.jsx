import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ClientForm from "./ClientForm";
import Dashboard from "./Dashboard";
import ManageClients from "./ManageClients";
import Renewals from "./Renewals";
import Subscriptions from "./Subscriptions";
import Subscribers from "./Subscribers";
import Login from "./Login";
import CalendarPopup from "./CalendarPopup"; // Add this import
import ReferralManagement from "./ReferralManagement";

const AdminLayout = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false); // Add this state

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(authStatus === "true");
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("username");
      setIsAuthenticated(false);
      setActiveView("dashboard");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Functions for the new buttons
  const handleClipClick = () => {
    alert("Clip button clicked");
  };

  const handlePdfClick = () => {
    alert("PDF button clicked");
  };

  const handleCalendarClick = () => {
    setShowCalendar(true); // Show the calendar popup
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    // Format the date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Redirect to the epaper page with the selected date
    window.location.href = `/epaper?date=${formattedDate}`;
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "addClient":
        return <ClientForm />;
      case "manageClients":
        return <ManageClients />;
      case "renewals":
        return <Renewals />;
      case "settings":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
                Settings
              </h2>
              <p className="text-gray-600">
                Settings content will be displayed here.
              </p>
            </div>
          </div>
        );
      case "subscriptions":
        return <Subscriptions />;
      case "subscribers":
        return <Subscribers />;
      case "referrals":
        return <ReferralManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 w-full lg:ml-64">
        <Navbar onMenuClick={toggleSidebar} onLogout={handleLogout} />
        {/* Buttons below navbar */}
        <div className="flex justify-end space-x-2 p-2 bg-gray-100 border-b">
          <button 
            onClick={handleClipClick}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Clip
          </button>
          <button 
            onClick={handlePdfClick}
            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button 
            onClick={handleCalendarClick}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </button>
        </div>
        <main className="pt-20 lg:pt-24 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
      
      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup 
          onClose={() => setShowCalendar(false)} 
          onDateSelect={handleDateSelect}
        />
      )}
    </div>
  );
};

export default AdminLayout;