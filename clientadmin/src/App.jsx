import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ClientInfo from "./components/ClientInfo";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PublicLayout from "./components/PublicLayout";
import HomePage from "./components/HomePage";
import AboutUsPage from "./components/AboutUsPage";
import ContactUsPage from "./components/ContactUsPage";
import CustomPage from "./components/CustomPage";
import PapersDisplay from "./components/PapersDisplay";
import EpaperViewer from "./components/EpaperViewer";
import Packages from "./components/Packages";
import { getStoredCredentials, authAPI } from "./services/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import ClipPreviewPage from "./components/ClipPreviewPage";
import { CustomizationProvider } from "./contexts/CustomizationContext";
import DebugSocialMediaData from "./components/DebugSocialMediaData";
import TestSocialMediaRender from "./components/TestSocialMediaRender";
import TestSocialMediaData from "./components/TestSocialMediaData";
import DebugSocialMedia from "./components/DebugSocialMedia";
import TestFontAwesome from "./components/TestFontAwesome";
import DebugCustomizationData from "./components/DebugCustomizationData";
function App() {
  const [credentialsValid, setCredentialsValid] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // CRITICAL: Verify API credentials BEFORE anything else
    const verifyAppCredentials = async () => {
      setLoading(true);
      const { apiKey, apiPasscode } = getStoredCredentials();

      // Check if credentials exist in .env
      if (!apiKey || !apiPasscode) {
        console.error("❌ No API credentials found in .env file");
        setError(
          "API credentials not found. Please add VITE_CLIENT_API_KEY and VITE_CLIENT_API_PASSCODE to your .env file."
        );
        setCredentialsValid(false);
        setLoading(false);
        return;
      }

      // Verify with backend
      try {
        console.log("🔐 Verifying API credentials with backend...");
        const response = await authAPI.verify(apiKey, apiPasscode);

        if (response.success) {
          console.log("✅ API credentials VALID - App authorized to run");
          setCredentialsValid(true);
          setClientData(response.data);
          setError("");

          // Check if admin was previously logged in
          const isAdminAuth =
            localStorage.getItem("isClientLoggedIn") === "true";
          if (isAdminAuth) {
            setIsAdminLoggedIn(true);
          }
        } else {
          console.error("❌ API credentials INVALID");
          setError("Invalid API credentials. Please check your .env file.");
          setCredentialsValid(false);
        }
      } catch (err) {
        console.error("❌ Verification failed:", err);
        setError(
          err.message ||
            "Failed to verify API credentials. Please check your .env file."
        );
        setCredentialsValid(false);
      }

      setLoading(false);
    };

    verifyAppCredentials();
  }, []);

  const handleAdminLogin = (data) => {
    setClientData(data);
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("isClientLoggedIn");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg">
            Verifying API Credentials...
          </p>
          <p className="text-indigo-200 text-sm mt-2">
            Checking .env file with backend
          </p>
        </div>
      </div>
    );
  }

  // CRITICAL ERROR: Invalid credentials - Block entire app
  if (!credentialsValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-pink-900 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-12 h-12 text-red-600"
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
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🚫 Invalid API Credentials
              </h1>
              <p className="text-gray-600">
                Application cannot run without valid credentials
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
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
                How to Fix:
              </h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-indigo-600 mr-2">1.</span>
                  <span>
                    Get valid API credentials from White Label Admin Panel (when
                    creating a client)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-indigo-600 mr-2">2.</span>
                  <div className="flex-1">
                    <span>
                      Add to{" "}
                      <code className="bg-gray-200 px-1 rounded font-mono">
                        .env
                      </code>{" "}
                      or{" "}
                      <code className="bg-gray-200 px-1 rounded font-mono">
                        .env.local
                      </code>{" "}
                      file:
                    </span>
                    <pre className="mt-2 bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                      VITE_CLIENT_API_KEY=ak_your_actual_key_here
                      VITE_CLIENT_API_PASSCODE=pc_your_actual_passcode_here
                    </pre>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-indigo-600 mr-2">3.</span>
                  <span>
                    Restart the development server:{" "}
                    <code className="bg-gray-200 px-1 rounded font-mono">
                      npm run dev
                    </code>
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">
                    ⚠️ No routes will work until credentials are valid
                  </p>
                  <p className="mt-1">
                    The application verifies credentials with backend on every
                    startup.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              🔄 Retry After Fixing .env File
            </button>
          </div>
        </div>
      </div>
    );
  }

  // App is authorized to run with valid credentials
  return (
    <CustomizationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/:slug" element={<CustomPage />} />
          <Route path="/epaper" element={<EpaperViewer />} />
          <Route path="/clip/:id" element={<ClipPreviewPage />} />
          <Route path="/debug-social" element={<DebugSocialMediaData />} />
          <Route path="/test-social" element={<TestSocialMediaRender />} />
          <Route path="/test-social-data" element={<TestSocialMediaData />} />
          <Route path="/debug-social-media" element={<DebugSocialMedia />} />
          <Route path="/test-fontawesome" element={<TestFontAwesome />} />
          <Route path="/debug-customization" element={<DebugCustomizationData />} />
          {/* Admin Routes: Protected with email/password login */}
          <Route
            path="/admin/*"
            element={
              isAdminLoggedIn ? (
                <Dashboard
                  clientData={clientData}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <Login onLoginSuccess={handleAdminLogin} />
              )
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </CustomizationProvider>
  );
}

export default App;