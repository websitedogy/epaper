import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

// Lazy load the RichTextEditor to prevent blocking
const RichTextEditor = lazy(() => import('./RichTextEditor'));

const FooterSettings = ({ customization, setCustomization, onSave, loading }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);

  useEffect(() => {
    // Ensure footer object exists with defaults
    if (customization) {
      const customizationWithDefaults = {
        ...customization,
        footer: {
          contentText: "",
          ...customization.footer,
        },
      };
      setLocalCustomization(customizationWithDefaults);
    }
  }, [customization]);

  const handleChange = (field, value) => {
    setLocalCustomization({
      ...localCustomization,
      footer: {
        ...localCustomization.footer,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    setCustomization(localCustomization);
    onSave(localCustomization);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/admin/customization" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Customization
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Footer Settings</span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Footer Settings
        </h2>
        <p className="text-gray-600 mt-1">Customize your website footer content with rich text formatting</p>
      </div>

      {/* Rich Text Editor Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {!localCustomization || !localCustomization.footer ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading footer settings...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Footer Content (Rich Text Editor)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Use the toolbar below to format your footer content. You can add text formatting, headings, lists, links, images, colors, and more - just like in Microsoft Word.
              </p>
              <Suspense fallback={
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-500">Loading editor...</p>
                </div>
              }>
                <RichTextEditor
                  content={localCustomization.footer.contentText || ""}
                  onChange={(html) => handleChange("contentText", html)}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default FooterSettings;