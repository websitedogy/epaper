import { useCustomization } from "../contexts/CustomizationContext";

const DebugCustomizationData = () => {
  const { customization, loading } = useCustomization();

  if (loading) {
    return <div>Loading customization data...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Customization Data Debug</h2>
      <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
        {JSON.stringify(customization, null, 2)}
      </pre>
    </div>
  );
};

export default DebugCustomizationData;