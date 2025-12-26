import React from 'react';

const TestSocialLinks = () => {
  // Sample socialLinks data for testing
  const sampleSocialLinks = {
    iconStyle: "circle",
    links: {
      facebook: "https://facebook.com/",
      whatsapp: "https://wa.me/",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/company/",
      youtube: "https://youtube.com/c/direct-api-test",
      x: "https://x.com/direct-api-test",
      telegram: "https://t.me/direct-api-test"
    }
  };

  // Style configurations
  const styleConfigs = {
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
    }
  };

  // Get the current style configuration
  const currentStyle = styleConfigs[sampleSocialLinks.iconStyle] || styleConfigs.circle;
  
  // Filter platforms that have URLs
  const filteredPlatforms = currentStyle.platforms.filter(platform => sampleSocialLinks.links[platform.key]);

  // Render platform with styles
  const renderPlatform = (platform) => {
    let iconStyle = {};
    let iconClassName = "flex items-center justify-center text-lg transition-transform hover:scale-110";
    
    switch (platform.shape) {
      case "circle":
        iconStyle = {
          backgroundColor: platform.bgColor,
          color: platform.color,
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none"
        };
        break;
      default:
        iconStyle = {
          backgroundColor: platform.bgColor || platform.color,
          color: '#ffffff',
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none"
        };
    }
    
    return (
      <a
        key={platform.key}
        href={sampleSocialLinks.links[platform.key]}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClassName}
        style={iconStyle}
        title={platform.name}
      >
        <i className={platform.iconClass}></i>
      </a>
    );
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      padding: '16px 0',
      flexWrap: 'wrap',
      marginBottom: '16px'
    }}>
      {filteredPlatforms.map(renderPlatform)}
    </div>
  );
};

export default TestSocialLinks;