import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const PromotionalBannerSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    imageUrl: "",
    redirectUrl: "",
    isActive: false
  });
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  // Initialize with existing banners
  useEffect(() => {
    if (customization?.promotionalBanners && customization.promotionalBanners.length > 0) {
      const filteredBanners = customization.promotionalBanners.map(banner => {
        if (banner.imageUrl && banner.imageUrl.startsWith('blob:')) {
          return { ...banner, imageUrl: "" };
        }
        return banner;
      });
      setBanners(filteredBanners);
    } else {
      setBanners([]);
    }
  }, [customization]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);

    setBannerForm({ ...bannerForm, imageUrl: file });
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setBannerForm({ ...bannerForm, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormChange = (field, value) => {
    setBannerForm({ ...bannerForm, [field]: value });
  };

  const handleAddBanner = () => {
    if (!bannerForm.imageUrl) {
      alert("Please upload a banner image.");
      return;
    }

    const newBanner = {
      id: `banner-${Date.now()}`,
      title: bannerForm.title,
      redirectUrl: bannerForm.redirectUrl,
      isActive: bannerForm.isActive,
      imageUrl: bannerForm.imageUrl
    };

    setBanners([...banners, newBanner]);

    // Reset form
    setBannerForm({
      title: "",
      imageUrl: "",
      redirectUrl: "",
      isActive: false
    });
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteBanner = (bannerId) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setBanners(banners.filter(banner => banner.id !== bannerId));
    }
  };

  const handleSaveAll = () => {
    const bannersForJSON = banners.map(banner => ({
      id: banner.id,
      title: banner.title || "",
      redirectUrl: banner.redirectUrl || "",
      isActive: banner.isActive || false,
      imageUrl: (banner.imageUrl instanceof File) ? "" : (banner.imageUrl || "")
    }));

    const updatedCustomization = {
      ...customization,
      promotionalBanners: bannersForJSON
    };

    const bannerFiles = banners
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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Promotional Banner Settings</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Promotional Banner Settings</h2>
        <p className="text-gray-600 mt-1">Add and manage promotional banners (unlimited)</p>
      </div>

      {/* Add Banner Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Banner</h3>
        
        <div className="space-y-4">
          {/* Banner Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Title
            </label>
            <input
              type="text"
              value={bannerForm.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter banner title (optional)"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {previewImage ? (
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

          {/* URL Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Link
            </label>
            <input
              type="url"
              value={bannerForm.redirectUrl}
              onChange={(e) => handleFormChange("redirectUrl", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com (optional)"
            />
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="banner-active"
              checked={bannerForm.isActive}
              onChange={(e) => handleFormChange("isActive", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="banner-active" className="ml-2 text-sm font-medium text-gray-700">
              Active Banner
            </label>
          </div>

          {/* Add Banner Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddBanner}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Add Banner
            </button>
          </div>
        </div>
      </div>

      {/* Banner History Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Banner History</h3>
          <p className="text-sm text-gray-500 mt-1">All added banners ({banners.length})</p>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">No banners added yet</p>
            <p className="text-gray-500">Add your first banner using the form above.</p>
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
                {banners.map((banner, index) => {
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {banner.redirectUrl || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save All Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save All Banners"}
        </button>
      </div>
    </div>
  );
};

export default PromotionalBannerSettings;
