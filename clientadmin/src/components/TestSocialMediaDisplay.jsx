import React from 'react';

const TestSocialMediaDisplay = () => {
  // Mock customization data for testing
  const mockCustomization = {
    socialLinks: {
      iconStyle: "rounded-gradient",
      links: {
        facebook: "https://facebook.com/test",
        whatsapp: "https://wa.me/1234567890",
        instagram: "https://instagram.com/test",
        linkedin: "https://linkedin.com/company/test",
        youtube: "https://youtube.com/channel/test",
        x: "https://x.com/test",
        telegram: "https://t.me/test"
      }
    },
    socialMediaStyles: {
      style1: {
        icons: {
          facebook: "https://facebook.com/test1",
          whatsapp: "https://wa.me/1234567890",
          instagram: "https://instagram.com/test1",
          linkedin: "https://linkedin.com/company/test1",
          youtube: "https://youtube.com/channel/test1",
          x: "https://x.com/test1",
          telegram: "https://t.me/test1"
        }
      }
    },
    selectedSocialMediaStyle: "style1"
  };

  // Single source of truth mapping between DB iconStyle values and frontend style definitions
  const SOCIAL_LINKS_STYLE_MAP = {
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
    },
    "rounded-gradient": {
      name: "Rounded Gradient",
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
    "flat-minimal": {
      name: "Flat Minimal",
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
    shadow: {
      name: "Shadow Effect",
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
    "neon-glow": {
      name: "Neon Glow",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#1877F2", glow: "0 0 10px #1877F2, 0 0 20px #1877F2", shape: "neon" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#E4405F", glow: "0 0 10px #E4405F, 0 0 20px #E4405F", shape: "neon" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#000000", glow: "0 0 10px #000000, 0 0 20px #000000", shape: "neon" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#0A66C2", glow: "0 0 10px #0A66C2, 0 0 20px #0A66C2", shape: "neon" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FF0000", glow: "0 0 10px #FF0000, 0 0 20px #FF0000", shape: "neon" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#25D366", glow: "0 0 10px #25D366, 0 0 20px #25D366", shape: "neon" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#0088CC", glow: "0 0 10px #0088CC, 0 0 20px #0088CC", shape: "neon" }
      ]
    },
    material: {
      name: "Material Design",
      platforms: [
        { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" }
      ]
    }
  };

  // Single source of truth mapping between DB style keys and frontend style definitions
  const SOCIAL_ICONS_STYLE_MAP = {
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
    }
  };

  // Function to render social media links with selected icon style
  const renderSocialMediaLinks = (customization) => {
    // Check if customization exists and has social links data
    if (!customization || !customization.socialLinks) {
      return null;
    }
    
    // Get the selected icon style and links
    const { iconStyle, links } = customization.socialLinks;
    
    // Check if any URLs exist
    const hasUrls = Object.values(links).some(url => url);
    if (!hasUrls) {
      return null;
    }
    
    // Use the DB value to get the active style with fallback
    const activeStyle = SOCIAL_LINKS_STYLE_MAP[iconStyle] || SOCIAL_LINKS_STYLE_MAP.circle;
    
    // Filter platforms that have URLs and render icons
    const filteredPlatforms = activeStyle.platforms.filter(platform => links[platform.key]);
    
    // If no platforms have URLs, return null
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
        {filteredPlatforms
          .map(platform => {
            // Render different styles based on shape
            let iconContainerStyle = {};
            let iconStyle = {};
            
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
                iconStyle = {
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
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "rounded":
                iconContainerStyle = {
                  background: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "flat":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "shadow":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.shadow
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "neon":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.glow
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "material":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.elevation
                };
                iconStyle = {
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
                iconStyle = {
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
                <i className={platform.iconClass} style={iconStyle}></i>
              </a>
            );
          })}
      </div>
    );
  };

  // Function to render social media icons with selected style
  const renderSocialMediaIcons = (customization) => {
    // Check if customization exists and has social media data
    if (!customization || !customization.socialMediaStyles) {
      return null;
    }
    
    // Get the selected social media style
    const selectedStyleKey = customization.selectedSocialMediaStyle || "style1";
    
    // Use the DB value to get the active style with fallback
    const activeStyle = SOCIAL_ICONS_STYLE_MAP[selectedStyleKey] || SOCIAL_ICONS_STYLE_MAP.style1;
    
    // Get URLs from customization
    const socialMediaUrls = customization.socialMediaStyles[selectedStyleKey]?.icons || {};
    
    // Check if any URLs exist for this style
    const hasUrls = Object.values(socialMediaUrls).some(url => url);
    if (!hasUrls) {
      return null;
    }
    
    // Filter platforms that have URLs and render icons
    const filteredPlatforms = activeStyle.platforms.filter(platform => socialMediaUrls[platform.key]);
    
    // If no platforms have URLs, return null
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
        {filteredPlatforms
          .map(platform => {
            // Render different styles based on shape
            let iconContainerStyle = {};
            let iconStyle = {};
            
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
                iconStyle = {
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
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "rounded":
                iconContainerStyle = {
                  background: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "flat":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "shadow":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.shadow
                };
                iconStyle = {
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
                iconStyle = {
                  color: '#ffffff',
                  fontSize: "18px"
                };
            }
            
            return (
              <a
                key={platform.key}
                href={socialMediaUrls[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                style={iconContainerStyle}
                title={platform.name}
              >
                <i className={platform.iconClass} style={iconStyle}></i>
              </a>
            );
          })}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Social Media Display</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Social Media Links (from socialLinks)</h2>
        <p>Testing with iconStyle: "{mockCustomization.socialLinks.iconStyle}"</p>
        {renderSocialMediaLinks(mockCustomization)}
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Social Media Icons (from socialMediaStyles)</h2>
        <p>Testing with selectedSocialMediaStyle: "{mockCustomization.selectedSocialMediaStyle}"</p>
        {renderSocialMediaIcons(mockCustomization)}
      </div>
    </div>
  );
};

export default TestSocialMediaDisplay;