import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const DebugSocialMediaData = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        setLoading(true);
        console.log("=== DEBUG: Fetching epaper data ===");
        const response = await epaperAPI.getEpaper();
        console.log("=== DEBUG: Raw response ===", response);
        
        if (response && response.data && response.data.customization) {
          const customization = response.data.customization;
          console.log("=== DEBUG: Customization data ===", customization);
          
          // Log specific social media data
          console.log("=== DEBUG: socialLinks ===", customization.socialLinks);
          console.log("=== DEBUG: socialMediaStyles ===", customization.socialMediaStyles);
          console.log("=== DEBUG: selectedSocialMediaStyle ===", customization.selectedSocialMediaStyle);
          console.log("=== DEBUG: socialMediaIcons ===", customization.socialMediaIcons);
          
          // Check structure of socialLinks
          if (customization.socialLinks) {
            console.log("=== DEBUG: socialLinks.iconStyle ===", customization.socialLinks.iconStyle);
            console.log("=== DEBUG: socialLinks.links ===", customization.socialLinks.links);
          }
          
          // Check structure of socialMediaStyles
          if (customization.socialMediaStyles) {
            Object.keys(customization.socialMediaStyles).forEach(styleKey => {
              console.log(`=== DEBUG: socialMediaStyles[${styleKey}] ===`, customization.socialMediaStyles[styleKey]);
            });
          }
          
          setDebugData({
            fullResponse: response,
            customization: customization,
            socialLinks: customization.socialLinks,
            socialMediaStyles: customization.socialMediaStyles,
            selectedSocialMediaStyle: customization.selectedSocialMediaStyle,
            socialMediaIcons: customization.socialMediaIcons
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("=== DEBUG: Error fetching data ===", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Debugging Social Media Data</h2>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Loading debug data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Debugging Social Media Data</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Debugging Social Media Data</h2>
      
      {debugData && (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Full Response Structure</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.fullResponse, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Customization Data</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.customization, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Social Links</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.socialLinks, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Social Media Styles</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.socialMediaStyles, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Selected Social Media Style</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.selectedSocialMediaStyle, null, 2)}
            </pre>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Social Media Icons</h3>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(debugData.socialMediaIcons, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugSocialMediaData;