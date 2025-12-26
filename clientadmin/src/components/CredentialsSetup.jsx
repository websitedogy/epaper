import { useState } from "react";
import { authAPI, saveCredentials } from "../services/api";

const CredentialsSetup = ({ onSuccess, errorMessage }) => {
  const [formData, setFormData] = useState({
    apiKey: "",
    apiPasscode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.apiKey.trim() || !formData.apiPasscode.trim()) {
      setError("Please enter both API Key and Passcode");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.verify(
        formData.apiKey,
        formData.apiPasscode
      );

      // Save credentials
      saveCredentials(formData.apiKey, formData.apiPasscode);
      localStorage.setItem("clientData", JSON.stringify(response.data));

      console.log("✓ Credentials saved successfully to localStorage");
      onSuccess(response.data);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-white"
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
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setup Required
          </h1>
          <p className="text-gray-600">
            Enter your API credentials to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || errorMessage) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-800">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
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
                <p className="text-sm font-semibold">Verification Failed</p>
                <p className="text-sm mt-1">{error || errorMessage}</p>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Enter your API Key"
            />
          </div>

          <div>
            <label
              htmlFor="apiPasscode"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              API Passcode
            </label>
            <input
              type="text"
              id="apiPasscode"
              name="apiPasscode"
              value={formData.apiPasscode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              placeholder="Enter your API Passcode"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Don't have credentials? Contact your administrator.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              💡 Tip: Save credentials permanently
            </p>
            <p className="text-xs text-blue-700">
              Add to{" "}
              <code className="bg-blue-100 px-1 rounded">.env.local</code> file:
            </p>
            <pre className="text-xs text-blue-800 mt-2 font-mono">
              VITE_CLIENT_API_KEY=your_key
              VITE_CLIENT_API_PASSCODE=your_passcode
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsSetup;
