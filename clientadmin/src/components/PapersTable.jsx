import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import PagesTable from "./PagesTable";

const PapersTable = ({ onClose }) => {
  const [papers, setPapers] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingPages, setViewingPages] = useState(null); // State to track which paper's pages are being viewed

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const response = await epaperAPI.getEpaper();
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total storage used by all PDF files
  const calculateStorageUsage = () => {
    return papers.reduce((total, paper) => {
      return total + (paper.pdfSize || 0);
    }, 0);
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

  const handleSelectPaper = (paperId) => {
    if (selectedPapers.includes(paperId)) {
      setSelectedPapers(selectedPapers.filter(id => id !== paperId));
    } else {
      setSelectedPapers([...selectedPapers, paperId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPapers.length === papers.length) {
      setSelectedPapers([]);
    } else {
      setSelectedPapers(papers.map(paper => paper._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedPapers.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedPapers.length} selected papers? They will be moved to the bin.`)) {
      try {
        // Delete each selected paper
        for (const paperId of selectedPapers) {
          await epaperAPI.deletePaper(paperId);
        }
        
        // Refresh papers list
        fetchPapers();
        
        // Clear selection
        setSelectedPapers([]);
        
        alert("Selected papers have been deleted and moved to the bin.");
      } catch (error) {
        console.error("Error deleting papers:", error);
        alert("Failed to delete some papers. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const viewPdf = (pdfUrl) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const viewPages = (paper) => {
    setViewingPages({
      pages: paper.images || [],
      paperTitle: paper.title,
      pdfUrl: paper.pdfUrl
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {viewingPages ? (
        <PagesTable 
          pages={viewingPages.pages} 
          pdfUrl={viewingPages.pdfUrl}
          paperTitle={viewingPages.paperTitle}
          onClose={() => setViewingPages(null)} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Editions</h2>
              <div className="flex items-center mt-2">
                <div className="flex items-center mr-4">
                  <svg className="w-5 h-5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                  </svg>
                  <span className={`font-medium ${getStorageColor(calculateStorageUsage())}`}>
                    Storage with {formatBytes(calculateStorageUsage())}
                  </span>
                </div>
                <div className="text-gray-600">
                  {papers.length} editions
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

          {papers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">No editions found</p>
              <p className="text-gray-500">Get started by creating a new paper edition.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPapers.length === papers.length && papers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Select All ({selectedPapers.length} selected)
                  </span>
                </div>
                {selectedPapers.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({selectedPapers.length})
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
                        Edition Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date and Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pages
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {papers.map((paper, index) => (
                      <tr key={paper._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPapers.includes(paper._id)}
                            onChange={() => handleSelectPaper(paper._id)}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{paper.category || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(paper.scheduleDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {paper.pageCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewPdf(paper.pdfUrl)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View PDF
                            </button>
                            <button
                              onClick={() => viewPages(paper)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              View Pages
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
        </>
      )}
    </div>
  );
};

export default PapersTable;