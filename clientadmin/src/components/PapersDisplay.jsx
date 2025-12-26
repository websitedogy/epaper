import { useState, useEffect } from "react";
import ImageSlider from "./ImageSlider";
import PDFViewer from "./PDFViewer";
import { epaperAPI } from "../services/api";

const PapersDisplay = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customization, setCustomization] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        console.log('PapersDisplay: Fetched data response:', response);
        
        if (response && response.data) {
          // Set papers data
          setPapers(response.data.papers || []);
          
          // Handle customization data
          if (response.data.customization) {
            console.log('PapersDisplay: Setting customization:', response.data.customization);
            
            // Ensure socialMediaIcons exists in customization
            const customizationData = response.data.customization;
            
            // Get the selected style and social media styles from the response
            const selectedStyle = customizationData.selectedSocialMediaStyle || "style1";
            const socialMediaStyles = customizationData.socialMediaStyles || {};
            
            // Get the URLs for the selected style
            let urls = {};
            if (socialMediaStyles[selectedStyle] && socialMediaStyles[selectedStyle].icons) {
              urls = { ...socialMediaStyles[selectedStyle].icons };
            } else {
              // Default empty URLs
              urls = {
                facebook: "",
                whatsapp: "",
                instagram: "",
                linkedin: "",
                youtube: "",
                x: "",
                telegram: ""
              };
            }
            
            // Create the socialMediaIcons object with the correct structure
            customizationData.socialMediaIcons = {
              selectedStyle: selectedStyle,
              urls: urls,
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
                ]
              }
            };
            
            setCustomization(customizationData);
          } else {
            console.log('PapersDisplay: No customization data in response');
          }
        } else {
          setError("No data received from API");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Error fetching data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Papers</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  console.log("Papers data:", papers);

  // Get all papers (not just published ones) for debugging
  const allPapers = papers || [];
  
  // Try to get the latest paper regardless of published status
  const latestPaper = allPapers.length > 0 ? 
    allPapers.sort((a, b) => {
      const dateA = new Date(b.publishDate || b.createdAt || b.updatedAt || 0);
      const dateB = new Date(a.publishDate || a.createdAt || a.updatedAt || 0);
      return dateA - dateB;
    })[0] : null;
  
  console.log("Latest paper (any status):", latestPaper);

  if (!latestPaper) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Digital Newspaper
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your digital newspaper experience
        </p>
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
          <span className="text-gray-500">E-Paper Content Area</span>
        </div>
        {/* User-friendly message */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">No Editions Available</h3>
          <p className="text-blue-700">
            There are currently no newspaper editions available. Please check back later or contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  console.log("Paper images:", latestPaper.images);

  return (
    <div className="space-y-8">
      {/* Removed title and description */}
      
      {/* Display paper images or PDF */}
      {latestPaper.pdfUrl ? (
        // Show PDF viewer when PDF is available
        <PDFViewer pdfUrl={latestPaper.pdfUrl} customization={customization} />
      ) : latestPaper.images && latestPaper.images.length > 0 ? (
        <div>
          <ImageSlider images={latestPaper.images} customization={customization} />
        </div>
      ) : (
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex flex-col items-center justify-center">
          <span className="text-gray-500 mb-2">No content available</span>
          <span className="text-gray-400 text-sm">This edition doesn't have images or PDF</span>
        </div>
      )}
    </div>
  );
};

export default PapersDisplay;