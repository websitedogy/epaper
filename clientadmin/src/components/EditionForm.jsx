import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const EditionForm = ({ onClose, onEditionCreated, editingEdition }) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    subCategory: "",
    scheduleDate: "",
    scheduleTime: "",
    isPublished: false,
    pdf: null, // Add pdf field to form state
  });
  
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingEdition) {
      setFormData({
        title: editingEdition.title || "",
        slug: editingEdition.slug || "",
        description: editingEdition.description || "",
        category: editingEdition.category || "",
        subCategory: editingEdition.subCategory || "",
        scheduleDate: editingEdition.scheduleDate ? new Date(editingEdition.scheduleDate).toISOString().split('T')[0] : "",
        scheduleTime: editingEdition.scheduleTime || "",
        isPublished: editingEdition.isPublished || false,
        pdf: null, // Don't prefill pdf when editing
      });
    }
    
    // Fetch categories and subcategories
    fetchCategoriesAndSubCategories();
  }, [editingEdition]);

  const fetchCategoriesAndSubCategories = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setCategories(response.data.categories || []);
      setSubCategories(response.data.subCategories || []);
    } catch (error) {
      console.error("Error fetching categories and subcategories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
    
    // Clear error when user starts typing
    if (errors.title) {
      setErrors(prev => ({
        ...prev,
        title: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Epaper title is required";
    }
    
    // Slug is now optional
    // if (!formData.slug.trim()) {
    //   newErrors.slug = "Slug is required";
    // }
    
    // Description is now optional
    // if (!formData.description.trim()) {
    //   newErrors.description = "Description is required";
    // }
    
    // Category is required, but "none" is a valid option
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    // subCategory is optional, so no validation needed
    
    if (!formData.scheduleDate) {
      newErrors.scheduleDate = "Scheduled date is required";
    }
    
    if (!formData.scheduleTime) {
      newErrors.scheduleTime = "Scheduled time is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (editingEdition) {
        // For editing, we need to check if we're updating with a new PDF
        if (formData.pdf) {
          // Create FormData for file upload
          const formDataToSend = new FormData();
          formDataToSend.append("pdf", formData.pdf);
          
          // Add other fields as a JSON string
          const editionData = {
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            category: formData.category === "none" ? null : formData.category,
            subCategory: formData.subCategory,
            scheduleDate: new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString(),
            isPublished: formData.isPublished,
          };
          
          formDataToSend.append("data", JSON.stringify(editionData));
          
          // Update existing edition with file
          await epaperAPI.updatePaper(editingEdition._id, formDataToSend);
        } else {
          // Update without file
          const editionData = {
            ...formData,
            category: formData.category === "none" ? null : formData.category,
            scheduleDate: new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString()
          };
          await epaperAPI.updatePaper(editingEdition._id, editionData);

        }
      } else {
        // Create new edition
        if (formData.pdf) {
          // Create FormData for file upload
          const formDataToSend = new FormData();
          formDataToSend.append("pdf", formData.pdf);
          
          // Add other fields as a JSON string
          const editionData = {
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            category: formData.category === "none" ? null : formData.category,
            subCategory: formData.subCategory,
            scheduleDate: new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString(),
            isPublished: formData.isPublished,
          };
          
          formDataToSend.append("data", JSON.stringify(editionData));
          
          // Create new edition with file
          await epaperAPI.createPaper(formDataToSend);
        } else {
          // Create without file
          const editionData = {
            ...formData,
            category: formData.category === "none" ? null : formData.category,
            scheduleDate: new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString()
          };
          await epaperAPI.createPaper(editionData);
        }
      }
      
      onEditionCreated();
      onClose();
    } catch (error) {
      console.error("Error saving edition:", error);
      alert(error.message || "Failed to save edition");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async () => {
    // Set the schedule date to today and time to current time
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
    
    setFormData(prev => ({
      ...prev,
      isPublished: true,
      scheduleDate: today,
      scheduleTime: currentTime
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Epaper Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Epaper Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleTitleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            errors.title ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
          placeholder="Enter epaper title"
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.title}
          </p>
        )}
      </div>
      
      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            errors.slug ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
          placeholder="enter-epaper-title"
        />
        {errors.slug && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.slug}
          </p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            errors.description ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
          placeholder="Enter description"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.description}
          </p>
        )}
      </div>
      
      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
            errors.category ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        >
          <option value="">Select Category</option>
          <option value="none">None</option>
          {categories && categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.category}
          </p>
        )}
      </div>
      
      {/* Sub Category - Only show if a category (not "none") is selected */}
      {formData.category && formData.category !== "none" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sub Category
          </label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-400"
          >
            <option value="">Select Sub Category (optional)</option>
            {subCategories && subCategories
              .filter(subCat => !formData.category || subCat.categoryId === formData.category)
              .map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
          </select>
        </div>
      )}
      
      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          PDF Upload
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF (MAX. 100MB)
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                setFormData(prev => ({
                  ...prev,
                  pdf: file
                }));
              }}
            />
          </label>
        </div>
        {formData.pdf && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {formData.pdf.name} ({(formData.pdf.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
        {editingEdition && editingEdition.pdfUrl && !formData.pdf && (
          <p className="mt-2 text-sm text-gray-600">
            Current file: {editingEdition.pdfUrl.split('/').pop()}
          </p>
        )}
      </div>
      
      {/* Schedule Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Scheduled Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="scheduleDate"
            value={formData.scheduleDate}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
              errors.scheduleDate ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          />
          {errors.scheduleDate && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.scheduleDate}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Scheduled Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="scheduleTime"
            value={formData.scheduleTime}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
              errors.scheduleTime ? "border-red-500 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          />
          {errors.scheduleTime && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.scheduleTime}
            </p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            editingEdition ? "Update Edition" : "Save Edition"
          )}
        </button>
        
        {!editingEdition && (
          <button
            type="button"
            onClick={handlePublishNow}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              "Publish Now"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default EditionForm;