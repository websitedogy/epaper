import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    metaDescription: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setPages(response.data.pages || []);

      // We no longer create default pages automatically to avoid duplication
      // About Us and Contact Us are handled by static routes
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from title if not provided
      let pageData = { ...formData };
      if (!pageData.slug) {
        pageData.slug = pageData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (editingPage) {
        await epaperAPI.updatePage(editingPage._id, pageData);
      } else {
        await epaperAPI.createPage(pageData);

        // Update menu visibility for the new page
        try {
          const epaperResponse = await epaperAPI.getEpaper();
          if (epaperResponse.data.customization) {
            const updatedCustomization = {
              ...epaperResponse.data.customization,
            };
            
            // Initialize menuVisibility if it doesn't exist
            if (!updatedCustomization.navbar.menuVisibility) {
              updatedCustomization.navbar.menuVisibility = { home: true };
            }
            
            // Add the new page to menu visibility with default value (false - not visible)
            if (
              !Object.prototype.hasOwnProperty.call(
                updatedCustomization.navbar.menuVisibility,
                pageData.slug
              )
            ) {
              updatedCustomization.navbar.menuVisibility[pageData.slug] = false;
              await epaperAPI.updateCustomization(updatedCustomization);
            }
          }
        } catch (customizationError) {
          console.error("Error updating menu visibility:", customizationError);
        }
      }

      // Reset form and refresh data
      setFormData({
        title: "",
        slug: "",
        content: "",
        metaDescription: "",
        isActive: true,
      });
      setEditingPage(null);
      setShowModal(false);
      fetchPages();
      toast.success("Page saved successfully!");
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error(error.message || "Failed to save page. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription,
      isActive: page.isActive,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;

    try {
      await epaperAPI.deletePage(pageToDelete._id);
      setPages(pages.filter(page => page._id !== pageToDelete._id));
      toast.success("Page deleted successfully!");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setPageToDelete(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPage(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      metaDescription: "",
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pages</h2>
          <p className="text-gray-600 mt-1">
            Manage your custom pages (About Us, Contact Us, etc.)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Page
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Navbar Integration:</strong> Pages created here can be added to your website's navbar. 
              Go to <Link to="/admin/customization/navbar" className="font-medium underline hover:text-blue-800">Navbar Settings</Link> to select which pages appear in the menu.
            </p>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meta Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No pages found
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {page.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {page.metaDescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          page.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {page.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(page)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(page)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete page"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Page
                </h3>
                <p className="mt-2 text-gray-600">
                  Are you sure you want to delete this page? This action cannot be undone.
                </p>
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Page Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPage ? "Edit Page" : "Add Page"}
                </h3>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. about-us"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Will be auto-generated from title if left empty. This will be the URL path for the page.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="metaDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, metaDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description for SEO purposes"
                  />
                </div>

                <div>
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Page Content
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter page content here..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Pages;