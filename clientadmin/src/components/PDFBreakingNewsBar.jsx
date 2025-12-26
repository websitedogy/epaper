import { useState, useEffect } from "react";

const PDFBreakingNewsBar = ({ customization }) => {
  // Find only the second breaking news item (breaking-news-2) and check if it's enabled and has text
  const breakingNews2 = customization?.breakingNews?.find(news => news.id === "breaking-news-2");
  const currentNews = breakingNews2 && breakingNews2.enabled && breakingNews2.text ? breakingNews2 : null;
  
  // Don't render if no enabled news or no text
  if (!currentNews || !currentNews.text) {
    return null;
  }
  
  // Get animation duration based on speed setting
  const getAnimationDuration = (speed) => {
    switch (speed) {
      case "slow":
        return "30s";
      case "normal":
        return "15s";
      case "fast":
        return "10s";
      default:
        return "16s";
    }
  };
  
  // Render news content
  const renderNewsContent = () => {
    if (currentNews.linkUrl) {
      return (
        <a 
          href={currentNews.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline block"
          style={{
            color: currentNews.textColor || "#ffffff",
            fontSize: `${currentNews.fontSize || 16}px`,
            fontFamily: currentNews.fontFamily || "Arial, sans-serif",
          }}
        >
          {currentNews.text}
        </a>
      );
    }
    
    return (
      <span
        className="block"
        style={{
          color: currentNews.textColor || "#ffffff",
          fontSize: `${currentNews.fontSize || 16}px`,
          fontFamily: currentNews.fontFamily || "Arial, sans-serif",
        }}
      >
        {currentNews.text}
      </span>
    );
  };
  
  // Get animation duration
  const animationDuration = getAnimationDuration(currentNews.scrollSpeed);
  
  return (
    <div 
      className="w-full overflow-hidden whitespace-nowrap"
      style={{
        backgroundColor: currentNews.backgroundColor || "#dc2626",
        padding: "8px 0",
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="flex items-center">
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="inline-block whitespace-nowrap"
            style={{
              animation: `marquee ${animationDuration} linear infinite`,
              paddingLeft: '100%',
              paddingRight: '100%',
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            {renderNewsContent()}
          </div>
        </div>
      </div>
      
      {/* Add CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default PDFBreakingNewsBar;