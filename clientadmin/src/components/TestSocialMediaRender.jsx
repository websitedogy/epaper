import React from 'react';

const TestSocialMediaRender = () => {
  // Mock customization data to test the rendering
  const mockCustomization = {
    socialLinks: {
      iconStyle: "circle",
      links: {
        facebook: "https://facebook.com/test",
        whatsapp: "https://wa.me/1234567890",
        instagram: "https://instagram.com/test"
      }
    },
    socialMediaStyles: {
      style1: {
        name: "Style 1",
        icons: {
          facebook: "https://facebook.com/test",
          whatsapp: "https://wa.me/1234567890",
          instagram: "https://instagram.com/test"
        }
      }
    },
    selectedSocialMediaStyle: "style1"
  };

  // Test the renderSocialMediaLinks function logic
  const testRenderSocialMediaLinks = (customization) => {
    if (!customization || !customization.socialLinks) {
      return null;
    }
    
    const { iconStyle, links } = customization.socialLinks;
    console.log('Test - Icon style:', iconStyle);
    console.log('Test - Links:', links);
    
    const hasUrls = Object.values(links).some(url => url);
    if (!hasUrls) {
      return null;
    }
    
    // Single source of truth mapping between DB iconStyle values and frontend style definitions
    const STYLE_MAP = {
      circle: {
        name: "Circle Icons",
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
      "square-outline": {
        name: "Square Outline",
        platforms: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
        ]
      }
    };
    
    // Use the DB value to get the active style with fallback
    const activeStyle = STYLE_MAP[iconStyle] || STYLE_MAP.circle;
    console.log('Test - Active style:', activeStyle);
    
    // Filter platforms that have URLs and render icons
    const filteredPlatforms = activeStyle.platforms.filter(platform => links[platform.key]);
    console.log('Test - Filtered platforms:', filteredPlatforms);
    
    if (filteredPlatforms.length === 0) {
      return null;
    }
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        padding: '16px 0',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        {filteredPlatforms.map(platform => {
          // Render different styles based on shape
          let iconContainerStyle = {};
          let platformIconStyle = {};
          
          switch (platform.shape) {
            case "circle":
              iconContainerStyle = {
                backgroundColor: platform.bgColor,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                border: "none"
              };
              platformIconStyle = {
                color: platform.color,
                fontSize: "18px"
              };
              break;
            case "square-outline":
              iconContainerStyle = {
                backgroundColor: platform.bgColor,
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                border: `2px solid ${platform.borderColor}`,
                boxSizing: "border-box"
              };
              platformIconStyle = {
                color: platform.color,
                fontSize: "18px"
              };
              break;
            default:
              iconContainerStyle = {
                backgroundColor: platform.bgColor || platform.color,
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none"
              };
              platformIconStyle = {
                color: '#ffffff',
                fontSize: "18px"
              };
          }
          
          return (
            <a
              key={platform.key}
              href={links[platform.key]}
              target="_blank"
              rel="noopener noreferrer"
              style={iconContainerStyle}
              title={platform.name}
            >
              <i className={platform.iconClass} style={platformIconStyle}></i>
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Media Render Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Mock Data Test</h2>
        {testRenderSocialMediaLinks(mockCustomization)}
      </div>
    </div>
  );
};

export default TestSocialMediaRender;