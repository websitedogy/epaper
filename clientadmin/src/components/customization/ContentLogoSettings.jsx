import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ContentLogoSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localSettings, setLocalSettings] = useState({
    contentText: "",
    textColor: "#000000",
    textSize: 16,
    textStyle: "normal",
    fontFamily: "Poppins",
    logoUrl: "",
    logoSize: 100,
    logoBorderRadius: 0,
    logoSpacing: 10,
    ...customization?.contentLogoSettings
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Only auto-save if there are actual changes
    if (JSON.stringify(localSettings) !== JSON.stringify(customization?.contentLogoSettings || {})) {
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localSettings]);

  const handleAutoSave = () => {
    const updatedCustomization = {
      ...customization,
      contentLogoSettings: localSettings
    };
    
    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
    setIsSaving(false);
    setIsSaved(true);
    
    // Hide saved indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    const updatedCustomization = {
      ...customization,
      contentLogoSettings: localSettings
    };
    
    setCustomization(updatedCustomization);
    onSave(updatedCustomization);
    setIsSaved(true);
    
    // Hide saved indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleTextChange = (e) => {
    setLocalSettings(prev => ({
      ...prev,
      contentText: e.target.value
    }));
  };

  const handleSettingChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target.result;
      setLocalSettings(prev => ({
        ...prev,
        logoUrl: previewUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLocalSettings(prev => ({
      ...prev,
      logoUrl: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Font family options
  const fontFamilies = [
    { value: "Poppins", label: "Poppins" },
    { value: "Roboto", label: "Roboto" },
    { value: "Inter", label: "Inter" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Lato", label: "Lato" }
  ];

  // Text style options
  const textStyles = [
    { value: "normal", label: "Normal" },
    { value: "bold", label: "Bold" },
    { value: "italic", label: "Italic" },
    { value: "medium", label: "Medium" },
    { value: "semibold", label: "Semibold" }
  ];

  // Get font weight based on text style
  const getFontWeight = (style) => {
    switch (style) {
      case "bold": return "700";
      case "medium": return "500";
      case "semibold": return "600";
      case "normal":
      default: return "400";
    }
  };

  // Get font style based on text style
  const getFontStyle = (style) => {
    return style === "italic" ? "italic" : "normal";
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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Content & Logo</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Content & Logo Customization
        </h2>
        <p className="text-gray-600 mt-1">Customize your content text and logo appearance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Content Text Area */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Text</h3>
            
            <div className="relative">
              <textarea
                value={localSettings.contentText}
                onChange={handleTextChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
                placeholder="Enter your content text here..."
              />
              
              {/* Saved Indicator */}
              <div className="absolute top-3 right-3 flex items-center">
                {isSaving && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                )}
                {isSaved && (
                  <span className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Saved
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Text Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localSettings.textColor}
                    onChange={(e) => handleSettingChange("textColor", e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localSettings.textColor}
                    onChange={(e) => handleSettingChange("textColor", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Size: {localSettings.textSize}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={localSettings.textSize}
                    onChange={(e) => handleSettingChange("textSize", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="10"
                    max="40"
                    value={localSettings.textSize}
                    onChange={(e) => handleSettingChange("textSize", parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Style
                </label>
                <select
                  value={localSettings.textStyle}
                  onChange={(e) => handleSettingChange("textStyle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {textStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={localSettings.fontFamily}
                  onChange={(e) => handleSettingChange("fontFamily", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {fontFamilies.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Logo Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo Upload
                </label>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {localSettings.logoUrl ? (
                      <img
                        src={localSettings.logoUrl}
                        alt="Logo Preview"
                        className="h-16 w-16 object-contain border rounded"
                        style={{
                          borderRadius: `${localSettings.logoBorderRadius}px`
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 border-2 border-dashed rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2 mt-2">
                      {localSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo Size: {localSettings.logoSize}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={localSettings.logoSize}
                    onChange={(e) => handleSettingChange("logoSize", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="50"
                    max="300"
                    value={localSettings.logoSize}
                    onChange={(e) => handleSettingChange("logoSize", parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo Border Radius: {localSettings.logoBorderRadius}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={localSettings.logoBorderRadius}
                    onChange={(e) => handleSettingChange("logoBorderRadius", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={localSettings.logoBorderRadius}
                    onChange={(e) => handleSettingChange("logoBorderRadius", parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo Spacing: {localSettings.logoSpacing}px
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSettings.logoSpacing}
                    onChange={(e) => handleSettingChange("logoSpacing", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.logoSpacing}
                    onChange={(e) => handleSettingChange("logoSpacing", parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleManualSave}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[400px] flex flex-col items-center justify-center">
            <div 
              className="text-center max-w-full"
              style={{
                fontFamily: localSettings.fontFamily,
                color: localSettings.textColor,
                fontSize: `${localSettings.textSize}px`,
                fontWeight: getFontWeight(localSettings.textStyle),
                fontStyle: getFontStyle(localSettings.textStyle)
              }}
            >
              {localSettings.logoUrl && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={localSettings.logoUrl}
                    alt="Logo Preview"
                    className="object-contain"
                    style={{
                      width: `${localSettings.logoSize}px`,
                      height: `${localSettings.logoSize}px`,
                      borderRadius: `${localSettings.logoBorderRadius}px`
                    }}
                  />
                </div>
              )}
              
              {localSettings.contentText ? (
                <div 
                  className="whitespace-pre-wrap"
                  style={{
                    marginTop: localSettings.logoUrl ? `${localSettings.logoSpacing}px` : '0'
                  }}
                >
                  {localSettings.contentText}
                </div>
              ) : (
                <div className="text-gray-400 italic">
                  Your content will appear here...
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>This is a live preview of your content and logo settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentLogoSettings;