import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const TestSocialMediaData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await epaperAPI.getEpaper();
        console.log("Full response:", response);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Social Media Data Test</h1>
      
      {data?.customization && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Customization Data</h2>
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(data.customization, null, 2)}
          </pre>
        </div>
      )}
      
      {data?.customization?.socialLinks && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Social Links Data</h2>
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(data.customization.socialLinks, null, 2)}
          </pre>
        </div>
      )}
      
      {data?.customization?.socialMediaStyles && (
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Social Media Styles Data</h2>
          <pre className="bg-white p-2 rounded overflow-auto">
            {JSON.stringify(data.customization.socialMediaStyles, null, 2)}
          </pre>
        </div>
      )}
      
      {data?.customization?.selectedSocialMediaStyle && (
        <div className="bg-yellow-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Selected Social Media Style</h2>
          <p className="text-lg">{data.customization.selectedSocialMediaStyle}</p>
        </div>
      )}
    </div>
  );
};

export default TestSocialMediaData;