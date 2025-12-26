import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SocialMediaIconsSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);
  const [activeTab, setActiveTab] = useState("style1");

  useEffect(() => {
    if (customization) {
      // Log the incoming customization data for debugging
      console.log("Received customization data:", customization);
      
      const customizationWithDefaults = {
        ...customization,
        socialMediaStyles: customization.socialMediaStyles || {
          style1: {
            name: "Style 1",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style2: {
            name: "Style 2",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style3: {
            name: "Style 3",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style4: {
            name: "Style 4",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style5: {
            name: "Style 5",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style6: {
            name: "Style 6",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          },
          style7: {
            name: "Style 7",
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          }
        },
        selectedSocialMediaStyle: customization.selectedSocialMediaStyle || "style1"
      };
      
      console.log("Customization with defaults:", customizationWithDefaults);
      
      setLocalCustomization(customizationWithDefaults);
      setActiveTab(customizationWithDefaults.selectedSocialMediaStyle || "style1");
    }
  }, [JSON.stringify(customization)]); // Use JSON.stringify to properly detect changes in the customization object

  const handleChange = (platform, value) => {
    setLocalCustomization(prev => {
      // Ensure the activeTab style exists
      const existingStyle = prev.socialMediaStyles[activeTab] || { 
        name: styleConfigs[activeTab]?.name || activeTab,
        icons: {}
      };
      
      return {
        ...prev,
        socialMediaStyles: {
          ...prev.socialMediaStyles,
          [activeTab]: {
            ...existingStyle,
            icons: {
              ...existingStyle.icons,
              [platform]: value,
            }
          }
        }
      };
    });
  };

  const handleStyleChange = (styleKey) => {
    console.log("Switching to style:", styleKey);
    console.log("Style config exists:", !!styleConfigs[styleKey]);
    if (styleConfigs[styleKey]) {
      console.log("Platforms for this style:", styleConfigs[styleKey].platforms);
    }
    setActiveTab(styleKey);
  };

  // Simple URL validation function
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true; // Allow empty URLs
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSave = () => {
    // Validate URLs before saving
    const currentStyle = localCustomization.socialMediaStyles[activeTab] || {};
    const urls = currentStyle.icons || {};
    
    // Check if all non-empty URLs are valid
    const invalidUrls = Object.entries(urls).filter(([platform, url]) => 
      url && url.trim() !== '' && !isValidUrl(url)
    );
    
    if (invalidUrls.length > 0) {
      alert(`Please enter valid URLs for: ${invalidUrls.map(([platform]) => platform).join(', ')}`);
      return;
    }
    
    // Format data correctly for the backend
    // Add a flag to indicate this is social media icons data (no files)
    const formattedCustomization = {
      ...localCustomization,
      socialMediaStyles: localCustomization.socialMediaStyles,
      selectedSocialMediaStyle: activeTab,
      _noFiles: true // Flag to indicate no file uploads needed
    };    
    setLocalCustomization(formattedCustomization);
    setCustomization(formattedCustomization);
    onSave(formattedCustomization);
  };
  // Effect to ensure all styles are properly initialized
  useEffect(() => {
    if (localCustomization && localCustomization.socialMediaStyles) {
      const styles = localCustomization.socialMediaStyles;
      const updatedStyles = { ...styles };
      let needsUpdate = false;
      
      // Ensure all 7 styles exist
      for (let i = 1; i <= 7; i++) {
        const styleKey = `style${i}`;
        if (!styles[styleKey]) {
          updatedStyles[styleKey] = {
            name: styleConfigs[styleKey]?.name || `Style ${i}`,
            icons: {
              facebook: "",
              whatsapp: "",
              instagram: "",
              linkedin: "",
              youtube: "",
              x: "",
              telegram: ""
            }
          };
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        setLocalCustomization(prev => ({
          ...prev,
          socialMediaStyles: updatedStyles
        }));
      }
    }
  }, [localCustomization]);

  // Different icon styles with unique designs and themes
  const styleConfigs = {
    style1: {
      name: "Circle Icons",
      description: "Classic circular icons with brand colors",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#FFFFFF", bgColor: "#1877F2", shape: "circle" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#FFFFFF", bgColor: "#25D366", shape: "circle" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#FFFFFF", bgColor: "#E4405F", shape: "circle" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#FFFFFF", bgColor: "#0A66C2", shape: "circle" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FFFFFF", bgColor: "#FF0000", shape: "circle" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#FFFFFF", bgColor: "#000000", shape: "circle" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#FFFFFF", bgColor: "#0088CC", shape: "circle" }
      ]
    },
    style2: {
      name: "Square Outline",
      description: "Squared icons with outline borders",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
      ]
    },
    style3: {
      name: "Rounded Gradient",
      description: "Rounded icons with gradient backgrounds",
      platforms: [
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)", shape: "rounded" },
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #1877F2, #0C5FC4)", shape: "rounded" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #000000, #333333)", shape: "rounded" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0A66C2, #004E92)", shape: "rounded" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #FF0000, #CC0000)", shape: "rounded" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #25D366, #128C7E)", shape: "rounded" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0088CC, #006699)", shape: "rounded" }
      ]
    },
    style4: {
      name: "Flat Minimal",
      description: "Simple flat icons with subtle backgrounds",
      platforms: [
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#F0F0F0", shape: "flat" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFE5E5", shape: "flat" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FEEBEF", shape: "flat" },
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#E6F0FF", shape: "flat" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#E3EEFF", shape: "flat" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#E5F8ED", shape: "flat" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#E0F4FF", shape: "flat" }
      ]
    },
    style5: {
      name: "Shadow Effect",
      description: "Icons with drop shadows and hover effects",
      platforms: [
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 136, 204, 0.3)", shape: "shadow" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(37, 211, 102, 0.3)", shape: "shadow" },
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(24, 119, 242, 0.3)", shape: "shadow" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(228, 64, 95, 0.3)", shape: "shadow" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 0, 0, 0.3)", shape: "shadow" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(10, 102, 194, 0.3)", shape: "shadow" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(255, 0, 0, 0.3)", shape: "shadow" }
      ]
    },
    style6: {
      name: "Neon Glow",
      description: "Bright neon glowing icons with dark backgrounds",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#000000", glow: "0 0 10px #1877F2", shape: "neon" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#000000", glow: "0 0 10px #25D366", shape: "neon" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#000000", glow: "0 0 10px #E4405F", shape: "neon" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#000000", glow: "0 0 10px #0A66C2", shape: "neon" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#000000", glow: "0 0 10px #FF0000", shape: "neon" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", glow: "0 0 10px #000000", shape: "neon" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#000000", glow: "0 0 10px #0088CC", shape: "neon" }
      ]
    },
    style7: {
      name: "Material Design",
      description: "Clean material design icons with elevation",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" }
      ]
    }
  };

  // Add effect to update local customization when activeTab changes
  useEffect(() => {
    if (localCustomization && localCustomization.socialMediaStyles) {
      // This will trigger a re-render when activeTab changes
    }
  }, [activeTab, localCustomization]);

  if (!localCustomization || !localCustomization.socialMediaStyles) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading social media settings...</p>
      </div>
    );
  }

  // Check if activeTab exists in styleConfigs
  if (!styleConfigs[activeTab]) {
    console.error("Style config not found for:", activeTab);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error: Style configuration not found for {activeTab}</p>
      </div>
    );
  }

  const currentStyle = localCustomization.socialMediaStyles[activeTab] || {};
  const currentPlatforms = styleConfigs[activeTab]?.platforms || [];
  
  // Debugging
  console.log("Active tab:", activeTab);
  console.log("Current style config:", styleConfigs[activeTab]);
  console.log("Current platforms:", currentPlatforms);

  // Log the current state for debugging
  console.log("Current style:", currentStyle);
  console.log("Current style icons:", currentStyle.icons);
  console.log("Current platforms:", currentPlatforms);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/customization" className="hover:text-indigo-600">
          Customization
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Social Media Icons</span>
      </nav>

      {/* Style Selector Tabs */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Social Media Icon Styles</h2>
        <p className="text-sm text-gray-600 mb-4">
          Click on a style to preview and configure social media icons.
        </p>
        
        {/* Style selector in a single line */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(styleConfigs).map((styleKey) => (
            <button
              key={styleKey}
              onClick={() => handleStyleChange(styleKey)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                activeTab === styleKey
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {styleConfigs[styleKey].name}
            </button>
          ))}
        </div>

        {/* Unified Icon Preview - All icons together as a set */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {styleConfigs[activeTab].name} Preview
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex flex-nowrap overflow-x-auto gap-2 py-2">
              {currentPlatforms.map((platform) => {
                // Render different styles based on shape
                let iconStyle = {};
                let iconClassName = "flex items-center justify-center";
                
                switch (platform.shape) {
                  case "circle":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      minWidth: "40px"
                    };
                    break;
                  case "square-outline":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "5px",
                      border: `2px solid ${platform.borderColor}`,
                      boxSizing: "border-box",
                      minWidth: "40px"
                    };
                    break;
                  case "rounded":
                    iconStyle = {
                      background: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      minWidth: "40px"
                    };
                    break;
                  case "flat":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "5px",
                      minWidth: "40px"
                    };
                    break;
                  case "shadow":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      boxShadow: platform.shadow,
                      minWidth: "40px"
                    };
                    break;
                  case "neon":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      boxShadow: platform.glow,
                      minWidth: "40px"
                    };
                    break;
                  case "material":
                    iconStyle = {
                      backgroundColor: platform.bgColor,
                      color: platform.color,
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      boxShadow: platform.elevation,
                      minWidth: "40px"
                    };
                    break;
                  default:
                    iconStyle = {
                      backgroundColor: platform.bgColor || platform.color,
                      color: '#ffffff',
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      minWidth: "40px"
                    };
                }
                
                return (
                  <div key={platform.key} className="flex flex-col items-center min-w-max">
                    <div
                      className={iconClassName}
                      style={iconStyle}
                    >
                      <i className={platform.iconClass}></i>
                    </div>
                    <span className="mt-1 text-xs text-gray-600 whitespace-nowrap">{platform.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* URL Input Fields - Without icons */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Social Media URLs
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter URLs for each platform.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentPlatforms.map((platform) => (
              <div key={platform.key} className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  {platform.name}
                </label>
                <input
                  type="text"
                  value={(currentStyle.icons && currentStyle.icons[platform.key]) || ""}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  placeholder={`https://${platform.key}.com/...`}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default SocialMediaIconsSettings;