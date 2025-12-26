import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import PublicFooter from "./PublicFooter";
import { epaperAPI } from "../services/api";

const ClipPreviewLayout = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customization, setCustomization] = useState(null);

  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        if (response && response.data && response.data.customization) {
          setCustomization(response.data.customization);
        }
      } catch (error) {
        console.error("Error fetching customization:", error);
      }
    };
    
    fetchCustomization();
  }, []);

  // Determine logo alignment based on logoPosition setting
  const getLogoAlignment = () => {
    switch (customization?.navbar?.logoPosition) {
      case "Center":
        return "justify-center";
      case "Right":
        return "justify-end";
      default:
        return "justify-between"; // Changed to justify-between to accommodate hamburger menu
    }
  };

  // Get active pages for navigation
  const activePages = (customization?.pages || []).filter(page => page.isActive);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar - WITHOUT Breaking News Bar */}
      <nav
        className="bg-white shadow-sm"
        style={{
          backgroundColor: customization?.navbar?.backgroundColor || "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex ${getLogoAlignment()} items-center py-2`}>
            {/* Logo */}
            <div className="flex items-center">
              {customization?.navbar?.logoUrl ? (
                <>
                  {/* Desktop/Tablet logo */}
                  <img
                    className="object-contain hidden sm:block"
                    src={customization.navbar.logoUrl}
                    alt="Logo"
                    style={{
                      maxHeight: `${Math.max(90, Math.min(120, customization?.navbar?.logoSizePx || 120))}px`,
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
                      maxHeight: `${Math.max(70, Math.min(90, (customization?.navbar?.logoSizePx || 120) * 0.75))}px`,
                      width: 'auto',
                      objectFit: 'contain',
                      minWidth: '70px',
                    }}
                  />
                </>
              ) : (
                <span
                  className="text-xl font-bold"
                  style={{
                    color: customization?.navbar?.textColor || "#000000",
                  }}
                >
                  {customization?.navbar?.name || "E-Paper"}
                </span>
              )}
            </div>

            {/* Hamburger Menu Icon for Mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            {/* Navigation Links - Desktop (Hidden on mobile) */}
            {customization?.navbar?.logoPosition !== "Center" && (
              <div className="hidden md:flex items-center space-x-8">
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

export default ClipPreviewLayout;