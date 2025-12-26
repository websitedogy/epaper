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

const PublicSocialMediaIcons = ({ customization }) => {
  const [activeStyle, setActiveStyle] = useState("circle");

  // Don't render if no customization data
  if (!customization) return null;

  // For backward compatibility, check if we have socialMediaIcons data (old structure)
  const socialMediaData = customization.socialMediaIcons || customization;
  
  // Check if any URLs exist
  const hasUrls = socialMediaData && 
    ((socialMediaData.facebookUrl && socialMediaData.facebookUrl.trim() !== '') ||
     (socialMediaData.whatsappUrl && socialMediaData.whatsappUrl.trim() !== '') ||
     (socialMediaData.instagramUrl && socialMediaData.instagramUrl.trim() !== '') ||
     (socialMediaData.linkedinUrl && socialMediaData.linkedinUrl.trim() !== '') ||
     (socialMediaData.youtubeUrl && socialMediaData.youtubeUrl.trim() !== '') ||
     (socialMediaData.xUrl && socialMediaData.xUrl.trim() !== '') ||
     (socialMediaData.telegramUrl && socialMediaData.telegramUrl.trim() !== ''));

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

  // Define platform data with React Icons
  const platforms = [
    { 
      name: "Facebook", 
      key: "facebook", 
      url: socialMediaData.facebookUrl,
      color: "#1877F2",
      icon: "FaFacebookF"
    },
    { 
      name: "WhatsApp", 
      key: "whatsapp", 
      url: socialMediaData.whatsappUrl,
      color: "#25D366",
      icon: "FaWhatsapp"
    },
    { 
      name: "Instagram", 
      key: "instagram", 
      url: socialMediaData.instagramUrl,
      color: "#E4405F",
      icon: "FaInstagram"
    },
    { 
      name: "LinkedIn", 
      key: "linkedin", 
      url: socialMediaData.linkedinUrl,
      color: "#0A66C2",
      icon: "FaLinkedinIn"
    },
    { 
      name: "YouTube", 
      key: "youtube", 
      url: socialMediaData.youtubeUrl,
      color: "#FF0000",
      icon: "FaYoutube"
    },
    { 
      name: "X", 
      key: "x", 
      url: socialMediaData.xUrl,
      color: "#000000",
      icon: "FaTwitter"
    },
    { 
      name: "Telegram", 
      key: "telegram", 
      url: socialMediaData.telegramUrl,
      color: "#0088CC",
      icon: "FaTelegramPlane"
    }
  ];

  // Filter platforms that have URLs
  const activePlatforms = platforms.filter(platform => platform.url && platform.url.trim() !== '');

  // If no platforms have URLs, return null
  if (activePlatforms.length === 0) return null;

  return (
    <div className="mb-1 flex justify-center w-full px-0">
      <div className="flex flex-wrap gap-3 justify-center md:gap-4 bg-white p-3 rounded-xl shadow-md w-full max-w-4xl mx-auto">
        {activePlatforms.map(platform => {
          // Get the React Icon component
          const IconComponent = iconMap[platform.key];
          
          return (
            <a
              key={platform.key}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-200 hover:scale-110 filter brightness-110 saturate-100 hover:brightness-125"
              style={{
                backgroundColor: '#ffffff',
                color: platform.color,
                textDecoration: "none",
                boxShadow: `0 4px 12px ${platform.color}40`,
                border: `2px solid ${platform.color}`,
              }}
              title={platform.name}
            >
              {IconComponent && <IconComponent className="text-lg md:text-xl" />}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default PublicSocialMediaIcons;