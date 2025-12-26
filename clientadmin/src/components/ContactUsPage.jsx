import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import PublicLayout from "./PublicLayout";
import { useCustomization } from "../contexts/CustomizationContext";

const ContactUsPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customization } = useCustomization();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        const contactPage = response.data.pages?.find(
          (page) => page.slug === "contact-us"
        );
        setPageData(contactPage || null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching page data:", error);
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {pageData?.title || "Contact Us"}
          </h1>

          {pageData?.content ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Content Coming Soon
              </h3>
              <p className="mt-1 text-gray-500">
                This page is under construction. Please check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContactUsPage;