import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import CustomizationDashboard from "./customization/CustomizationDashboard";
import NavbarSettings from "./customization/NavbarSettings";
import FooterSettings from "./customization/FooterSettings";
import ClipSettings from "./customization/ClipSettings";
import PromotionalBannerSettings from "./customization/PromotionalBannerSettings";
import BreakingNewsSettings from "./customization/BreakingNewsSettings";
import BreakingNewsTabs from "./customization/BreakingNewsTabs";
import TopToolbarSettings from "./customization/TopToolbarSettings";
import SocialMediaIconsSettings from "./customization/SocialMediaIconsSettings";
import SocialMediaLinksSettings from "./customization/SocialMediaLinksSettings";
import { useCustomization } from "../contexts/CustomizationContext";

const Customization = () => {
  const { customization, updateCustomization } = useCustomization();
  const [localCustomization, setLocalCustomization] = useState(customization);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update local state when context changes
  useEffect(() => {
    setLocalCustomization(customization);
  }, [customization]);

  const handleSave = async (updatedCustomization) => {
    setLoading(true);
    try {
      // Check if this is for promotional banners with file uploads
      if (updatedCustomization._bannerFiles && updatedCustomization._bannerFiles.length > 0) {
        // Handle promotional banner file uploads
        const formData = new FormData();
        
        // Add the customization data as JSON (without the temporary _bannerFiles property)
        const { _bannerFiles, ...cleanCustomization } = updatedCustomization;
        formData.append("customization", JSON.stringify(cleanCustomization));

        // Add banner images
        updatedCustomization._bannerFiles.forEach(({ index, file }) => {
          formData.append(`promotionalBanners`, file);
        });

        // Use the file upload endpoint
        const response = await epaperAPI.updateCustomizationWithFiles(formData);
        
        // Update the context with the response data to ensure consistency across the app
        if (response && response.data) {
          updateCustomization(response.data);
        }

        alert("Customization saved successfully!");
      } else {
        // Check if this is specifically social media icons data (no files needed)
        let response;
        if (updatedCustomization._noFiles) {
          // Use the regular endpoint for social media icons
          response = await epaperAPI.updateCustomization(updatedCustomization);
        } else {
          // Check if any other file inputs have files selected
          const fileInputs = document.querySelectorAll('input[type="file"]');
          let hasFiles = false;
          
          fileInputs.forEach(input => {
            if (input.files && input.files.length > 0) {
              hasFiles = true;
            }
          });
      
          if (hasFiles) {
            // Handle file uploads
            const formData = new FormData();
            formData.append("customization", JSON.stringify(updatedCustomization));

            // Append files with appropriate keys and data-section attributes
            fileInputs.forEach(input => {
              if (input.files && input.files.length > 0) {
                const file = input.files[0];
                if (input.closest('[data-section="navbar"]')) {
                  formData.append("navbarLogo", file);
                } else if (input.closest('[data-section="footer"]')) {
                  formData.append("footerLogo", file);
                } else if (input.closest('[data-section="footer-banner"]')) {
                  formData.append("footerBanner", file);
                } else if (input.closest('[data-section="top-clip-logo"]')) {
                  formData.append("topClipLogo", file);
                } else if (input.closest('[data-section="footer-clip-logo"]')) {
                  formData.append("footerClipLogo", file);
                }
              }
            });

            // Use the file upload endpoint
            response = await epaperAPI.updateCustomizationWithFiles(formData);
          } else {
            // Use the regular endpoint when no files are selected
            response = await epaperAPI.updateCustomization(updatedCustomization);
          }
        }

        // Update the context with the response data to ensure consistency across the app
        if (response && response.data) {
          updateCustomization(response.data);
        }

        alert("Customization saved successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save customization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Routes>
        <Route path="/" element={<CustomizationDashboard />} />
        <Route path="/navbar" element={
          <NavbarSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/footer" element={
          <FooterSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/clip" element={
          <ClipSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/promotional-banner" element={
          <PromotionalBannerSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/breaking-news" element={
          <BreakingNewsTabs
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/top-toolbar" element={
          <TopToolbarSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/social-media-icons" element={
          <SocialMediaIconsSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
        <Route path="/social-media-links" element={
          <SocialMediaLinksSettings
            customization={localCustomization}
            setCustomization={setLocalCustomization}
            onSave={handleSave}
            loading={loading}
          />
        } />
      </Routes>
    </div>
  );
};

export default Customization;