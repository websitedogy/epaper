import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    categoryId: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setSubCategories(response.data.subCategories || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from name if not provided
      let subCategoryData = { ...formData };
      if (!subCategoryData.slug) {
        subCategoryData.slug = subCategoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (editingSubCategory) {
        // Update existing subcategory
        await epaperAPI.updateSubCategory(
          editingSubCategory._id,
          subCategoryData
        );
      } else {
        // Create new subcategory
        await epaperAPI.createSubCategory(subCategoryData);
      }

      // Reset form and refresh data
      setFormData({
        name: "",
        description: "",
        slug: "",
        categoryId: "",
        isActive: true,
        sortOrder: 0,
      });
      setEditingSubCategory(null);
      setShowModal(false);
      fetchSubCategories();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      description: subCategory.description,
      slug: subCategory.slug,
      categoryId: subCategory.categoryId,
      isActive: subCategory.isActive,
      sortOrder: subCategory.sortOrder,
    });
    setShowModal(true);
  };

  const handleDelete = async (subCategoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await epaperAPI.deleteSubCategory(subCategoryId);
        fetchSubCategories();
      } catch (error) {
        console.error("Error deleting subcategory:", error);
        alert(error.message);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSubCategory(null);
    setFormData({
      name: "",
      description: "",
      slug: "",
      categoryId: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sub Categories</h2>
          <p className="text-gray-600 mt-1">Manage your e-paper sub categories</p>
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
          Add Sub Category
        </button>
      </div>

      {/* Sub Categories Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
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
              {subCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sub categories found
                  </td>
                </tr>
              ) : (
                subCategories.map((subCategory) => {
                  const category = categories.find(
                    (cat) => cat._id === subCategory.categoryId
                  );
                  return (
                    <tr key={subCategory._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subCategory.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category ? category.name : "Unknown Category"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subCategory.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {subCategory.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subCategory.sortOrder}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subCategory.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subCategory.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(subCategory)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subCategory._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Sub Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSubCategory ? "Edit Sub Category" : "Add Sub Category"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Auto-generated from name if left empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingSubCategory
                    ? "Update Sub Category"
                    : "Add Sub Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;