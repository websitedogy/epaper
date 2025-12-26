// This script will help verify that the frontend is correctly retrieving and using social media URLs
// We'll simulate what the frontend does when it fetches customization data

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Client from './models/Client.js';

dotenv.config();

const verifyFrontendData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a test client
    const client = await Client.findOne({});
    
    if (!client) {
      console.log('No client found');
      return;
    }

    console.log('Client ID:', client._id);
    console.log('Client Name:', client.clientName);
    
    // Simulate what the frontend receives
    // This is similar to what the getEpaper function returns
    
    // Prepare default social media styles structure (same as in backend)
    const defaultSocialMediaStyles = {
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
    };

    // Ensure social media styles exist with defaults
    let socialMediaStyles = defaultSocialMediaStyles;
    if (client.customization && client.customization.socialMediaStyles) {
      try {
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles
        };
      } catch (e) {
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles 
        };
      }
    }

    // Ensure selected social media style exists with default
    const selectedSocialMediaStyle = (client.customization && client.customization.selectedSocialMediaStyle) || "style1";

    // Build the complete socialMediaIcons object (same as in backend)
    const socialMediaIcons = {
      selectedStyle: selectedSocialMediaStyle,
      urls: {}, // Will be populated from the selected style
      styles: {
        style1: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style2: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ],
        style3: [
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style4: [
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" }
        ],
        style5: [
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style6: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style7: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ]
      }
    };

    // Populate URLs from the selected style
    const selectedStyleData = socialMediaStyles[selectedSocialMediaStyle];
    if (selectedStyleData && selectedStyleData.icons) {
      socialMediaIcons.urls = { ...selectedStyleData.icons };
    } else {
      // Default empty URLs
      socialMediaIcons.urls = {
        facebook: "",
        whatsapp: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        x: "",
        telegram: ""
      };
    }

    console.log('\n=== Frontend Data Simulation ===');
    console.log('Selected Style:', socialMediaIcons.selectedStyle);
    console.log('Available Styles:', Object.keys(socialMediaIcons.styles));
    console.log('URLs for selected style:');
    
    Object.keys(socialMediaIcons.urls).forEach(platform => {
      console.log(`  ${platform}: ${socialMediaIcons.urls[platform] || '(empty)'}`);
    });
    
    console.log('\n=== Verification ===');
    console.log('Facebook URL should open:', socialMediaIcons.urls.facebook || 'No URL set');
    console.log('Instagram URL should open:', socialMediaIcons.urls.instagram || 'No URL set');
    console.log('LinkedIn URL should open:', socialMediaIcons.urls.linkedin || 'No URL set');
    
    console.log('\n✅ Frontend simulation completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

verifyFrontendData();