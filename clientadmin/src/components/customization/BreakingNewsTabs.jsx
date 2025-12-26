import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BreakingNewsSettings from "./BreakingNewsSettings";

const BreakingNewsTabs = ({ customization, setCustomization, onSave, loading }) => {
  const [activeTab, setActiveTab] = useState("breaking-news-1");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin/customization");
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
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Breaking News
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Breaking News Settings
            </h2>
            <p className="text-gray-600 mt-1">Customize breaking news display</p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Tab Switchers */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("breaking-news-1")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "breaking-news-1"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Breaking News 1
          </button>
          <button
            onClick={() => setActiveTab("breaking-news-2")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "breaking-news-2"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Breaking News 2
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <BreakingNewsSettings
          customization={customization}
          setCustomization={setCustomization}
          onSave={onSave}
          loading={loading}
          newsId={activeTab}
        />
      </div>
    </div>
  );
};

export default BreakingNewsTabs;