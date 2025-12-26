import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ClipSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);

  useEffect(() => {
    // Preserve existing clip settings while updating from props
    setLocalCustomization(prev => ({
      ...customization,
      clip: {
        ...customization.clip,
        ...prev.clip, // Preserve any local changes to clip settings
        topClip: {
          ...customization.clip?.topClip,
          ...prev.clip?.topClip,
        },
        footerClip: {
          ...customization.clip?.footerClip,
          ...prev.clip?.footerClip,
        },
        displayOptions: {
          ...customization.clip?.displayOptions,
          ...prev.clip?.displayOptions,
        }
      }
    }));
  }, [customization]);

  const handleTopLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    // Just show preview, don't update state yet
    // The actual upload happens when saving the form
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target.result;
      // Update the preview only, not the actual customization state
      const logoPreview = document.getElementById("top-clip-logo-preview");
      if (logoPreview) {
        logoPreview.src = previewUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFooterLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    // The actual upload happens when saving the form
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target.result;
      // Update the preview only, not the actual customization state
      const logoPreview = document.getElementById("footer-clip-logo-preview");
      if (logoPreview) {
        logoPreview.src = previewUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTopLogo = () => {
    setLocalCustomization({
      ...localCustomization,
      clip: { ...localCustomization.clip, topLogoUrl: "" },
    });
    // Clear preview
    const logoPreview = document.getElementById("top-clip-logo-preview");
    if (logoPreview) {
      logoPreview.src = "";
    }
  };

  const handleRemoveFooterLogo = () => {
    setLocalCustomization({
      ...localCustomization,
      clip: { ...localCustomization.clip, footerLogoUrl: "" },
    });
    // Clear preview
    const logoPreview = document.getElementById("footer-clip-logo-preview");
    if (logoPreview) {
      logoPreview.src = "";
    }
  };

  const handleChange = (section, field, value) => {
    setLocalCustomization({
      ...localCustomization,
      clip: {
        ...localCustomization.clip,
        [section]: {
          ...localCustomization.clip[section],
          [field]: value,
        },
      },
    });
  };

  const handleDisplayOptionChange = (field, value) => {
    setLocalCustomization({
      ...localCustomization,
      clip: {
        ...localCustomization.clip,
        displayOptions: {
          ...localCustomization.clip.displayOptions,
          [field]: value,
        },
      },
    });
  };

  const handleSaveTopClip = () => {
    // Ensure all clip settings are preserved when saving top clip
    const updatedCustomization = {
      ...localCustomization,
      clip: {
        ...localCustomization.clip,
        topClip: {
          ...localCustomization.clip?.topClip,
          position: localCustomization.clip?.topClip?.position || "Left",
          logoHeight: localCustomization.clip?.topClip?.logoHeight || 50,
          backgroundColor: localCustomization.clip?.topClip?.backgroundColor || "#ffffff",
        },
      },
    };
    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
  };

  const handleSaveFooterClip = () => {
    // Ensure all clip settings are preserved when saving footer clip
    const updatedCustomization = {
      ...localCustomization,
      clip: {
        ...localCustomization.clip,
        footerClip: {
          ...localCustomization.clip?.footerClip,
          position: localCustomization.clip?.footerClip?.position || "Left",
          logoHeight: localCustomization.clip?.footerClip?.logoHeight || 50,
          backgroundColor: localCustomization.clip?.footerClip?.backgroundColor || "#ffffff",
        },
      },
    };
    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
  };

  const handleSaveDisplayOptions = () => {
    // Ensure all clip settings are preserved when saving display options
    const updatedCustomization = {
      ...localCustomization,
      clip: {
        ...localCustomization.clip,
        displayOptions: {
          ...localCustomization.clip?.displayOptions,
          showDate: localCustomization.clip?.displayOptions?.showDate ?? true,
          showPageNumber: localCustomization.clip?.displayOptions?.showPageNumber ?? true,
        },
      },
    };
    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
  };

  // Initialize default values if they don't exist
  useEffect(() => {
    let hasChanges = false;
    const updatedCustomization = { ...localCustomization };

    if (!updatedCustomization.clip) {
      updatedCustomization.clip = {};
      hasChanges = true;
    }

    if (!updatedCustomization.clip.topClip) {
      updatedCustomization.clip.topClip = {
        position: "Left",
        backgroundColor: "#ffffff",
        logoHeight: 50,
      };
      hasChanges = true;
    }
    
    if (!updatedCustomization.clip.footerClip) {
      updatedCustomization.clip.footerClip = {
        position: "Left",
        backgroundColor: "#ffffff",
        logoHeight: 50,
      };
      hasChanges = true;
    }
    
    if (!updatedCustomization.clip.displayOptions) {
      updatedCustomization.clip.displayOptions = {
        showDate: true,
        showPageNumber: true,
      };
      hasChanges = true;
    }

    if (hasChanges) {
      setLocalCustomization(updatedCustomization);
    }
  }, []); // Only run once when component mounts

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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Clip Settings</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Clip Settings
        </h2>
        <p className="text-gray-600 mt-1">Customize clipping functionality</p>
      </div>

      {/* Section 1: Top Clip Logo Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clip Logo Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Top Logo
            </label>
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <img
                  id="top-clip-logo-preview"
                  src={localCustomization.clip?.topLogoUrl}
                  alt="Top Clip Logo"
                  className="h-16 w-16 object-contain border rounded"
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTopLogoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  data-section="top-clip-logo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload top clip logo image
                </p>
                {localCustomization.clip?.topLogoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveTopLogo}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo Position
              </label>
              <select
                value={localCustomization.clip?.topClip?.position || "Left"}
                onChange={(e) => handleChange("topClip", "position", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Left">Left</option>
                <option value="Center">Center</option>
                <option value="Right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo Height (px)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={localCustomization.clip?.topClip?.logoHeight || 50}
                onChange={(e) => handleChange("topClip", "logoHeight", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

<div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Top Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localCustomization.clip?.topClip?.backgroundColor || "#ffffff"}
                  onChange={(e) => handleChange("topClip", "backgroundColor", e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={localCustomization.clip?.topClip?.backgroundColor || "#ffffff"}
                  onChange={(e) => handleChange("topClip", "backgroundColor", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

          <div className="pt-4">
            <button
              onClick={handleSaveTopClip}
              disabled={loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Top Clip"}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Footer Clip Logo Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer Clip Logo Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Footer Logo
            </label>
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <img
                  id="footer-clip-logo-preview"
                  src={localCustomization.clip?.footerLogoUrl}
                  alt="Footer Clip Logo"
                  className="h-16 w-16 object-contain border rounded"
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFooterLogoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  data-section="footer-clip-logo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload footer clip logo image
                </p>
                {localCustomization.clip?.footerLogoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveFooterLogo}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo Position
              </label>
              <select
                value={localCustomization.clip?.footerClip?.position || "Left"}
                onChange={(e) => handleChange("footerClip", "position", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Left">Left</option>
                <option value="Center">Center</option>
                <option value="Right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Logo Height (px)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={localCustomization.clip?.footerClip?.logoHeight || 50}
                onChange={(e) => handleChange("footerClip", "logoHeight", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Footer Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localCustomization.clip?.footerClip?.backgroundColor || "#ffffff"}
                  onChange={(e) => handleChange("footerClip", "backgroundColor", e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={localCustomization.clip?.footerClip?.backgroundColor || "#ffffff"}
                  onChange={(e) => handleChange("footerClip", "backgroundColor", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

          <div className="pt-4">
            <button
              onClick={handleSaveFooterClip}
              disabled={loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Footer Clip"}
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Display Options */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Show Date on Clip
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Display the date on clipped images
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localCustomization.clip?.displayOptions?.showDate ?? true}
                onChange={(e) => handleDisplayOptionChange("showDate", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Show Page Number
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Display the page number on clipped images
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localCustomization.clip?.displayOptions?.showPageNumber ?? true}
                onChange={(e) => handleDisplayOptionChange("showPageNumber", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveDisplayOptions}
              disabled={loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Display Options"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipSettings;