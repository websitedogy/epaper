import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { clippingsAPI } from "../services/api";

const ClippingPreview = () => {
  const [clipData, setClipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clipId } = useParams();

  useEffect(() => {
    const fetchClipData = async () => {
      if (!clipId) return;
      
      setLoading(true);
      try {
        // Fetch actual clipping data from backend
        const response = await clippingsAPI.getById(clipId);
        
        if (response.success && response.data) {
          const clipping = response.data;
          
          // Format the data for display
          const formattedClipData = {
            id: clipping.clipId,
            imageUrl: clipping.imageUrl,
            title: `E-Paper Clipping #${clipping.clipId}`,
            date: new Date(clipping.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            description: `This is clipping #${clipping.clipId} from our e-paper.`
          };
          
          setClipData(formattedClipData);
        } else {
          setError('Clip not found');
        }
      } catch (err) {
        setError('Clip not found');
        console.error('Error fetching clip data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clipId) {
      fetchClipData();
    }
  }, [clipId]);

  const handleDownload = () => {
    if (!clipData) return;
    
    // In a real implementation, this would download the actual high-res image
    const link = document.createElement('a');
    link.href = clipData.imageUrl;
    link.download = `clip-${clipId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'E-Paper Clip',
        text: 'Check out this clipping from the e-paper',
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          // Show visual feedback
          const originalText = document.getElementById('share-btn').textContent;
          document.getElementById('share-btn').textContent = 'Copied!';
          setTimeout(() => {
            document.getElementById('share-btn').textContent = originalText;
          }, 2000);
        })
        .catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          // Show visual feedback
          const originalText = document.getElementById('share-btn').textContent;
          document.getElementById('share-btn').textContent = 'Copied!';
          setTimeout(() => {
            document.getElementById('share-btn').textContent = originalText;
          }, 2000);
        });
    }
  };

  const handleGoToFullEpaper = () => {
    // Redirect to the main e-paper page
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clipping...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Clip Not Found</h2>
            <p className="text-gray-600 mb-6">
              The clipping you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleGoToFullEpaper}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Full E-Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* E-Paper Clip Tag */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              E-Paper Clip
            </span>
          </div>
          
          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="p-6 sm:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
                {clipData.title}
              </h1>
              <p className="text-gray-500 text-center mb-6">
                {clipData.date}
              </p>
              
              {/* Clipping Image */}
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-full">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full min-h-[300px] flex items-center justify-center">
                    <img
                      src={clipData.imageUrl}
                      alt="Clipped content"
                      className="w-full max-w-full h-auto rounded-lg fade-in"
                      style={{ 
                        minWidth: '300px', 
                        minHeight: '300px',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                      onLoad={(e) => {
                        e.target.classList.add('opacity-100');
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-center mb-8">
                {clipData.description}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                
                <button
                  id="share-btn"
                  onClick={handleShare}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
                
                <button
                  onClick={handleGoToFullEpaper}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Full E-Paper
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Telugu Jyothi Daily. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Fade-in animation style */}
      <style>{`
        .fade-in {
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
        }
        .opacity-100 {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ClippingPreview;