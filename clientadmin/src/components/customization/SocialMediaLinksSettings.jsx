import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SocialMediaLinksSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState({
    iconStyle: "circle",
    links: {
      facebook: "",
      whatsapp: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      x: "",
      telegram: ""
    }
  });

  // Initialize state from customization data
  useEffect(() => {
    if (customization && customization.socialLinks) {
      setLocalCustomization({
        iconStyle: customization.socialLinks.iconStyle || "circle",
        links: {
          facebook: customization.socialLinks.links?.facebook || "",
          whatsapp: customization.socialLinks.links?.whatsapp || "",
          instagram: customization.socialLinks.links?.instagram || "",
          linkedin: customization.socialLinks.links?.linkedin || "",
          youtube: customization.socialLinks.links?.youtube || "",
          x: customization.socialLinks.links?.x || "",
          telegram: customization.socialLinks.links?.telegram || ""
        }
      });
    } else {
      // Set default values if no socialLinks data exists
      setLocalCustomization({
        iconStyle: "circle",
        links: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      });
    }
  }, [customization]);

  const handleStyleChange = (style) => {
    setLocalCustomization(prev => ({
      ...prev,
      iconStyle: style
    }));
  };

  const handleUrlChange = (platform, value) => {
    setLocalCustomization(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [platform]: value
      }
    }));
  };

  // Simple URL validation function
  const isValidUrl = (url) => {
    if (!url || url.trim() === '') return true; // Allow empty URLs
    console.log(url);
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSave = () => {
    // Validate URLs before saving
    const invalidUrls = Object.entries(localCustomization.links).filter(([platform, url]) => 
      url && url.trim() !== '' && !isValidUrl(url)
    );
    
    if (invalidUrls.length > 0) {
      alert(`Please enter valid URLs for: ${invalidUrls.map(([platform]) => platform).join(', ')}`);
      return;
    }
    
    // Format data correctly for the backend - send only socialLinks data
    const formattedCustomization = {
      socialLinks: {
        iconStyle: localCustomization.iconStyle,
        links: { ...localCustomization.links }
      }
    };
    
    setCustomization(prev => ({
      ...prev,
      socialLinks: formattedCustomization.socialLinks
    }));
    
    onSave(formattedCustomization);
  };

  // Available icon styles with styling configurations
  const iconStyles = [
    { 
      id: "circle", 
      name: "Circle",
      platforms: [
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#FFFFFF", bgColor: "#1877F2", shape: "circle" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#FFFFFF", bgColor: "#25D366", shape: "circle" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#FFFFFF", bgColor: "#E4405F", shape: "circle" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#FFFFFF", bgColor: "#0A66C2", shape: "circle" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FFFFFF", bgColor: "#FF0000", shape: "circle" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#FFFFFF", bgColor: "#000000", shape: "circle" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#FFFFFF", bgColor: "#0088CC", shape: "circle" }
      ]
    },
    { 
      id: "square-outline", 
      name: "Square Outline",
      platforms: [
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
      ]
    },
    { 
      id: "rounded-gradient", 
      name: "Rounded Gradient",
      platforms: [
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)", shape: "rounded" },
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #1877F2, #0C5FC4)", shape: "rounded" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #000000, #333333)", shape: "rounded" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0A66C2, #004E92)", shape: "rounded" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #FF0000, #CC0000)", shape: "rounded" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #25D366, #128C7E)", shape: "rounded" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0088CC, #006699)", shape: "rounded" }
      ]
    },
    { 
      id: "flat-minimal", 
      name: "Flat Minimal",
      platforms: [
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#F0F0F0", shape: "flat" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFE5E5", shape: "flat" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FEEBEF", shape: "flat" },
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#E6F0FF", shape: "flat" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#E3EEFF", shape: "flat" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#E5F8ED", shape: "flat" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#E0F4FF", shape: "flat" }
      ]
    },
    { 
      id: "shadow", 
      name: "Shadow",
      platforms: [
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 136, 204, 0.3)", shape: "shadow" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(37, 211, 102, 0.3)", shape: "shadow" },
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(24, 119, 242, 0.3)", shape: "shadow" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(228, 64, 95, 0.3)", shape: "shadow" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 0, 0, 0.3)", shape: "shadow" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(10, 102, 194, 0.3)", shape: "shadow" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(255, 0, 0, 0.3)", shape: "shadow" }
      ]
    },
    { 
      id: "neon-glow", 
      name: "Neon Glow",
      platforms: [
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#000000", glow: "0 0 10px #1877F2", shape: "neon" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#000000", glow: "0 0 10px #25D366", shape: "neon" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#000000", glow: "0 0 10px #E4405F", shape: "neon" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#000000", glow: "0 0 10px #0A66C2", shape: "neon" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#000000", glow: "0 0 10px #FF0000", shape: "neon" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", glow: "0 0 10px #000000", shape: "neon" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#000000", glow: "0 0 10px #0088CC", shape: "neon" }
      ]
    },
    { 
      id: "material", 
      name: "Material",
      platforms: [
        { id: "facebook", name: "Facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "whatsapp", name: "WhatsApp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "instagram", name: "Instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "linkedin", name: "LinkedIn", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "youtube", name: "YouTube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "x", name: "X", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { id: "telegram", name: "Telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" }
      ]
    }
  ];
  // Social media platforms
  const platforms = [
    { id: "facebook", name: "Facebook", placeholder: "https://facebook.com/..." },
    { id: "whatsapp", name: "WhatsApp", placeholder: "https://wa.me/..." },
    { id: "instagram", name: "Instagram", placeholder: "https://instagram.com/..." },
    { id: "linkedin", name: "LinkedIn", placeholder: "https://linkedin.com/..." },
    { id: "youtube", name: "YouTube", placeholder: "https://youtube.com/..." },
    { id: "x", name: "X (Twitter)", placeholder: "https://x.com/..." },
    { id: "telegram", name: "Telegram", placeholder: "https://t.me/..." }
  ];

  // Get current style configuration
  const currentStyleConfig = iconStyles.find(style => style.id === localCustomization.iconStyle) || iconStyles[0];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/customization" className="hover:text-indigo-600">
          Customization
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Social Media Links</span>
      </nav>

      {/* Icon Style Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Select Icon Style</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose a style for your social media icons.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {iconStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                localCustomization.iconStyle === style.id
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <i className="fas fa-icons text-indigo-600"></i>
                </div>
                <span className="text-xs font-medium text-gray-700">{style.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Unified Icon Preview - All icons together as a set */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {currentStyleConfig.name} Preview
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-nowrap overflow-x-auto gap-2 py-2">
            {currentStyleConfig.platforms.map((platform) => {
              // Only show platforms that have URLs entered
              const url = localCustomization.links[platform.id];
              if (!url || url.trim() === '') return null;
              
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
                <div key={platform.id} className="flex flex-col items-center min-w-max">
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
            {Object.values(localCustomization.links).filter(url => url && url.trim() !== '').length === 0 && (
              <div className="text-gray-500 text-sm py-2">
                No social media URLs entered yet. Preview will appear here once you add URLs.
              </div>
            )}
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
          {platforms.map((platform) => (
            <div key={platform.id} className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">
                {platform.name}
              </label>
              <input
                type="text"
                value={localCustomization.links[platform.id] || ""}
                onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          ))}
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

export default SocialMediaLinksSettings;