import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PublicFooter from "./PublicFooter";
import PublicSocialMediaIcons from "./PublicSocialMediaIcons";
import PublicSocialMediaLinks from "./PublicSocialMediaLinks";
import { epaperAPI } from "../services/api";
import { useCustomization } from "../contexts/CustomizationContext";
import BreakingNewsBar from "./BreakingNewsBar";

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePages, setActivePages] = useState([]);
  const { customization, loading } = useCustomization();

  // Get active pages
  useEffect(() => {
    const fetchActivePages = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        const pages = response.data.pages || [];
        const active = pages.filter(page => page.isActive);
        setActivePages(active);
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    };

    fetchActivePages();
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Breaking News Bar - Shown above navbar */}
      <BreakingNewsBar customization={customization} />
      
      {/* Navigation Bar */}
      <nav
        className="bg-white shadow-sm border-b"
        style={{
          backgroundColor: customization?.navbar?.backgroundColor || "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo and Home Link */}
            <div className="flex items-center">
              {customization?.navbar?.logoUrl && (
                <Link to="/" className="flex-shrink-0 flex items-center">
                  {/* Desktop/Tablet logo */}
                  <img
                    className="object-contain hidden sm:block"
                    src={customization.navbar.logoUrl}
                    alt="Logo"
                    style={{
                      maxHeight: `${Math.max(90, Math.min(120, customization.navbar.logoSizePx || 120))}px`,
                      width: 'auto',
                      objectFit: 'contain',
                      minWidth: '90px',
                    }}
                  />
                  {/* Mobile logo - slightly smaller but still prominent */}
                  <img
                    className="object-contain sm:hidden"
                    src={customization.navbar.logoUrl}
                    alt="Logo"
                    style={{
                      maxHeight: `${Math.max(70, Math.min(90, (customization.navbar.logoSizePx || 120) * 0.75))}px`,
                      width: 'auto',
                      objectFit: 'contain',
                      minWidth: '70px',
                    }}
                  />
                </Link>
              )}
              {!customization?.navbar?.logoUrl && (
                <Link
                  to="/"
                  className="text-xl font-bold"
                  style={{
                    color: customization?.navbar?.textColor || "#000000",
                  }}
                >
                  {customization?.navbar?.name || "E-Paper"}
                </Link>
              )}
            </div>

            {/* Desktop Navigation - Left aligned when logo is center/right */}
            {(customization?.navbar?.logoPosition === "Center" ||
              customization?.navbar?.logoPosition === "Right") && (
              <div className="hidden md:flex items-center space-x-6">
                {/* Home link - always shown if visible */}
                {(customization?.navbar?.menuVisibility?.home ?? true) && (
                  <Link
                    to="/"
                    className={`font-medium ${
                      location.pathname === "/"
                        ? "underline"
                        : "hover:underline"
                    }`}
                    style={{
                      color: customization?.navbar?.textColor || "#000000",
                    }}
                  >
                    Home
                  </Link>
                )}
                
                {/* Custom pages */}
                {activePages.map((page) => (
                  (customization?.navbar?.menuVisibility?.[page.slug] ?? false) && (
                    <Link
                      key={page._id}
                      to={`/${page.slug}`}
                      className={`font-medium ${
                        location.pathname === `/${page.slug}`
                          ? "underline"
                          : "hover:underline"
                      }`}
                      style={{
                        color: customization?.navbar?.textColor || "#000000",
                      }}
                    >
                      {page.title}
                    </Link>
                  )
                ))}
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                style={{
                  color: customization?.navbar?.textColor || "#000000",
                }}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation - Right aligned when logo is left/center */}
            {customization?.navbar?.logoPosition !== "Right" && (
              <div className="hidden md:flex items-center space-x-6">
                {/* Home link - always shown if visible */}
                {(customization?.navbar?.menuVisibility?.home ?? true) && (
                  <Link
                    to="/"
                    className={`font-medium ${
                      location.pathname === "/"
                        ? "underline"
                        : "hover:underline"
                    }`}
                    style={{
                      color: customization?.navbar?.textColor || "#000000",
                    }}
                  >
                    Home
                  </Link>
                )}
                
                {/* Custom pages */}
                {activePages.map((page) => (
                  (customization?.navbar?.menuVisibility?.[page.slug] ?? false) && (
                    <Link
                      key={page._id}
                      to={`/${page.slug}`}
                      className={`font-medium ${
                        location.pathname === `/${page.slug}`
                          ? "underline"
                          : "hover:underline"
                      }`}
                      style={{
                        color: customization?.navbar?.textColor || "#000000",
                      }}
                    >
                      {page.title}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu (shown when hamburger is clicked) */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Home link - always shown if visible */}
              {(customization?.navbar?.menuVisibility?.home ?? true) && (
                <Link
                  to="/"
                  onClick={closeMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === "/"
                      ? "bg-gray-100 underline"
                      : "hover:bg-gray-50 hover:underline"
                  }`}
                  style={{
                    color: customization?.navbar?.textColor || "#000000",
                  }}
                >
                  Home
                </Link>
              )}
              
              {/* Custom pages */}
              {activePages.map((page) => (
                (customization?.navbar?.menuVisibility?.[page.slug] ?? false) && (
                  <Link
                    key={page._id}
                    to={`/${page.slug}`}
                    onClick={closeMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === `/${page.slug}`
                        ? "bg-gray-100 underline"
                        : "hover:bg-gray-50 hover:underline"
                    }`}
                    style={{
                      color: customization?.navbar?.textColor || "#000000",
                    }}
                  >
                    {page.title}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Show navigation links below navbar when logo is centered */}
      {customization?.navbar?.logoPosition === "Center" && (
        <div className="bg-white border-b hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-2 overflow-x-auto">
              {/* Home link - always shown if visible */}
              {(customization?.navbar?.menuVisibility?.home ?? true) && (
                <Link
                  to="/"
                  className={`font-medium whitespace-nowrap ${
                    location.pathname === "/"
                      ? "underline"
                      : "hover:underline"
                  }`}
                  style={{
                    color: customization?.navbar?.textColor || "#000000",
                  }}
                >
                  Home
                </Link>
              )}
              
              {/* Custom pages */}
              {activePages.map((page) => (
                (customization?.navbar?.menuVisibility?.[page.slug] ?? false) && (
                  <Link
                    key={page._id}
                    to={`/${page.slug}`}
                    className={`font-medium whitespace-nowrap ${
                      location.pathname === `/${page.slug}`
                        ? "underline"
                        : "hover:underline"
                    }`}
                    style={{
                      color: customization?.navbar?.textColor || "#000000",
                    }}
                  >
                    {page.title}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content & Logo Section */}

      {/* Social Media Links and Icons - REMOVED to avoid duplication */}
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      {/* Promotional Banners - Display above footer if active and has image */}
      {customization?.promotionalBanners?.filter(banner => banner.isActive && banner.imageUrl).map((banner, index) => (
        <div key={banner.id || index} className="w-full flex justify-center bg-gray-100 py-4">
          <a 
            href={banner.redirectUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block max-w-4xl w-full px-4"
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.title || `Promotional Banner ${index + 1}`} 
              className="w-full h-auto object-contain max-h-40"
            />
          </a>
        </div>
      ))}

      {/* Footer */}
      <PublicFooter customization={customization} />
    </div>
  );
};

export default PublicLayout;