import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { clippingsAPI } from "../services/api";
import ClipPreviewLayout from "./ClipPreviewLayout";

const ClipPreviewPage = () => {
  const { id } = useParams();
  const [clipData, setClipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClip = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await clippingsAPI.getClipping(id);
        setClipData(response.data);
      } catch (err) {
        console.error("Error fetching clip:", err);
        setError("Clip not found.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClip();
    }
  }, [id]);

  if (loading) {
    return (
      <ClipPreviewLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clip...</p>
          </div>
        </div>
      </ClipPreviewLayout>
    );
  }

  if (error) {
    return (
      <ClipPreviewLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
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
          </div>
        </div>
      </ClipPreviewLayout>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ClipPreviewLayout>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Clip Preview
          </h1>
          
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl w-full">
              {clipData?.imageUrl ? (
                <>
                  <img
                    src={clipData.imageUrl}
                    alt="Clipped content"
                    className="w-full h-auto rounded-lg mx-auto"
                    style={{ maxWidth: '800px' }}
                  />
                  {/* Centered domain name, date, and page number */}
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600 mb-1">
                      {clipData.domainName || "Unknown Domain"}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {formatDate(clipData.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Page: {clipData.pageNumber || "N/A"}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No image available for this clip.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClipPreviewLayout>
  );
};

export default ClipPreviewPage;