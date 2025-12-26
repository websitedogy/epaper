import { useState, useEffect } from "react";
import { referralAPI, authAPI } from "../services/api";

const ReferralSubmission = ({ clientId, clientData: propClientData, onReferralSubmitted, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    pincode: "",
    village: "",
    district: "",
    state: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [clientData, setClientData] = useState(propClientData || null);

  // Fetch referrals when component mounts and when clientId changes
  useEffect(() => {
    if (clientId) {
      fetchReferrals();
    }
  }, [clientId]);

  const fetchReferrals = async () => {
    if (!clientId) return;
    
    setLoadingReferrals(true);
    try {
      console.log("Fetching referrals for client ID:", clientId);
      const response = await referralAPI.getReferralsByClientId(clientId);
      console.log("Referrals response:", response);
      
      if (response && response.data) {
        setReferrals(response.data);
      }
      
      // Also fetch updated client data to show current earnings
      try {
        const clientResponse = await authAPI.getProfile();
        if (clientResponse && clientResponse.data) {
          setClientData(clientResponse.data);
        }
      } catch (clientErr) {
        console.error("Error fetching client data:", clientErr);
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log("Form submission started with clientId:", clientId);
      
      // Validate form data (but don't block if clientId is missing)
      const requiredFields = ["name", "phone", "email", "street", "pincode", "village", "district", "state"];
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === "") {
          throw new Error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate phone format (basic validation)
      if (formData.phone.length < 10) {
        throw new Error("Please enter a valid phone number");
      }

      // Validate pincode (basic validation)
      if (formData.pincode.length < 6) {
        throw new Error("Please enter a valid pincode");
      }

      // Prepare referral data (include clientId if available)
      const referralData = {
        referringClientId: clientId || 'unknown',
        referredClientDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: {
            street: formData.street,
            pincode: formData.pincode,
            village: formData.village,
            district: formData.district,
            state: formData.state
          }
        }
      };

      console.log("Submitting referral data:", referralData);

      // Submit referral using the API service
      const response = await referralAPI.submitReferral(referralData);

      console.log("Referral submission response:", response);

      if (response && response.success) {
        setMessage("Referral submitted successfully! Our team will review it shortly.");
        setFormData({
          name: "",
          phone: "",
          email: "",
          street: "",
          pincode: "",
          village: "",
          district: "",
          state: ""
        });

        // Refresh referrals list
        await fetchReferrals();
        
        // Notify parent component
        if (onReferralSubmitted) {
          onReferralSubmitted();
        }
      } else {
        throw new Error(response.message || "Failed to submit referral. Please try again.");
      }
    } catch (err) {
      console.error("Referral submission error:", err);
      setError(err.message || "An error occurred while submitting the referral. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Submit Referral</h2>
        <div className="text-sm text-gray-500">
          Client ID: {clientId || 'Not available'}
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Info about referral earnings */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Referral earnings are cumulative. Each approved referral adds to your total earnings. 
              The amount shown in the Referrals Earnings box on your dashboard represents your total accumulated earnings from all approved referrals.
            </p>
          </div>
        </div>
      </div>
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
          <p className="text-green-700">{message}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referred Client Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter phone number"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter pincode"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter street address"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Village *
            </label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter village"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District *
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter district"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter state"
              required
            />
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit Referral"}
          </button>
        </div>
      </form>
      
      {/* Referrals Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Submitted Referrals</h3>
          {clientData && (
            <div className="text-sm text-gray-600">
              Total Earnings: <span className="font-semibold">₹{clientData.referralEarnings || 0}</span>
            </div>
          )}
        </div>
        
        {loadingReferrals ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading referrals...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals submitted</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by submitting a new referral.</p>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Phone
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {referrals.map((referral) => (
                  <tr key={referral._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {referral.referredClientDetails?.name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {referral.referredClientDetails?.email || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {referral.referredClientDetails?.phone || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${{
                        pending: 'bg-yellow-100 text-yellow-800',
                        approved: 'bg-green-100 text-green-800',
                        rejected: 'bg-red-100 text-red-800'
                      }[referral.status] || 'bg-gray-100 text-gray-800'}`}>
                        {referral.status?.charAt(0).toUpperCase() + referral.status?.slice(1) || 'Pending'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ₹{referral.referralAmount || 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {referral.createdAt ? new Date(referral.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSubmission;