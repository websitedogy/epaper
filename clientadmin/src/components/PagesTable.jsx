import { useState, useEffect } from "react";
import PDFViewer from "./PDFViewer";
import { epaperAPI } from "../services/api";

const PagesTable = ({ pages, pdfUrl, onClose, paperTitle }) => {
  const [selectedPages, setSelectedPages] = useState([]);
  const [customization, setCustomization] = useState(null);

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

  // Calculate total storage used by all pages
  const calculateStorageUsage = () => {
    // In a real implementation, you would calculate actual storage used by images
    // For now, we'll just show a placeholder
    return pages.length * 2.5 * 1024 * 1024; // Assuming 2.5MB per page on average
  };

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get storage usage color based on usage percentage
  const getStorageColor = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024); // Convert to GB
    if (gb < 2) return 'text-green-500'; // Green zone (0-2GB)
    if (gb < 5) return 'text-blue-500';  // Blue zone (2-5GB)
    return 'text-red-500';               // Red zone (5GB+)
  };

  // Get storage bar color based on usage percentage
  const getStorageBarColor = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024); // Convert to GB
    if (gb < 2) return 'bg-green-500'; // Green zone (0-2GB)
    if (gb < 5) return 'bg-blue-500';  // Blue zone (2-5GB)
    return 'bg-red-500';               // Red zone (5GB+)
  };

  // Calculate storage percentage (assuming 10GB max for visualization)
  const calculateStoragePercentage = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024); // Convert to GB
    const percentage = (gb / 10) * 100; // Assuming 10GB max
    return Math.min(percentage, 100); // Cap at 100%
  };

  const handleSelectPage = (pageIndex) => {
    if (selectedPages.includes(pageIndex)) {
      setSelectedPages(selectedPages.filter(index => index !== pageIndex));
    } else {
      setSelectedPages([...selectedPages, pageIndex]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(pages.map((_, index) => index));
    }
  };

  const viewImage = (imageUrl) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const editImage = (pageIndex) => {
    // In a real implementation, this would open an image editor
    alert(`Edit functionality for page ${pageIndex + 1} would be implemented here.`);
  };

  const deleteImage = (pageIndex) => {
    if (window.confirm(`Are you sure you want to delete page ${pageIndex + 1}?`)) {
      // In a real implementation, this would call an API to delete the image
      alert(`Delete functionality for page ${pageIndex + 1} would be implemented here.`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pages for "{paperTitle}"</h2>
          <div className="flex items-center mt-2">
            <div className="flex items-center mr-4">
              <svg className="w-5 h-5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
              </svg>
              <span className={`font-medium ${getStorageColor(calculateStorageUsage())}`}>
                Water flow with {formatBytes(calculateStorageUsage())}
              </span>
            </div>
            <div className="text-gray-600">
              {pages.length} pages
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getStorageBarColor(calculateStorageUsage())}`} 
              style={{ width: `${calculateStoragePercentage(calculateStorageUsage())}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Green Zone (0-2GB)</span>
            <span>Blue Zone (2-5GB)</span>
            <span>Red Zone (5GB+)</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12">
          {pdfUrl ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Edition</h3>
                <p className="text-gray-600 mb-4">Viewing PDF pages horizontally:</p>
              </div>
              <PDFViewer pdfUrl={pdfUrl} customization={customization} />
            </div>
          ) : (
            <>
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No pages found</p>
              <p className="text-gray-500">PDF pages will be converted to images after uploading.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedPages.length === pages.length && pages.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Select All ({selectedPages.length} selected)
              </span>
            </div>
            {selectedPages.length > 0 && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedPages.length} selected pages?`)) {
                    // In a real implementation, this would call an API to delete the selected images
                    alert(`Delete functionality for selected pages would be implemented here.`);
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedPages.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Select</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page, index) => (
                  <tr key={`${page.page}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(index)}
                        onChange={() => handleSelectPage(index)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {page.imageUrl ? (
                        <img 
                          src={page.imageUrl} 
                          alt={`Page ${page.page}`} 
                          className="h-16 w-16 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewImage(page.imageUrl)}
                          disabled={!page.imageUrl}
                          className={`${
                            page.imageUrl 
                              ? "text-indigo-600 hover:text-indigo-900" 
                              : "text-gray-400 cursor-not-allowed"
                          } flex items-center`}
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => editImage(index)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => deleteImage(index)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PagesTable;