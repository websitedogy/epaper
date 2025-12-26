import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const MultiBannerSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localBanners, setLocalBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    imageUrl: "",
    redirectUrl: "",
    isActive: false,
    title: ""
  });
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  // Initialize with existing banners
  useEffect(() => {
    if (customization?.promotionalBanners && customization.promotionalBanners.length > 0) {
      // Filter out any banners with blob URLs as they're temporary
      const filteredBanners = customization.promotionalBanners.map(banner => {
        // If the imageUrl is a blob URL, reset it to empty string
        if (banner.imageUrl && banner.imageUrl.startsWith('blob:')) {
          return { ...banner, imageUrl: "" };
        }
        return banner;
      });
      setLocalBanners(filteredBanners);
    } else {
      // Start with empty array - no default banners
      setLocalBanners([]);
    }
  }, [customization]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // Store file for upload
    setBannerForm({ ...bannerForm, imageUrl: file });
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setBannerForm({ ...bannerForm, imageUrl: "" });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormChange = (field, value) => {
    setBannerForm({ ...bannerForm, [field]: value });
  };

  const handleSaveBanner = () => {
    // Validate required fields
    if (!bannerForm.imageUrl && !editingBanner?.imageUrl) {
      alert("Please upload an image for the banner.");
      return;
    }

    // Title and URL are now optional, so we don't need to validate them

    // Create or update banner
    if (editingBanner) {
      // Update existing banner
      setLocalBanners(localBanners.map(banner => 
        banner.id === editingBanner.id ? { 
          ...banner, 
          title: bannerForm.title,
          redirectUrl: bannerForm.redirectUrl,
          isActive: bannerForm.isActive,
          // Keep file object or existing URL
          imageUrl: bannerForm.imageUrl || banner.imageUrl
        } : banner
      ));
    } else {
      // Add new banner - no limit
      const newBanner = {
        id: `banner-${Date.now()}`, // Use timestamp for unique ID
        title: bannerForm.title,
        redirectUrl: bannerForm.redirectUrl,
        isActive: bannerForm.isActive,
        // Store the file object temporarily
        imageUrl: bannerForm.imageUrl
      };
      setLocalBanners([...localBanners, newBanner]);
    }

    // Reset form and close modal
    resetForm();
  };

  const resetForm = () => {
    setBannerForm({
      imageUrl: "",
      redirectUrl: "",
      isActive: false,
      title: ""
    });
    setPreviewImage("");
    setEditingBanner(null);
    setShowModal(false);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    
    // Set form values
    setBannerForm({
      imageUrl: banner.imageUrl || "",
      redirectUrl: banner.redirectUrl || "",
      isActive: banner.isActive || false,
      title: banner.title || ""
    });
    
    // Set preview image - handle both File objects and URLs
    if (banner.imageUrl) {
      if (typeof banner.imageUrl === 'string' && !banner.imageUrl.startsWith('blob:')) {
        setPreviewImage(banner.imageUrl);
      } else if (banner.imageUrl instanceof File) {
        setPreviewImage(URL.createObjectURL(banner.imageUrl));
      } else {
        setPreviewImage("");
      }
    } else {
      setPreviewImage("");
    }
    
    setShowModal(true);
  };

  const handleDeleteBanner = (bannerId) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setLocalBanners(localBanners.filter(banner => banner.id !== bannerId));
    }
  };

  const handleSaveAll = () => {
    // Prepare banner data - replace File objects with empty strings for JSON
    const bannersForJSON = localBanners.map(banner => ({
      id: banner.id,
      title: banner.title || "",
      redirectUrl: banner.redirectUrl || "",
      isActive: banner.isActive || false,
      // If imageUrl is a File object, set to empty string (will be filled by backend)
      // If it's a URL string, keep it
      imageUrl: (banner.imageUrl instanceof File) ? "" : (banner.imageUrl || "")
    }));
    
    // Pass the data to the parent component for handling
    const updatedCustomization = {
      ...customization,
      promotionalBanners: bannersForJSON
    };
    
    // Collect File objects from banners
    const bannerFiles = localBanners
      .map((banner, index) => ({ banner, index }))
      .filter(({ banner }) => banner.imageUrl instanceof File)
      .map(({ banner, index }) => ({ index, file: banner.imageUrl }));

    if (bannerFiles.length > 0) {
      updatedCustomization._bannerFiles = bannerFiles;
    }

    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/admin/customization" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Customization
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Multi-Banner Settings</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Multi-Banner Settings
        </h2>
        <p className="text-gray-600 mt-1">Manage multiple promotional banners (unlimited)</p>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {localBanners.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">No banners added yet</p>
            <p className="text-gray-500">Click "Add Banner" to create your first promotional banner.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {localBanners.map((banner, index) => {
                // Get image source - handle both File objects and URLs
                let imageSrc = "";
                if (banner.imageUrl) {
                  if (typeof banner.imageUrl === 'string' && !banner.imageUrl.startsWith('blob:')) {
                    imageSrc = banner.imageUrl;
                  } else if (banner.imageUrl instanceof File) {
                    imageSrc = URL.createObjectURL(banner.imageUrl);
                  }
                }
                
                return (
                <tr key={banner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {imageSrc ? (
                        <img 
                          src={imageSrc} 
                          alt={banner.title} 
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Banner {index + 1}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{banner.title || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {banner.redirectUrl || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Add Banner Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
        >
          Add Banner
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save All Banners"}
        </button>
      </div>

      {/* Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingBanner ? "Edit Banner" : "Add Banner"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <div className="flex gap-4">
                    {previewImage && !previewImage.startsWith('blob:') ? (
                      <div className="flex-shrink-0">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-32 w-32 object-cover border rounded"
                        />
                      </div>
                    ) : previewImage ? (
                      <div className="flex-shrink-0">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-32 w-32 object-cover border rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 h-32 w-32 bg-gray-200 rounded flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload promotional banner image
                      </p>
                      {previewImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="mt-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter banner title"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Redirect URL
                  </label>
                  <input
                    type="url"
                    value={bannerForm.redirectUrl}
                    onChange={(e) => handleFormChange("redirectUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://example.com/promotion"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="banner-active"
                    checked={bannerForm.isActive}
                    onChange={(e) => handleFormChange("isActive", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="banner-active" className="ml-2 text-sm font-medium text-gray-700">
                    Activate Banner
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingBanner ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiBannerSettings;