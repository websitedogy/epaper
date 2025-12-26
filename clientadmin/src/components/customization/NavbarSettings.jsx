import { useState, useEffect } from "react";
import { epaperAPI } from "../../services/api";
import { Link } from "react-router-dom";
import { useCustomization } from "../../contexts/CustomizationContext";

const NavbarSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);
  const { updateCustomization: updateContextCustomization } = useCustomization();

  useEffect(() => {
    // When customization prop changes, update local state
    // But preserve existing menu visibility settings to prevent checkbox resets
    if (customization && customization.navbar) {
      setLocalCustomization(prev => {
        // Get the previous menu visibility settings
        const prevMenuVisibility = prev?.navbar?.menuVisibility || {};
        // Get the new menu visibility settings from props
        const newMenuVisibility = customization.navbar.menuVisibility || {};
        
        // Merge: keep previous selections, but add any new pages that might have been added
        const mergedMenuVisibility = {
          ...prevMenuVisibility,  // Preserve all previous selections
          ...newMenuVisibility,   // Add any new pages (but won't override existing selections)
        };
        
        return {
          ...customization,
          navbar: {
            ...customization.navbar,
            menuVisibility: mergedMenuVisibility
          }
        };
      });
    }
  }, [customization]);

  const handleLogoUpload = async (e) => {
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
      const logoPreviewDesktop = document.getElementById("navbar-logo-preview-desktop");
      const logoPreviewMobile = document.getElementById("navbar-logo-preview-mobile");
      if (logoPreviewDesktop) {
        logoPreviewDesktop.src = previewUrl;
      }
      if (logoPreviewMobile) {
        logoPreviewMobile.src = previewUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLocalCustomization({
      ...localCustomization,
      navbar: { ...localCustomization.navbar, logoUrl: "" },
    });
    // Clear preview
    const logoPreviewDesktop = document.getElementById("navbar-logo-preview-desktop");
    const logoPreviewMobile = document.getElementById("navbar-logo-preview-mobile");
    if (logoPreviewDesktop) {
      logoPreviewDesktop.src = null;
    }
    if (logoPreviewMobile) {
      logoPreviewMobile.src = null;
    }
  };

  const handleChange = (field, value) => {
    // Special handling for logoSizePx to ensure minimum visible size
    if (field === "logoSizePx") {
      // Ensure the value is at least 90px for visibility (matches our new requirement)
      value = Math.max(90, value);
    }
    
    setLocalCustomization({
      ...localCustomization,
      navbar: {
        ...localCustomization.navbar,
        [field]: value,
      },
    });
  };

  const handleMenuVisibilityChange = (key, value) => {
    setLocalCustomization({
      ...localCustomization,
      navbar: {
        ...localCustomization.navbar,
        menuVisibility: {
          ...localCustomization.navbar.menuVisibility,
          [key]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    // Update both the parent component and the context
    setCustomization(localCustomization);
    await onSave(localCustomization);
    
    // Also update the context so other components can see the changes
    updateContextCustomization(localCustomization);
  };

  // Get active pages for menu visibility
  const activePages = (localCustomization.pages || []).filter(page => page.isActive);

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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Navbar Settings</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Navbar Settings
        </h2>
        <p className="text-gray-600 mt-1">Customize your website navbar</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo
            </label>
            {/* Responsive layout for logo controls */}
            <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto,auto] gap-4 items-center">
              <div className="flex-shrink-0">
                {/* Desktop preview */}
                <img
                  id="navbar-logo-preview-desktop"
                  src={localCustomization.navbar.logoUrl || null}
                  alt="Navbar Logo Desktop"
                  className="object-contain border rounded hidden sm:block"
                  style={{
                    maxHeight: '120px',
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
                {/* Mobile preview - slightly smaller */}
                <img
                  id="navbar-logo-preview-mobile"
                  src={localCustomization.navbar.logoUrl || null}
                  alt="Navbar Logo Mobile"
                  className="object-contain border rounded sm:hidden"
                  style={{
                    maxHeight: '90px',
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  data-section="navbar"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload logo image (any size accepted)
                </p>
                {localCustomization.navbar.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-2 text-xs text-red-600 hover:text-red-800"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Logo Position
                </label>
                <select
                  value={localCustomization.navbar.logoPosition || "Left"}
                  onChange={(e) => handleChange("logoPosition", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Logo Size (px)
                </label>
                <input
                  type="number"
                  min="90"
                  max="200"
                  placeholder="e.g. 120"
                  value={localCustomization.navbar.logoSizePx || ""}
                  onChange={(e) => handleChange("logoSizePx", parseInt(e.target.value) || 120)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text Color (Hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localCustomization.navbar.textColor || "#000000"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={localCustomization.navbar.textColor || "#000000"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Background Color (Hex)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localCustomization.navbar.backgroundColor}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={localCustomization.navbar.backgroundColor}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Menu Visibility
            </label>
            <div className="space-y-4">
              {/* Default Pages Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Default Pages
                </h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localCustomization.navbar.menuVisibility?.home ?? true}
                    onChange={(e) => handleMenuVisibilityChange("home", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Home
                  </span>
                </label>
              </div>

              {/* Custom Pages Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Custom Pages
                  </h4>
                  <Link to="/admin/pages" className="text-xs text-indigo-600 hover:text-indigo-800">
                    Manage Pages
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Select which custom pages should appear in the navbar menu
                </p>
                
                {activePages.length > 0 ? (
                  <div className="space-y-2">
                    {activePages.map((page) => (
                      <div key={page._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={localCustomization.navbar.menuVisibility?.[page.slug] ?? false}
                            onChange={(e) => handleMenuVisibilityChange(page.slug, e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {page.title}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          /{page.slug}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      No custom pages available
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Create pages in the <Link to="/admin/pages" className="text-indigo-600 hover:text-indigo-800">Pages section</Link> to add them to the navbar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Navbar Settings"}
        </button>
      </div>
    </div>
  );
};

export default NavbarSettings;