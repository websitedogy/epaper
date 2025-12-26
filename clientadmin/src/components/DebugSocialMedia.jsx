import { useState, useEffect } from "react";
import PublicSocialMediaIcons from "./PublicSocialMediaIcons";
import PublicSocialMediaLinks from "./PublicSocialMediaLinks";

const DebugSocialMedia = ({ customization }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Social Media Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Customization Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(customization, null, 2)}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">PublicSocialMediaLinks Component:</h2>
        <div className="border p-4 rounded">
          <PublicSocialMediaLinks customization={customization} />
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">PublicSocialMediaIcons Component:</h2>
        <div className="border p-4 rounded">
          <PublicSocialMediaIcons customization={customization} />
        </div>
      </div>
    </div>
  );
};

export default DebugSocialMedia;