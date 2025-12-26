import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const TodayEditionsTable = ({ papers }) => {
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPage, setEditingPage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (papers && papers.length > 0) {
      loadAllPages();
    } else {
      setLoading(false);
    }
  }, [papers]);

  const loadAllPages = () => {
    try {
      setLoading(true);
      const pagesArray = [];
      
      // Collect all pages from all papers
      papers.forEach((paper) => {
        if (paper.images && paper.images.length > 0) {
          paper.images.forEach((image) => {
            pagesArray.push({
              ...image,
              paperId: paper._id,
              paperTitle: paper.title,
              editionDate: paper.scheduleDate
            });
          });
        }
      });
      
      setAllPages(pagesArray);
      setError("");
    } catch (err) {
      setError("Failed to load today's pages. Please try again later.");
      console.error("Error loading pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewPage = (imageUrl) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const editPage = (page) => {
    setEditingPage(page);
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReplacePage = async () => {
    if (!selectedFile || !editingPage) {
      alert("Please select an image file");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("pageImage", selectedFile);

      const response = await epaperAPI.replacePage(
        editingPage.paperId,
        editingPage.page,
        formData
      );

      if (response.success) {
        alert("Page replaced successfully!");
        // Update the page in the local state
        setAllPages(prevPages => 
          prevPages.map(p => 
            p.paperId === editingPage.paperId && p.page === editingPage.page
              ? { ...p, imageUrl: response.data.imageUrl }
              : p
          )
        );
        setEditingPage(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error replacing page:", error);
      alert("Failed to replace page: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deletePage = async (page) => {
    if (window.confirm(`Are you sure you want to delete Page ${page.page} from ${page.paperTitle}?`)) {
      // In a real implementation, this would call an API to delete the page
      alert(`Delete functionality for page ${page.page} would be implemented here.`);
      // After successful deletion, reload pages
      // loadAllPages();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Today's Editions - All Pages</h2>
        <p className="text-gray-600 mt-1">All pages extracted from today's PDF uploads</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : allPages.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No pages found</p>
          <p className="text-gray-500">No pages were extracted from today's PDF uploads.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image Path
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPages.map((page, index) => (
                <tr key={`${page.paperId}-${page.page}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {page.imageUrl ? (
                      <img 
                        src={page.imageUrl} 
                        alt={`${page.paperTitle} - Page ${page.page}`} 
                        className="h-20 w-20 object-contain rounded border border-gray-300"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Page {page.page}</div>
                    <div className="text-xs text-gray-500">{page.paperTitle}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="max-w-xs truncate" title={page.imageUrl}>
                      {page.imageUrl || "No image path"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => viewPage(page.imageUrl)}
                        disabled={!page.imageUrl}
                        className={`px-3 py-1 rounded ${
                          page.imageUrl 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        View
                      </button>
                      <button
                        onClick={() => editPage(page)}
                        className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePage(page)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Replace Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Replace Page {editingPage.page}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Edition: {editingPage.paperTitle}
            </p>

            {/* Current Page Preview */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Page:
              </label>
              {editingPage.imageUrl && (
                <img
                  src={editingPage.imageUrl}
                  alt={`Current page ${editingPage.page}`}
                  className="w-full h-48 object-contain border border-gray-300 rounded"
                />
              )}
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Page Image:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Preview of Selected File */}
            {selectedFile && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </label>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-48 object-contain border border-gray-300 rounded"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingPage(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleReplacePage}
                disabled={!selectedFile || uploading}
                className={`px-4 py-2 rounded text-white ${
                  uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : selectedFile
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {uploading ? "Uploading..." : "Replace Page"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayEditionsTable;