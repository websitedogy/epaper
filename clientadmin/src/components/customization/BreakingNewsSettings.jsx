import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BreakingNewsSettings = ({ customization, setCustomization, onSave, loading, newsId }) => {
  const [localCustomization, setLocalCustomization] = useState(customization);

  useEffect(() => {
    setLocalCustomization(customization);
  }, [customization]);

  // Find the breaking news item by ID
  const breakingNewsItem = localCustomization.breakingNews?.find(item => item.id === newsId) || {
    id: newsId,
    title: "",
    content: "",
    isActive: false,
    enabled: false,
    backgroundColor: "#dc2626",
    text: "",
    textColor: "#ffffff",
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    scrollSpeed: "normal",
    linkUrl: ""
  };

  const handleChange = (field, value) => {
    // Update the breaking news array
    const updatedBreakingNews = localCustomization.breakingNews?.map(item => {
      if (item.id === newsId) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    }) || [];

    // If the item doesn't exist, add it
    if (!localCustomization.breakingNews?.some(item => item.id === newsId)) {
      updatedBreakingNews.push({
        id: newsId,
        title: "",
        content: "",
        isActive: false,
        enabled: false,
        backgroundColor: "#dc2626",
        text: "",
        textColor: "#ffffff",
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        scrollSpeed: "normal",
        linkUrl: "",
        [field]: value
      });
    }

    setLocalCustomization({
      ...localCustomization,
      breakingNews: updatedBreakingNews
    });
  };

  const handleSave = () => {
    setCustomization(localCustomization);
    onSave(localCustomization);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enabled"
          checked={breakingNewsItem.enabled || false}
          onChange={(e) => handleChange("enabled", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
          Enable Breaking News
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Background Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={breakingNewsItem.backgroundColor || "#dc2626"}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={breakingNewsItem.backgroundColor || "#dc2626"}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Breaking News Text
            </label>
            <textarea
              value={breakingNewsItem.text || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
              placeholder="Enter breaking news text..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={breakingNewsItem.textColor || "#ffffff"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={breakingNewsItem.textColor || "#ffffff"}
                onChange={(e) => handleChange("textColor", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Letters Size (basic 16 px)
            </label>
            <input
              type="number"
              min="12"
              max="32"
              value={breakingNewsItem.fontSize || 16}
              onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={breakingNewsItem.fontFamily || "Arial, sans-serif"}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
              <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
              <option value="'Lucida Console', monospace">Lucida Console</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Auto-scroll Speed
            </label>
            <select
              value={breakingNewsItem.scrollSpeed || "normal"}
              onChange={(e) => handleChange("scrollSpeed", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              News Link URL
            </label>
            <input
              type="url"
              value={breakingNewsItem.linkUrl || ""}
              onChange={(e) => handleChange("linkUrl", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/news"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : `Save ${newsId === "breaking-news-2" ? "Breaking News 2" : "Breaking News 1"} Settings`}
        </button>
      </div>
    </div>
  );
};

export default BreakingNewsSettings;