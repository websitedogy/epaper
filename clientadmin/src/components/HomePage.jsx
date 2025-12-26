import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";
import PublicLayout from "./PublicLayout";
import PapersDisplay from "./PapersDisplay";
import { useCustomization } from "../contexts/CustomizationContext";

const HomePage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { customization } = useCustomization();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        const homePage = response.data.pages?.find(
          (page) => page.slug === "home"
        );
        setPageData(homePage || null);
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
    <PublicLayout customization={customization}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PapersDisplay />
      </div>
    </PublicLayout>
  );};

export default HomePage;