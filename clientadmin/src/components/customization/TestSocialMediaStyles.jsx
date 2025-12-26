import { useState, useEffect } from "react";

const TestSocialMediaStyles = () => {
  const [activeTab, setActiveTab] = useState("style1");
  
  // Different icon styles with unique designs and themes
  const styleConfigs = {
    style1: {
      name: "Circle Icons",
      description: "Classic circular icons with brand colors",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#1877F2", shape: "circle" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#25D366", shape: "circle" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#E4405F", shape: "circle" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#0A66C2", shape: "circle" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FF0000", shape: "circle" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#000000", shape: "circle" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#0088CC", shape: "circle" }
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

  const handleStyleChange = (styleKey) => {
    console.log("Changing to style:", styleKey);
    setActiveTab(styleKey);
  };

  const currentPlatforms = styleConfigs[activeTab]?.platforms || [];

  return (
    <div className="space-y-6 max-w-6xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Icon Styles</h2>
      
      {/* Style Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.keys(styleConfigs).map((styleKey) => (
          <button
            key={styleKey}
            onClick={() => handleStyleChange(styleKey)}
            className={`p-4 rounded-lg text-left transition-all ${
              activeTab === styleKey
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <div className="font-medium">{styleConfigs[styleKey].name}</div>
            <div className="text-sm mt-1 opacity-80">{styleConfigs[styleKey].description}</div>
          </button>
        ))}
      </div>

      {/* Unified Icon Preview - All icons together as a set */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {styleConfigs[activeTab]?.name || "Unknown Style"} - Icon Preview
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {styleConfigs[activeTab]?.description || "No description available"}. Preview of all social media icons in this style.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {currentPlatforms.map((platform) => {
              const styleProps = platform;
              
              // Render different styles based on shape
              let iconStyle = {};
              let iconClassName = "flex items-center justify-center text-xl transition-transform hover:scale-110";
              
              switch (styleProps.shape) {
                case "circle":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%"
                  };
                  break;
                case "square-outline":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    border: `2px solid ${styleProps.borderColor}`,
                    boxSizing: "border-box"
                  };
                  break;
                case "rounded":
                  iconStyle = {
                    background: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px"
                  };
                  break;
                case "flat":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px"
                  };
                  break;
                case "shadow":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    boxShadow: styleProps.shadow
                  };
                  break;
                case "neon":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    boxShadow: styleProps.glow
                  };
                  break;
                case "material":
                  iconStyle = {
                    backgroundColor: styleProps.bgColor,
                    color: styleProps.color,
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    boxShadow: styleProps.elevation
                  };
                  break;
                default:
                  iconStyle = {
                    backgroundColor: styleProps.bgColor || styleProps.color,
                    color: '#ffffff',
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%"
                  };
              }
              
              return (
                <div key={platform.key} className="flex flex-col items-center">
                  <div
                    className={iconClassName}
                    style={iconStyle}
                  >
                    <i className={styleProps.iconClass}></i>
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-600">{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSocialMediaStyles;