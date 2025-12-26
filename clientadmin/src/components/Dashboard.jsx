import { useState, useEffect } from "react";
import { authAPI, clearCredentials, epaperAPI } from "../services/api";
import Sidebar from "./Sidebar";
import Profile from "./Profile";
import PapersManagement from "./PapersManagement";
import Customization from "./Customization";
import AdsManagement from "./AdsManagement";
import Categories from "./Categories";
import SubCategories from "./SubCategories";
import Pages from "./Pages";
import Packages from "./Packages";
import ReferralSubmission from "./ReferralSubmission";
import EditionForm from "./EditionForm";
import PapersTable from "./PapersTable";
import TodayEditionsTable from "./TodayEditionsTable";
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet } from "react-router-dom";

const Dashboard = ({ clientData: initialData, onLogout }) => {
  const [clientData, setClientData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [papers, setPapers] = useState([]);
  const [displayMode, setDisplayMode] = useState("form"); // form, all, today, scheduled
  const [successMessage, setSuccessMessage] = useState(""); // Add success message state
  const [showPapersTable, setShowPapersTable] = useState(false); // State to control papers table view
  const [showReferralForm, setShowReferralForm] = useState(false); // State to control referral form view
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure we always have fresh client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response && response.data) {
          setClientData(response.data);
          localStorage.setItem("clientData", JSON.stringify(response.data));
          return response.data;
        }
        console.log ("rsp ", response.data);
        console.log("rspclient", clientData)
        return null;
      } catch (error) {
        console.error("Error fetching client data:", error);
        return null;
      }
    };

    // Fetch client data when component mounts if we don't have it
    if (!clientData || !clientData._id) {// In your Dashboard.jsx, when handling the referral earnings click:
const handleReferralEarningsClick = () => {
  // Check if client data is loaded// In ReferralSubmission.jsx, at the beginning of the component:
useEffect(() => {
  if (isOpen && !clientId) {
    console.error("ReferralSubmission: Client ID is missing");
    alert("Unable to identify your account. Please refresh the page and try again.");
    onClose(); // Close the form since we can't proceed
    return;
  }
  
  // Reset form when opening
  if (isOpen) {
    resetForm();
  }
}, [isOpen, clientId, onClose]);// Make sure your fetchClientData function properly handles the client ID:
const fetchClientData = async () => {
  try {
    setIsLoading(true);
    const response = await authAPI.getProfile();
    
    if (response && response.success && response.data) {
      setClientData(response.data);
      // Explicitly set the client ID
      if (response.data._id) {
        setClientId(response.data._id);
      }
      return response.data; // Return the data for chaining
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error fetching client data:", error);
    setError("Failed to load client data: " + error.message);
    throw error; // Re-throw for caller to handle
  } finally {
    setIsLoading(false);
  }
};
  if (!clientData || !clientData._id) {
    // If not loaded, try to fetch it first
    fetchClientData().then(() => {
      // After data is loaded, check again
      if (clientData && clientData._id) {
        setShowReferralForm(true);
      } else {
        alert("Unable to identify your account. Please refresh the page and try again.");
      }
    }).catch(() => {
      alert("Unable to identify your account. Please refresh the page and try again.");
    });
  } else {
    // Client data is available, show the form
    setShowReferralForm(true);
  }
};// When rendering the ReferralSubmission component:
{showReferralForm && clientData && clientData._id && (
  <ReferralSubmission
    clientId={clientData._id}
    isOpen={showReferralForm}
    onClose={() => setShowReferralForm(false)}
    onSubmit={handleReferralSubmit}
  />
)}
      fetchClientData();
    }
  }, [clientData]);

  // Debug: Log initial data
  useEffect(() => {
    console.log("Dashboard mounted with initialData:", initialData);
    console.log("ClientData state:", clientData);
    
    // Check localStorage for client data
    const storedData = localStorage.getItem("clientData");
    console.log("LocalStorage clientData:", storedData);
    
    // If we don't have clientData but have initialData, set it
    if (!clientData && initialData) {
      setClientData(initialData);
    } else if (!clientData && storedData) {
      // Try to load from localStorage
      try {
        const parsedData = JSON.parse(storedData);
        console.log("Loaded client data from localStorage on mount:", parsedData);
        setClientData(parsedData);
      } catch (e) {
        console.error("Error parsing localStorage clientData:", e);
      }
    }
  }, [initialData]);

  useEffect(() => {
    // Fetch papers when papers menu is active or when dashboard is active
    if (activeMenu === "papers" || activeMenu === "dashboard") {
      fetchPapers();
    }
  }, [activeMenu]);

  const fetchPapers = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  useEffect(() => {
    // Fetch latest profile data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log("Fetching client profile...");
        const response = await authAPI.getProfile();
        console.log("Profile response:", response);
        if (response && response.data) {
          setClientData(response.data);
          localStorage.setItem("clientData", JSON.stringify(response.data));
          console.log("Client data set successfully:", response.data);
        } else {
          console.error("Invalid profile response:", response);
          // Try to load from localStorage as fallback
          const storedData = localStorage.getItem("clientData");
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              setClientData(parsedData);
              console.log("Loaded client data from localStorage:", parsedData);
            } catch (parseError) {
              console.error("Error parsing localStorage data:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Try to load from localStorage as fallback
        const storedData = localStorage.getItem("clientData");
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            setClientData(parsedData);
            console.log("Loaded client data from localStorage:", parsedData);
          } catch (parseError) {
            console.error("Error parsing localStorage data:", parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Always fetch profile on mount to ensure we have the latest data
    fetchProfile();
  }, []);

  useEffect(() => {
    // Update active menu based on current route
    const path = location.pathname;
    if (path.includes("/admin/customization")) {
      setActiveMenu("customization");
    } else if (path.includes("/admin/papers")) {
      setActiveMenu("papers");
    } else if (path.includes("/admin/categories")) {
      setActiveMenu("categories");
    } else if (path.includes("/admin/subcategories")) {
      setActiveMenu("subcategories");
    } else if (path.includes("/admin/pages")) {
      setActiveMenu("pages");
    } else if (path.includes("/admin/ads")) {
      setActiveMenu("ads");
    } else if (path === "/admin") {
      setActiveMenu("dashboard");
    } else if (path.includes("/admin/profile")) {
      setActiveMenu("profile");
    } else if (path.includes("/admin/packages")) {
      setActiveMenu("packages");
    }
  }, [location]);

  // Periodically refresh client data to ensure it's up to date
  useEffect(() => {
    const interval = setInterval(async () => {
      if (clientData && (clientData._id || clientData.id)) {
        try {
          console.log("Periodically refreshing client data");
          const response = await authAPI.getProfile();
          if (response && response.data) {
            // Only update if data has changed
            if (JSON.stringify(response.data) !== JSON.stringify(clientData)) {
              console.log("Client data updated from periodic refresh");
              setClientData(response.data);
              localStorage.setItem("clientData", JSON.stringify(response.data));
            }
          }
        } catch (error) {
          console.error("Error refreshing client data:", error);
        }
      }
    }, 30000); // Refresh every 30 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [clientData]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      clearCredentials();
      localStorage.removeItem("isClientLoggedIn");
      onLogout();
    }
  };

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

  if (loading && !clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Filter papers based on display mode
  const getFilteredPapers = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (displayMode) {
      case "all":
        return papers;
      case "today":
        return papers.filter(paper => {
          if (!paper.scheduleDate) return false;
          const paperDate = new Date(paper.scheduleDate);
          const paperDay = new Date(paperDate.getFullYear(), paperDate.getMonth(), paperDate.getDate());
          return paperDay.getTime() === today.getTime();
        });
      case "scheduled":
        return papers.filter(paper => {
          if (!paper.scheduleDate) return false;
          const paperDate = new Date(paper.scheduleDate);
          return paperDate > now;
        });
      default:
        return [];
    }
  };

  // Render the dashboard content
  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Show PapersTable when showPapersTable is true */}
      {showPapersTable ? (
        <PapersTable onClose={() => setShowPapersTable(false)} />
      ) : showReferralForm ? (
        <ReferralSubmission 
          clientId={clientData?._id || clientData?.id || ""} 
          clientData={clientData}

          onReferralSubmitted={() => {
            setShowReferralForm(false);
            // Refresh client data to show updated earnings
            const fetchProfile = async () => {
              try {
                console.log("Refreshing client profile after referral submission");
                const response = await authAPI.getProfile();
                if (response && response.data) {
                  console.log("Updated client data:", response.data);
                  setClientData(response.data);
                  localStorage.setItem("clientData", JSON.stringify(response.data));
                  console.log("Referral earnings displayed:", response.data.referralEarnings);
                } else {
                  console.error("Invalid response from profile API");
                }
              } catch (error) {
                console.error("Error fetching profile:", error);
              }
            };
            fetchProfile();
          }}
          onClose={() => setShowReferralForm(false)} 
        />
      ) : (
        <>
          {/* Status Banner */}
          {isExpired(clientData?.expiryDate) ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
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
                  <h3 className="text-sm font-medium text-red-800">
                    Subscription Expired
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your subscription has expired. Please renew to continue accessing the service.
                  </p>
                </div>
              </div>
            </div>
          ) : getDaysRemaining(clientData?.expiryDate) <= 7 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0"
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
                  <h3 className="text-sm font-medium text-yellow-800">
                    Subscription Expiring Soon
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription expires in {getDaysRemaining(clientData?.expiryDate)} days. Please renew to avoid service interruption.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Package */}
            <div 
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setActiveMenu("packages");
                // Navigate to the packages route
                navigate("/admin/packages");
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Packages
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-2 truncate">
                    {clientData?.subscription?.plan || "No Active Package"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {clientData?.subscription?.status === "active" ? "Active" : "Inactive"}
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Status
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {isExpired(clientData?.expiryDate) ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full flex-shrink-0 ${
                    isExpired(clientData?.expiryDate)
                      ? "bg-red-100"
                      : "bg-green-100"
                  }`}
                >
                  {isExpired(clientData?.expiryDate) ? (
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  ) : (
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
                  )}
                </div>
              </div>
            </div>

            {/* Days Remaining */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Days Remaining
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {getDaysRemaining(clientData?.expiryDate)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
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
                </div>
              </div>
            </div>

            {/* Billings */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Billings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{clientData?.billing?.amount || "0.00"}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Referrals as Earnings */}
            <div 
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                // Simply show the referral form without complex validation
                setShowReferralForm(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Referrals Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{clientData?.referralEarnings || "0.00"}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

   
            {/* Total Editions */}
            <div 
              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowPapersTable(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase">
                    Total Editions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {papers.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 00-2-2v-6a2 2 0 002-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Active Categories */}
            
          </div>

          {/* Quick Information */}
          {clientData && (
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Quick Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                    {clientData?.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Phone
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {clientData?.clientPhone}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Start Date
                  </label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {clientData?.startDate
                      ? new Date(clientData.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render the papers content
  const renderPapersContent = () => (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Buttons for papers section */}
      <div className="flex flex-wrap gap-3">
        <button 
          className={`px-4 py-2 rounded-lg transition-colors ${
            displayMode === "form" 
              ? "bg-purple-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setDisplayMode("form")}
        >
           New Editions
        </button>
          <button 
          className={`px-4 py-2 rounded-lg transition-colors ${
            displayMode === "scheduled" 
              ? "bg-green-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setDisplayMode("scheduled")}
        >
          Scheduled Editions
        </button>
        <button 
          className={`px-4 py-2 rounded-lg transition-colors ${
            displayMode === "today" 
              ? "bg-indigo-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setDisplayMode("today")}
        >
          Today Editions
        </button>
      </div>
      
      {/* Display content based on selected mode */}
      {displayMode === "form" ? (
        <EditionForm
          onClose={() => {}} // No need for close function
          onEditionCreated={() => {
            fetchPapers(); // Refresh papers list after creating
            setSuccessMessage("Edition saved successfully! PDF is being converted to images."); // Set success message
            // Clear success message after 5 seconds
            setTimeout(() => {
              setSuccessMessage("");
            }, 5000);
          }}
          editingEdition={null}
        />
      ) : (
        displayMode === "today" ? (
          <TodayEditionsTable papers={getFilteredPapers()} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredPapers().length === 0 ? (
            <div className="col-span-full text-center py-12">
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
              <p className="text-lg font-medium text-gray-900 mb-2">
                No {displayMode === "today" ? "today" : displayMode === "scheduled" ? "scheduled" : ""} editions found
              </p>
              <p className="text-gray-500">
                {displayMode === "today" 
                  ? "No editions scheduled for today." 
                  : displayMode === "scheduled" 
                  ? "No upcoming scheduled editions." 
                  : "Get started by creating a new paper edition."}
              </p>
            </div>
          ) : (
            getFilteredPapers().map((paper) => (
              <div key={paper._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {paper.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{paper.scheduleDate ? new Date(paper.scheduleDate).toLocaleDateString() : "Not scheduled"}</span>
                      {paper.scheduleTime && (
                        <span className="ml-2">at {paper.scheduleTime}</span>
                      )}
                    </div>
                    
                    {paper.category && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>Category: {paper.category}</span>
                      </div>
                    )}
                    
                    {paper.pageCount > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{paper.pageCount} pages</span>
                      </div>
                    )}
                    
                    {paper.images && paper.images.length > 0 && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{paper.images.length} images converted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        clientData={clientData}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="lg:hidden mr-3">
                  {/* Space for mobile menu button */}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {activeMenu === "dashboard"
                      ? "Dashboard"
                      : activeMenu === "papers"
                      ? "E-Papers"
                      : activeMenu === "categories"
                      ? "Categories"
                      : activeMenu === "subcategories"
                      ? "Sub Categories"
                      : activeMenu === "pages"
                      ? "Pages"
                      : activeMenu === "customization"
                      ? "Customization"
                      : activeMenu === "ads"
                      ? "Ads Management"
                      : "Profile"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {clientData?.clientName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isExpired(clientData?.expiryDate)
                      ? "bg-red-100 text-red-700"
                      : getDaysRemaining(clientData?.expiryDate) <= 7
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isExpired(clientData?.expiryDate)
                    ? "Expired"
                    : `${getDaysRemaining(clientData?.expiryDate)} days left`}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route index element={renderDashboardContent()} />
            <Route path="papers/*" element={
              <Routes>
                <Route index element={renderPapersContent()} />
                <Route path="*" element={<Navigate to="/admin/papers" replace />} />
              </Routes>
            } />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategories />} />
            <Route path="pages" element={<Pages />} />
            <Route path="customization/*" element={<Customization />} />
            <Route path="ads" element={<AdsManagement />} />
            <Route path="packages" element={<Packages clientData={clientData} />} />
            <Route path="profile" element={<Profile clientData={clientData} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
