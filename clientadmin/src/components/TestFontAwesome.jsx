import { useState, useEffect } from "react";

const TestFontAwesome = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Font Awesome Test</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Direct Font Awesome Icons:</h2>
        <div className="flex gap-4">
          <i className="fab fa-facebook-f text-2xl"></i>
          <i className="fab fa-twitter text-2xl"></i>
          <i className="fab fa-instagram text-2xl"></i>
          <i className="fab fa-linkedin-in text-2xl"></i>
          <i className="fab fa-youtube text-2xl"></i>
          <i className="fab fa-whatsapp text-2xl"></i>
          <i className="fab fa-telegram-plane text-2xl"></i>
        </div>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Styled Icons:</h2>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
            <i className="fab fa-facebook-f text-white text-xl"></i>
          </div>
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <i className="fab fa-twitter text-white text-xl"></i>
          </div>
          <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center">
            <i className="fab fa-instagram text-white text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFontAwesome;