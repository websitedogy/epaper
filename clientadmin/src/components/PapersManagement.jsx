import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import EditionForm from "./EditionForm";
import TodayEditionsTable from "./TodayEditionsTable";

const PapersManagement = () => {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTodayEditions, setShowTodayEditions] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all, today, scheduled
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    scheduleDate: "",
    scheduleTime: "",
    pdf: null,
    pdfUrl: "",
    pdfSize: 0,
  });

  useEffect(() => {
    fetchPapers();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPapers = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setPapers(response.data.papers || []);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (key !== "pdf") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files if present
      if (formData.pdf) {
        formDataToSend.append("pdf", formData.pdf);
      }

      // Add form data as JSON string
      formDataToSend.append(
        "data",
        JSON.stringify({
          title: formData.title,
          category: formData.category,
          scheduleDate: formData.scheduleDate,
          scheduleTime: formData.scheduleTime,
          pdfUrl: formData.pdfUrl,
          pdfSize: formData.pdfSize,
        })
      );

      if (editingPaper) {
        await epaperAPI.updatePaper(editingPaper._id, formDataToSend);
      } else {
        await epaperAPI.createPaper(formDataToSend);
      }

      fetchPapers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      scheduleDate: "",
      scheduleTime: "",
      pdf: null,
      pdfUrl: "",
      pdfSize: 0,
    });
  };

  const openCreateModal = () => {
    setEditingPaper(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title || "",
      category: paper.category || "",
      scheduleDate: paper.scheduleDate ? new Date(paper.scheduleDate).toISOString().split('T')[0] : "",
      scheduleTime: paper.scheduleTime || "",
      pdf: null,
      pdfUrl: paper.pdfUrl || "",
      pdfSize: paper.pdfSize || 0,
    });
    setShowModal(true);
  };

  const openTodayEditions = (paperId) => {
    setSelectedPaperId(paperId);
    setShowTodayEditions(true);
  };

  const handleDelete = async (paperId) => {
    if (window.confirm("Are you sure you want to delete this paper?")) {
      try {
        await epaperAPI.deletePaper(paperId);
        fetchPapers();
      } catch (error) {
        console.error("Error deleting paper:", error);
        alert("Failed to delete paper");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  // Filter papers based on active tab
  const getFilteredPapers = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (activeTab) {
      case "today":
        return papers.filter(paper => {
          if (!paper.scheduleDate) return false;
          const paperDate = new Date(paper.scheduleDate);
          const paperDay = new Date(paperDate.getFullYear(), paperDate.getMonth(), paperDate.getDate());
          return paperDay.getTime() === today.getTime();
        });
      case "scheduled":
        return papers.filter(paper => {
          if (!paper.scheduleDate) return false;
          const paperDate = new Date(paper.scheduleDate);
          const paperDay = new Date(paperDate.getFullYear(), paperDate.getMonth(), paperDate.getDate());
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return paperDay >= tomorrow;
        });
      default: // all
        return papers;
    }
  };

  // Show today editions table
  if (showTodayEditions) {
    return (
      <TodayEditionsTable 
        paperId={selectedPaperId} 
        onClose={() => setShowTodayEditions(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-Papers Management</h2>
          <p className="text-gray-600 mt-1">Manage your e-paper editions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Edition
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Editions
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "today"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Today Editions
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "scheduled"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Scheduled Editions
          </button>
        </nav>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredPapers().length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">No papers found</p>
            <p className="text-gray-500">
              {activeTab === "today" 
                ? "No papers scheduled for today." 
                : activeTab === "scheduled" 
                ? "No papers scheduled for the future." 
                : "Get started by creating a new paper edition."}
            </p>
          </div>
        ) : (
          getFilteredPapers().map((paper) => (
            <div key={paper._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 truncate">
                    {paper.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(paper)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(paper._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(paper.scheduleDate)}</span>
                    {paper.scheduleTime && (
                      <span className="ml-2">at {formatTime(paper.scheduleTime)}</span>
                    )}
                  </div>
                  
                  {paper.category && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span>Category: {paper.category}</span>
                    </div>
                  )}
                  
                  {paper.pageCount > 0 && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{paper.pageCount} pages</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => openTodayEditions(paper._id)}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                  >
                    Today Editions
                  </button>
                  <button
                    onClick={() => openEditModal(paper)}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edition Form Modal */}
      {showModal && (
        <EditionForm
          onClose={() => setShowModal(false)}
          onEditionCreated={() => {
            fetchPapers();
            // Automatically switch to the correct tab based on the scheduled date
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Check if we have papers and the last paper has a schedule date
            if (papers.length > 0) {
              const lastPaper = papers[papers.length - 1];
              if (lastPaper.scheduleDate) {
                const paperDate = new Date(lastPaper.scheduleDate);
                const paperDay = new Date(paperDate.getFullYear(), paperDate.getMonth(), paperDate.getDate());
                
                if (paperDay.getTime() === today.getTime()) {
                  setActiveTab("today");
                } else if (paperDay > today) {
                  setActiveTab("scheduled");
                }
              }
            }
          }}
          editingEdition={editingPaper}
          categories={categories}
        />
      )}
    </div>
  );
};

export default PapersManagement;