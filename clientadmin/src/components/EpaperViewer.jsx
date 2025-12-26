import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { epaperAPI } from "../services/api";
import PDFViewer from "./PDFViewer";
import PublicLayout from "./PublicLayout";

const EpaperViewer = () => {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customization, setCustomization] = useState(null);
  const location = useLocation();
  
  // Extract date from URL query parameters
  const getUrlParameter = (name) => {
    const params = new URLSearchParams(location.search);
    return params.get(name);
  };
  
  const date = getUrlParameter('date');

  useEffect(() => {
    const fetchPaperByDate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!date) {
          setError("No date specified");
          setLoading(false);
          return;
        }
        
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
          setError("Invalid date format. Use YYYY-MM-DD");
          setLoading(false);
          return;
        }
        
        // Check if epaper exists for this date
        const response = await epaperAPI.checkEpaperByDate(date);
        
        if (response.success && response.exists) {
          setPaper(response.paper);
        } else {
          setError(`No epaper found for date: ${date}`);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching paper:", error);
        setError(`Error fetching paper: ${error.message}`);
        setLoading(false);
      }
    };

    fetchPaperByDate();
  }, [date]);

  // Fetch customization data
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        if (response && response.data && response.data.customization) {
          setCustomization(response.data.customization);
        }
      } catch (error) {
        console.error("Error fetching customization:", error);
      }
    };

    fetchCustomization();
  }, []);

  if (loading) {
    return (
      <PublicLayout customization={customization}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout customization={customization}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading E-Paper</h2>
          <p className="text-red-600">{error}</p>
          <div className="mt-4">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back Home
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!paper) {
    return (
      <PublicLayout customization={customization}>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            No E-Paper Available
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            There is no e-paper available for the selected date.
          </p>
          <div className="mt-4">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Back Home
            </a>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout customization={customization}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            E-Paper for {date}
          </h1>
          {paper.title && (
            <p className="text-lg text-gray-600 mt-2">{paper.title}</p>
          )}
        </div>
        
        {paper.pdfUrl ? (
          <PDFViewer pdfUrl={paper.pdfUrl} customization={customization} />
        ) : paper.images && paper.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paper.images.map((image, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                {image.imageUrl ? (
                  <img 
                    src={image.imageUrl} 
                    alt={`Page ${image.page}`} 
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                    <span className="text-gray-500">Image not available</span>
                  </div>
                )}
                <div className="p-4 text-center">
                  <span className="text-sm font-medium text-gray-500">
                    Page {image.page || index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex flex-col items-center justify-center">
            <span className="text-gray-500 mb-2">No content available</span>
            <span className="text-gray-400 text-sm">This edition doesn't have images or PDF</span>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default EpaperViewer;