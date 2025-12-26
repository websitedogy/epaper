import { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaTelegramPlane
} from "react-icons/fa";

const PublicSocialMediaLinks = ({ customization }) => {
  // Don't render if no customization data
  if (!customization) return null;

  // Check if we have socialLinks data (new structure)
  const socialLinks = customization.socialLinks;
  
  // If we don't have socialLinks, check for socialMediaIcons (old structure)
  if (!socialLinks) {
    // Use the existing PublicSocialMediaIcons component for backward compatibility
    return null;
  }

  // Get the selected icon style and links
  const { iconStyle, links } = socialLinks;
  
  // Check if any URLs exist
  const hasUrls = links && Object.values(links).some(url => url && url.trim() !== '');
  
  // Don't render if no URLs
  if (!hasUrls) return null;

  // Map platform keys to React Icons components
  const iconMap = {
    facebook: FaFacebookF,
    whatsapp: FaWhatsapp,
    instagram: FaInstagram,
    linkedin: FaLinkedinIn,
    youtube: FaYoutube,
    x: FaTwitter,
    telegram: FaTelegramPlane
  };

  // Single source of truth mapping between DB iconStyle values and frontend style definitions
  const STYLE_MAP = {
    circle: {
      name: "Circle Icons",
      platforms: [
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#1877F2", shape: "circle" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#25D366", shape: "circle" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#E4405F", shape: "circle" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#0A66C2", shape: "circle" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FF0000", shape: "circle" },
        { name: "X", key: "x", color: "#000000", bgColor: "#000000", shape: "circle" },
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#0088CC", shape: "circle" }
      ]
    },
    "square-outline": {
      name: "Square Outline",
      platforms: [
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
        { name: "X", key: "x", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
      ]
    },
    "rounded-gradient": {
      name: "Rounded Gradient",
      platforms: [
        { name: "Instagram", key: "instagram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)", shape: "rounded" },
        { name: "Facebook", key: "facebook", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #1877F2, #0C5FC4)", shape: "rounded" },
        { name: "X", key: "x", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #000000, #333333)", shape: "rounded" },
        { name: "LinkedIn", key: "linkedin", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0A66C2, #004E92)", shape: "rounded" },
        { name: "YouTube", key: "youtube", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #FF0000, #CC0000)", shape: "rounded" },
        { name: "WhatsApp", key: "whatsapp", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #25D366, #128C7E)", shape: "rounded" },
        { name: "Telegram", key: "telegram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0088CC, #006699)", shape: "rounded" }
      ]
    },
    "flat-minimal": {
      name: "Flat Minimal",
      platforms: [
        { name: "X", key: "x", color: "#000000", bgColor: "#F0F0F0", shape: "flat" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FFE5E5", shape: "flat" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#FEEBEF", shape: "flat" },
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#E6F0FF", shape: "flat" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#E3EEFF", shape: "flat" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#E5F8ED", shape: "flat" },
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#E0F4FF", shape: "flat" }
      ]
    },
    shadow: {
      name: "Shadow Effect",
      platforms: [
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 136, 204, 0.3)", shape: "shadow" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(37, 211, 102, 0.3)", shape: "shadow" },
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(24, 119, 242, 0.3)", shape: "shadow" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(228, 64, 95, 0.3)", shape: "shadow" },
        { name: "X", key: "x", color: "#000000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 0, 0, 0.3)", shape: "shadow" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(10, 102, 194, 0.3)", shape: "shadow" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(255, 0, 0, 0.3)", shape: "shadow" }
      ]
    },
    "neon-glow": {
      name: "Neon Glow",
      platforms: [
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#1877F2", glow: "0 0 10px #1877F2, 0 0 20px #1877F2", shape: "neon" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#E4405F", glow: "0 0 10px #E4405F, 0 0 20px #E4405F", shape: "neon" },
        { name: "X", key: "x", color: "#000000", bgColor: "#000000", glow: "0 0 10px #000000, 0 0 20px #000000", shape: "neon" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#0A66C2", glow: "0 0 10px #0A66C2, 0 0 20px #0A66C2", shape: "neon" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FF0000", glow: "0 0 10px #FF0000, 0 0 20px #FF0000", shape: "neon" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#25D366", glow: "0 0 10px #25D366, 0 0 20px #25D366", shape: "neon" },
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#0088CC", glow: "0 0 10px #0088CC, 0 0 20px #0088CC", shape: "neon" }
      ]
    },
    material: {
      name: "Material Design",
      platforms: [
        { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "X", key: "x", color: "#000000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
        { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" }
      ]
    }
  };

  // Use the DB value to get the active style with fallback
  const activeStyle = STYLE_MAP[iconStyle] || STYLE_MAP.circle;

  // Filter platforms that have URLs and render icons
  const filteredPlatforms = activeStyle.platforms.filter(platform => links[platform.key] && links[platform.key].trim() !== '');

  // If no platforms have URLs, return null
  if (filteredPlatforms.length === 0) return null;

  return (
    <div className="mb-1 flex justify-center w-full px-0">
      <div className="flex flex-wrap gap-3 justify-center md:gap-4 bg-white p-3 rounded-xl shadow-md w-full max-w-4xl mx-auto">
        {filteredPlatforms.map(platform => {
          // Get the React Icon component
          const IconComponent = iconMap[platform.key];
          
          // Render different styles based on shape
          let iconContainerStyle = {};
          let iconStyleObj = {};

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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              iconStyleObj = {
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
              {IconComponent && <IconComponent style={iconStyleObj} />}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default PublicSocialMediaLinks;