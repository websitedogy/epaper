import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import { useParams } from "react-router-dom";
import PublicLayout from "./PublicLayout";
import { useCustomization } from "../contexts/CustomizationContext";

const CustomPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customization } = useCustomization();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        const customPage = response.data.pages?.find(
          (page) => page.slug === slug
        );
        setPageData(customPage || null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {pageData.title}
          </h1>

          {pageData.content ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          ) : (
            <p className="text-gray-600">
              This page is under construction. Please check back later.
            </p>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default CustomPage;