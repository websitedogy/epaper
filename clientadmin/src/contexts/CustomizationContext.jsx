import { createContext, useContext, useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const CustomizationContext = createContext();

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error("useCustomization must be used within a CustomizationProvider");
  }
  return context;
};

export const CustomizationProvider = ({ children }) => {
  const [customization, setCustomization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customization data
  const fetchCustomization = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setCustomization(response.data.customization || null);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customization:", error);
      setLoading(false);
    }
  };

  // Update customization data
  const updateCustomization = (newCustomization) => {
    setCustomization(newCustomization);
  };

  useEffect(() => {
    fetchCustomization();
  }, []);

  const value = {
    customization,
    loading,
    fetchCustomization,
    updateCustomization
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};