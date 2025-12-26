import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import CalendarPopup from "./CalendarPopup";
import { clippingsAPI, epaperAPI } from "../services/api";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaTwitter,
  FaTelegramPlane
} from "react-icons/fa";// Set up the worker for react-pdf using the local worker file
import { pdfjs } from "react-pdf";
// Configure PDF.js 
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
// Disable worker for simpler rendering
pdfjs.GlobalWorkerOptions.disableWorker = true;

const PDFViewer = ({ pdfUrl, onLoadSuccess, onLoadError, onCropChange, customization: propCustomization }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const lastScaleUpdate = useRef(0); // Track last scale update time for performance optimization
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);
  const [isClipping, setIsClipping] = useState(false);
  const [clipBox, setClipBox] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clippings, setClippings] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false); // State for page selector dropdown
  const [customization, setCustomization] = useState(null); // Add customization state
  const pdfContentRef = useRef(null);
  const pageRef = useRef(null);
  const calendarButtonRef = useRef(null);
  
  // Check if device is mobile with more accurate detection
  const isMobile = (() => {
    // Check for touch capability and screen size
    const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const isSmallScreen = windowWidth < 480; // Changed to 480px for better mobile detection
    
    // More precise mobile detection
    const isMobileDevice = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // For mobile view, we'll consider it mobile if it's a small screen regardless of touch capability
    // This ensures mobile view is applied for small screens even on devices without touch
    return isSmallScreen || isMobileDevice;
  })();
  
  // Calculate dynamic device pixel ratio based on scale for better text quality on zoom
  const getDynamicDevicePixelRatio = () => {
    if (!isMobile) return window.devicePixelRatio || 1;
    
    // Use device pixel ratio for better text clarity, especially when zooming out
    const deviceRatio = window.devicePixelRatio || 1;
            
    // Enhanced resolution when zooming out to maintain text clarity
    if (scale < 1.0) {
      // Increase ratio significantly when zooming out to maintain sharpness
      // Enhanced formula for better resolution when zoomed out
      return deviceRatio * Math.min(4.0, (1 / scale) * 2.5);
    } else if (scale > 2.0) {
      return deviceRatio * 1.5; // Higher ratio for deep zoom
    } else if (scale > 1.5) {
      return deviceRatio * 1.3; // Medium zoom
    } else if (scale > 1.0) {
      return deviceRatio * 1.1; // Light zoom
    }
            
    return deviceRatio; // Default scale (1.0)
  };
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Only force re-render if we're not actively zooming
      if (scale === 1.0) {
        setScale(1.01);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scale]);

  // Handle device pixel ratio changes for better text quality
  useEffect(() => {
    const handlePixelRatioChange = () => {
      // Force re-render when device pixel ratio changes
      setScale(prevScale => prevScale === 1.0 ? 1.01 : 1.0);
    };

    // Listen for device orientation changes which might affect pixel ratio
    window.addEventListener('orientationchange', handlePixelRatioChange);
    
    return () => {
      window.removeEventListener('orientationchange', handlePixelRatioChange);
    };
  }, []);

  // Optimize text rendering when scale changes
  useEffect(() => {
    // Performance optimization: Debounce rapid scale changes
    const now = Date.now();
    if (now - lastScaleUpdate.current < 100) {
      // Skip update if less than 100ms since last update
      return;
    }
    lastScaleUpdate.current = now;
    
    // When scale changes, adjust rendering for better text quality on mobile while preserving original content
    // Only apply on mobile devices to prevent interference with desktop rendering
    if (isMobile) {
      const currentPage = document.querySelector('.react-pdf__Page');
      if (currentPage) {
        // Add CSS classes for basic text rendering
        currentPage.classList.add('mobile-pdf-page');
        
        // Apply only essential styles to preserve original content and enhance resolution when zoomed out
        currentPage.style.webkitTransform = 'translateZ(0)';
        
        // Use crisp edges for better text quality, especially when zooming out
        // Enhanced image rendering for better resolution when zoomed out
        currentPage.style.imageRendering = scale < 1.0 ? 'crisp-edges' : 'auto';
        currentPage.style.textRendering = scale < 1.0 ? 'optimizeLegibility' : 'geometricPrecision';
        // Additional property for better text rendering on high DPI displays
        if (scale < 1.0) {
          currentPage.style.webkitFontSmoothing = 'antialiased';
          currentPage.style.mozOsxFontSmoothing = 'grayscale';
          // Additional enhancements for zoomed-out text clarity
          currentPage.style.fontKerning = 'normal';
          currentPage.style.textOrientation = 'mixed';
        }
      }
      
      // Cleanup function to remove the class when component unmounts
      return () => {
        const currentPage = document.querySelector('.react-pdf__Page');
        if (currentPage) {
          currentPage.classList.remove('mobile-pdf-page');
          // Reset styles on cleanup
          currentPage.style.imageRendering = '';
          currentPage.style.textRendering = '';
          currentPage.style.webkitTransform = '';
          currentPage.style.webkitFontSmoothing = '';
          currentPage.style.mozOsxFontSmoothing = '';
        }
      };
    }
  }, [scale, isMobile]);  // Specifically enhance paragraph text on mobile devices
  useEffect(() => {
    if (!isMobile) return;
    
    // Text layer enhancement is disabled since text selection is disabled
    const enhanceParagraphText = () => {
      // No text layer enhancements needed when text selection is disabled
    };
    
    // Run enhancement after a short delay to ensure DOM is ready
    const timer = setTimeout(enhanceParagraphText, 100);
    
    // No dynamic enhancement needed since text selection is disabled
    const scaleTimer = null;
    
    return () => {
      clearTimeout(timer);
      clearTimeout(scaleTimer);
      // No text layer cleanup needed since text selection is disabled
    };
  }, [isMobile, pageNumber, scale]);  // Additional canvas rendering improvements for paragraph text clarity
  useEffect(() => {
    if (!isMobile) return;
    
    // Enhanced canvas rendering for better text quality, especially when zooming out
    const enhanceCanvasRendering = () => {
      const canvasElements = document.querySelectorAll('.react-pdf__Page canvas');
      canvasElements.forEach(canvas => {
        // Apply high-quality rendering context settings
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Additional settings for better text rendering
          ctx.textBaseline = 'alphabetic';
          ctx.textAlign = 'left';
          ctx.textRendering = 'optimizeLegibility';
          
          // For high DPI displays, ensure proper scaling, especially enhance when zoomed out
          const dpr = window.devicePixelRatio || 1;
          // Enhanced scaling formula for better resolution when zoomed out
          const enhancedDpr = scale < 1.0 ? dpr * Math.min(4.0, (1 / scale) * 2.5) : dpr;
          ctx.scale(enhancedDpr, enhancedDpr);
        }
      });
    };
    
    // Run after a delay to ensure canvas is rendered
    const timer = setTimeout(enhanceCanvasRendering, 150);
    
    return () => {
      clearTimeout(timer);
    };
  }, [isMobile, pageNumber, scale]);
  // Fetch customization data when component mounts if not provided via props
  useEffect(() => {
    // If customization is provided via props, use it
    if (propCustomization) {
      console.log('Using propCustomization:', propCustomization);
      setCustomization(propCustomization);
      return;
    }
    
    // Otherwise fetch customization from API
    const fetchCustomization = async () => {
      try {
        console.log('Fetching customization data from API...');
        const response = await epaperAPI.getEpaper();
        if (response && response.data && response.data.customization) {
          // Log the customization data for debugging
          console.log('Fetched customization data:', response.data.customization);
          console.log('SocialLinks data:', response.data.customization.socialLinks);
          setCustomization(response.data.customization);
        } else {
          console.log('No customization data found in response');
        }
      } catch (error) {
        console.error("Error fetching customization:", error);
      }
    };

    fetchCustomization();
  }, [propCustomization]);

  // Function to render social media icons with selected style
  const renderSocialMediaIcons = (customization) => {
    // Log the customization data for debugging
    console.log('renderSocialMediaIcons called with customization:', customization);
    
    // Check if customization exists and has social media data
    if (!customization || !customization.socialMediaStyles) {
      console.log('No socialMediaStyles data found');
      return null;
    }
    
    // Get the selected social media style
    const selectedStyleKey = customization.selectedSocialMediaStyle || "style1";
    
    // Map platform keys to React Icons components
    const iconMap = {
      facebook: FaFacebookF,
      whatsapp: FaWhatsapp,
      instagram: FaInstagram,
      linkedin: FaLinkedinIn,
      youtube: FaYoutube,
      x: FaTwitter,
      telegram: FaTelegramPlane
    };
    
    // Single source of truth mapping between DB style keys and frontend style definitions
    const STYLE_MAP = {
      style1: {
        name: "Circle Icons",
        description: "Classic circular icons with brand colors",
        platforms: [
          { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#1877F2", shape: "circle" },
          { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#25D366", shape: "circle" },
          { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#E4405F", shape: "circle" },
          { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#0A66C2", shape: "circle" },
          { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FF0000", shape: "circle" },
          { name: "X", key: "x", color: "#000000", bgColor: "#000000", shape: "circle" },
          { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#0088CC", shape: "circle" }
        ]
      },
      style2: {
        name: "Square Outline",
        description: "Squared icons with outline borders",
        platforms: [
          { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
          { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
          { name: "X", key: "x", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
          { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
          { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
          { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
          { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
        ]
      },
      style3: {
        name: "Rounded Gradient",
        description: "Rounded icons with gradient backgrounds",
        platforms: [
          { name: "Instagram", key: "instagram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)", shape: "rounded" },
          { name: "Facebook", key: "facebook", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #1877F2, #0C5FC4)", shape: "rounded" },
          { name: "X", key: "x", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #000000, #333333)", shape: "rounded" },
          { name: "LinkedIn", key: "linkedin", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0A66C2, #004E92)", shape: "rounded" },
          { name: "YouTube", key: "youtube", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #FF0000, #CC0000)", shape: "rounded" },
          { name: "WhatsApp", key: "whatsapp", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #25D366, #128C7E)", shape: "rounded" },
          { name: "Telegram", key: "telegram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0088CC, #006699)", shape: "rounded" }
        ]
      },
      style4: {
        name: "Flat Minimal",
        description: "Simple flat icons with subtle backgrounds",
        platforms: [
          { name: "X", key: "x", color: "#000000", bgColor: "#F0F0F0", shape: "flat" },
          { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FFE5E5", shape: "flat" },
          { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#FEEBEF", shape: "flat" },
          { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#E6F0FF", shape: "flat" },
          { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#E3EEFF", shape: "flat" },
          { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#E5F8ED", shape: "flat" },
          { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#E0F4FF", shape: "flat" }
        ]
      },
      style5: {
        name: "Shadow Effect",
        description: "Icons with drop shadows and hover effects",
        platforms: [
          { name: "Telegram", key: "telegram", color: "#0088CC", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 136, 204, 0.3)", shape: "shadow" },
          { name: "WhatsApp", key: "whatsapp", color: "#25D366", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(37, 211, 102, 0.3)", shape: "shadow" },
          { name: "Facebook", key: "facebook", color: "#1877F2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(24, 119, 242, 0.3)", shape: "shadow" },
          { name: "Instagram", key: "instagram", color: "#E4405F", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(228, 64, 95, 0.3)", shape: "shadow" },
          { name: "X", key: "x", color: "#000000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 0, 0, 0.3)", shape: "shadow" },
          { name: "LinkedIn", key: "linkedin", color: "#0A66C2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(10, 102, 194, 0.3)", shape: "shadow" },
          { name: "YouTube", key: "youtube", color: "#FF0000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(255, 0, 0, 0.3)", shape: "shadow" }
        ]
      }
    };
    
    // Use the DB value to get the active style with fallback
    const activeStyle = STYLE_MAP[selectedStyleKey] || STYLE_MAP.style1;
    
    // Get URLs from customization
    const socialMediaUrls = customization.socialMediaStyles[selectedStyleKey]?.icons || {};
    
    // Check if any URLs exist for this style
    const hasUrls = Object.values(socialMediaUrls).some(url => url);
    console.log('Has URLs:', hasUrls);
    if (!hasUrls) {
      console.log('No URLs found');
      return null;
    }
    
    // Filter platforms that have URLs and render icons
    const filteredPlatforms = activeStyle.platforms.filter(platform => socialMediaUrls[platform.key]);
    console.log('Filtered platforms:', filteredPlatforms);
    
    // If no platforms have URLs, return null
    if (filteredPlatforms.length === 0) {
      console.log('No platforms with URLs found');
      return null;
    }
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: windowWidth <= 576 ? '10px' : '16px', // Smaller gap on mobile
        padding: '0',
        margin: '0',
        flexWrap: 'nowrap', // Prevent wrapping to keep icons in one row
        overflowX: 'auto' // Allow horizontal scrolling on small screens
      }}>
      {filteredPlatforms
          .map(platform => {
            // Get the React Icon component
            const IconComponent = iconMap[platform.key];
            
            // Render different styles based on shape
            let iconContainerStyle = {};
            let iconStyle = {};
            
            switch (platform.shape) {
              case "circle":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "square-outline":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: `2px solid ${platform.borderColor}`,
                  boxSizing: "border-box"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "rounded":
                iconContainerStyle = {
                  background: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "flat":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "shadow":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.shadow
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              default:
                iconContainerStyle = {
                  backgroundColor: platform.bgColor || platform.color,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: '#ffffff',
                  fontSize: "18px"
                };
            }
            
            // Log the platform and URL for debugging
            console.log(`Rendering ${platform.key} with URL:`, socialMediaUrls[platform.key]);
            console.log(`Platform ${platform.key} container style:`, iconContainerStyle);
            console.log(`Platform ${platform.key} icon style:`, iconStyle);
            
            return (
              <a
                key={platform.key}
                href={socialMediaUrls[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                style={iconContainerStyle}
                title={platform.name}
              >
                {IconComponent && <IconComponent style={iconStyle} />}
              </a>
            );
          })}
      </div>
    );
  };
  // Function to render social media links with selected icon style
  const renderSocialMediaLinks = (customization) => {
    // Log the customization data for debugging
    console.log('renderSocialMediaLinks called with customization:', customization);
    
    // Check if customization exists and has social links data
    if (!customization || !customization.socialLinks) {
      console.log('No socialLinks data found');
      return null;
    }
    
    // Get the selected icon style and links
    const { iconStyle, links } = customization.socialLinks;
    console.log('Icon style:', iconStyle);
    console.log('Links:', links);
    
    // Check if any URLs exist
    const hasUrls = Object.values(links).some(url => url);
    console.log('Has URLs:', hasUrls);
    if (!hasUrls) {
      console.log('No URLs found');
      return null;
    }
    
    // Single source of truth mapping between DB iconStyle values and frontend style definitions
    const STYLE_MAP = {
      circle: {
        name: "Circle Icons",
        platforms: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#1877F2", shape: "circle" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#25D366", shape: "circle" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#E4405F", shape: "circle" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#0A66C2", shape: "circle" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FF0000", shape: "circle" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#000000", shape: "circle" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#0088CC", shape: "circle" }
        ]
      },
      "square-outline": {
        name: "Square Outline",
        platforms: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "transparent", borderColor: "#1877F2", shape: "square-outline" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "transparent", borderColor: "#E4405F", shape: "square-outline" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "transparent", borderColor: "#000000", shape: "square-outline" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "transparent", borderColor: "#0A66C2", shape: "square-outline" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "transparent", borderColor: "#FF0000", shape: "square-outline" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "transparent", borderColor: "#25D366", shape: "square-outline" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "transparent", borderColor: "#0088CC", shape: "square-outline" }
        ]
      },
      "rounded-gradient": {
        name: "Rounded Gradient",
        platforms: [
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)", shape: "rounded" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #1877F2, #0C5FC4)", shape: "rounded" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #000000, #333333)", shape: "rounded" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0A66C2, #004E92)", shape: "rounded" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #FF0000, #CC0000)", shape: "rounded" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #25D366, #128C7E)", shape: "rounded" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#FFFFFF", bgColor: "linear-gradient(45deg, #0088CC, #006699)", shape: "rounded" }
        ]
      },
      "flat-minimal": {
        name: "Flat Minimal",
        platforms: [
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#F0F0F0", shape: "flat" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFE5E5", shape: "flat" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FEEBEF", shape: "flat" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#E6F0FF", shape: "flat" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#E3EEFF", shape: "flat" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#E5F8ED", shape: "flat" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#E0F4FF", shape: "flat" }
        ]
      },
      shadow: {
        name: "Shadow Effect",
        platforms: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 136, 204, 0.3)", shape: "shadow" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(37, 211, 102, 0.3)", shape: "shadow" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(24, 119, 242, 0.3)", shape: "shadow" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(228, 64, 95, 0.3)", shape: "shadow" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(0, 0, 0, 0.3)", shape: "shadow" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(10, 102, 194, 0.3)", shape: "shadow" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", shadow: "0 4px 6px rgba(255, 0, 0, 0.3)", shape: "shadow" }
        ]
      },
      "neon-glow": {
        name: "Neon Glow",
        platforms: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#1877F2", glow: "0 0 10px #1877F2, 0 0 20px #1877F2", shape: "neon" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#E4405F", glow: "0 0 10px #E4405F, 0 0 20px #E4405F", shape: "neon" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#000000", glow: "0 0 10px #000000, 0 0 20px #000000", shape: "neon" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#0A66C2", glow: "0 0 10px #0A66C2, 0 0 20px #0A66C2", shape: "neon" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FF0000", glow: "0 0 10px #FF0000, 0 0 20px #FF0000", shape: "neon" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#25D366", glow: "0 0 10px #25D366, 0 0 20px #25D366", shape: "neon" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#0088CC", glow: "0 0 10px #0088CC, 0 0 20px #0088CC", shape: "neon" }
        ]
      },
      material: {
        name: "Material Design",
        platforms: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "X", key: "x", iconClass: "fab fa-twitter", color: "#000000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC", bgColor: "#FFFFFF", elevation: "0 2px 4px rgba(0,0,0,0.2)", shape: "material" }
        ]
      }
    };
    
    // Use the DB value to get the active style with fallback
    const activeStyle = STYLE_MAP[iconStyle] || STYLE_MAP.circle;
    console.log('Active style:', activeStyle);
    
    // Filter platforms that have URLs and render icons
    const filteredPlatforms = activeStyle.platforms.filter(platform => links[platform.key]);
    console.log('Filtered platforms:', filteredPlatforms);
    
    // If no platforms have URLs, return null
    if (filteredPlatforms.length === 0) {
      console.log('No platforms with URLs found');
      return null;
    }
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: windowWidth <= 576 ? '12px' : '18px', // Smaller gap on mobile
        padding: '0',
        margin: '0',
        flexWrap: 'nowrap', // Prevent wrapping to keep icons in one row
        overflowX: 'auto' // Allow horizontal scrolling on small screens
      }}>
        {filteredPlatforms
          .map(platform => {
            // Render different styles based on shape
            let iconContainerStyle = {};
            let iconStyle = {};
            
            switch (platform.shape) {
              case "circle":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "square-outline":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  border: `2px solid ${platform.borderColor}`,
                  boxSizing: "border-box"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "rounded":
                iconContainerStyle = {
                  background: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "flat":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "shadow":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.shadow
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "neon":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.glow
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              case "material":
                iconContainerStyle = {
                  backgroundColor: platform.bgColor,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: platform.elevation
                };
                iconStyle = {
                  color: platform.color,
                  fontSize: "18px"
                };
                break;
              default:
                iconContainerStyle = {
                  backgroundColor: platform.bgColor || platform.color,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none"
                };
                iconStyle = {
                  color: '#ffffff',
                  fontSize: "18px"
                };
            }
            
            // Log the platform and URL for debugging
            console.log(`Rendering ${platform.key} with URL:`, links[platform.key]);
            console.log(`Platform ${platform.key} container style:`, iconContainerStyle);
            console.log(`Platform ${platform.key} icon style:`, iconStyle);
            
            return (
              <a
                key={platform.key}
                href={links[platform.key]}
                target="_blank"
                rel="noopener noreferrer"
                style={iconContainerStyle}
                title={platform.name}
              >
                <i className={platform.iconClass} style={iconStyle}></i>
              </a>
            );
          })}
      </div>
    );
  };

  // Add this function to generate a data URL for the cropped region with customization
  const generateCroppedImage = async () => {
    if (!clipBox || !pageRef.current) return Promise.reject(new Error('No clip box or page reference'));    
    setIsGeneratingPreview(true);
    
    // Add spinner animation to document head
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return new Promise((resolve, reject) => {
      try {
        // Find the PDF canvas for the current page
        const pageElement = pageRef.current;
        const pdfCanvas = pageElement.querySelector('canvas');
        
        if (!pdfCanvas) {
          throw new Error('PDF canvas not found');
        }
        
        // Get clip customization settings
        const clipSettings = customization?.clip || {};
        const topClipSettings = clipSettings.topClip || {};
        const footerClipSettings = clipSettings.footerClip || {};
        const displayOptions = clipSettings.displayOptions || {};
        
        // Get logo URLs
        const topLogoUrl = clipSettings.topLogoUrl || '';
        const footerLogoUrl = clipSettings.footerLogoUrl || '';
        
        // Calculate dimensions
        const croppedWidth = clipBox.width;
        const croppedHeight = clipBox.height;
        const topBannerHeight = topClipSettings.logoHeight || 50;
        const footerBannerHeight = footerClipSettings.logoHeight || 50;
        const totalHeight = croppedHeight + topBannerHeight + footerBannerHeight;
        
        // Create a temporary canvas for the final composed image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set dimensions of the temporary canvas
        tempCanvas.width = croppedWidth;
        tempCanvas.height = totalHeight;
        
        // Apply scaling factor to account for PDF rendering scale
        const scaleX = pdfCanvas.width / pageElement.offsetWidth;
        const scaleY = pdfCanvas.height / pageElement.offsetHeight;
        
        // Function to draw the complete image with banners
        const drawCompleteImage = () => {
          // Fill top banner with background color
          tempCtx.fillStyle = topClipSettings.backgroundColor || '#ffffff';
          tempCtx.fillRect(0, 0, croppedWidth, topBannerHeight);
          
          // Draw top logo if available
          if (topLogoUrl) {
            const topLogo = new Image();
            topLogo.crossOrigin = 'Anonymous';
            topLogo.onload = () => {
              // Calculate logo dimensions maintaining aspect ratio
              const maxWidth = croppedWidth * 0.3; // Max 30% of width
              const maxHeight = topBannerHeight * 0.8; // Max 80% of banner height
              let logoWidth = topLogo.width;
              let logoHeight = topLogo.height;
              
              // Scale down if needed
              if (logoWidth > maxWidth || logoHeight > maxHeight) {
                const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
                logoWidth *= scale;
                logoHeight *= scale;
              }
              
              // Calculate position based on alignment
              let x = 10; // Default to left
              if (topClipSettings.position === 'Center') {
                x = (croppedWidth - logoWidth) / 2;
              } else if (topClipSettings.position === 'Right') {
                x = croppedWidth - logoWidth - 10;
              }
              
              const y = (topBannerHeight - logoHeight) / 2;
              
              tempCtx.drawImage(topLogo, x, y, logoWidth, logoHeight);
              finishDrawing();
            };
            topLogo.onerror = () => {
              // If logo fails to load, continue without it
              finishDrawing();
            };
            topLogo.src = topLogoUrl;
          } else {
            // No top logo, proceed to next step
            finishDrawing();
          }
        };
        
        // Function to draw the cropped content and footer
        const finishDrawing = () => {
          // Draw the cropped region from the source canvas to the temporary canvas
          tempCtx.drawImage(
            pdfCanvas,
            clipBox.x * scaleX,     // source x
            clipBox.y * scaleY,     // source y
            clipBox.width * scaleX, // source width
            clipBox.height * scaleY,// source height
            0,                      // destination x
            topBannerHeight,        // destination y (after top banner)
            clipBox.width,          // destination width
            clipBox.height          // destination height
          );
          
          // Fill footer banner with background color
          tempCtx.fillStyle = footerClipSettings.backgroundColor || '#ffffff';
          tempCtx.fillRect(0, topBannerHeight + croppedHeight, croppedWidth, footerBannerHeight);
          
          // Draw footer logo if available
          if (footerLogoUrl) {
            const footerLogo = new Image();
            footerLogo.crossOrigin = 'Anonymous';
            footerLogo.onload = () => {
              // Calculate logo dimensions maintaining aspect ratio
              const maxWidth = croppedWidth * 0.3; // Max 30% of width
              const maxHeight = footerBannerHeight * 0.8; // Max 80% of banner height
              let logoWidth = footerLogo.width;
              let logoHeight = footerLogo.height;
              
              // Scale down if needed
              if (logoWidth > maxWidth || logoHeight > maxHeight) {
                const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
                logoWidth *= scale;
                logoHeight *= scale;
              }
              
              // Calculate position based on alignment
              let x = 10; // Default to left
              if (footerClipSettings.position === 'Center') {
                x = (croppedWidth - logoWidth) / 2;
              } else if (footerClipSettings.position === 'Right') {
                x = croppedWidth - logoWidth - 10;
              }
              
              const y = topBannerHeight + croppedHeight + (footerBannerHeight - logoHeight) / 2;
              
              tempCtx.drawImage(footerLogo, x, y, logoWidth, logoHeight);
              addTextOverlays();
            };
            footerLogo.onerror = () => {
              // If logo fails to load, continue without it
              addTextOverlays();
            };
            footerLogo.src = footerLogoUrl;
          } else {
            // No footer logo, proceed to next step
            addTextOverlays();
          }
        };
        
        // Function to add text overlays (date, domain, and page number in footer)
        const addTextOverlays = () => {
          const date = new Date().toLocaleDateString();
          const domain = window.location.hostname;
          const pageNumText = `Page ${pageNumber}`;
          
          tempCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          tempCtx.font = '12px Arial';
          
          // Position text in the footer area instead of top
          const footerTextY = topBannerHeight + croppedHeight + footerBannerHeight - 15;
          
          if (displayOptions.showDate !== false) {
            tempCtx.fillText(date, 10, footerTextY);
          }
          
          // Show domain name
          if (displayOptions.showDomain !== false) {
            const domainText = domain;
            const domainMetrics = tempCtx.measureText(domainText);
            const domainX = (croppedWidth - domainMetrics.width) / 2; // Center the domain
            tempCtx.fillText(domainText, domainX, footerTextY);
          }
          
          if (displayOptions.showPageNumber !== false) {
            const pageNumMetrics = tempCtx.measureText(pageNumText);
            tempCtx.fillText(pageNumText, croppedWidth - pageNumMetrics.width - 10, footerTextY);
          }
          
          // Convert to data URL in WebP format for better compression
          try {
            const dataUrl = tempCanvas.toDataURL('image/webp', 0.9);
            setCroppedImage(dataUrl);
            resolve(dataUrl);
          } catch (error) {
            console.error('Error converting canvas to data URL:', error);
            // Fallback to PNG if WebP fails
            try {
              const fallbackDataUrl = tempCanvas.toDataURL('image/png');
              setCroppedImage(fallbackDataUrl);
              resolve(fallbackDataUrl);
            } catch (fallbackError) {
              console.error('Fallback to PNG also failed:', fallbackError);
              reject(fallbackError);
            }
          }
        };
        
        // Start the drawing process
        drawCompleteImage();
      } catch (error) {
        console.error('Error generating cropped image:', error);
        // Fallback to a simple placeholder
        setCroppedImage('/placeholder-cropped-image.webp');
        reject(error);
      }
    }).finally(() => {
      setIsGeneratingPreview(false);
    });
  };

  // Get cropped image URL
  const getCroppedImageUrl = () => {
    return croppedImage || '/placeholder-cropped-image.webp';
  };

  // Download the cropped image
  const downloadCroppedImage = () => {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.href = croppedImage;
    // Change download filename to use .webp extension
    link.download = 'clipped-image.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cleanup function to revoke object URLs
  const cleanupImage = () => {
    if (croppedImage && croppedImage.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
    }
    setCroppedImage(null);
  };

  // Handle pinch-to-zoom gestures with enhanced text clarity
  useEffect(() => {
    const element = pdfContentRef.current;
    if (!element) return;

    let initialScale = 1;
    let currentScale = 1;
    
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Store initial distance between fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = currentScale;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent default scrolling behavior
        
        // Calculate current distance between fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Calculate new scale
        const scaleFactor = currentDistance / initialDistance;
        currentScale = Math.min(Math.max(initialScale * scaleFactor, 0.3), 5);
        setScale(currentScale);
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
    if (onLoadSuccess) onLoadSuccess({ numPages });
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
    setIsLoading(false);
    if (onLoadError) onLoadError(error);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(newPageNumber, numPages));
    });
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Toggle clipping mode
  const toggleClipping = () => {
    setIsClipping(!isClipping);
    if (!isClipping) {
      // Initialize clip box in the center of the page when starting clipping
      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        const width = Math.min(200, rect.width * 0.5);
        const height = Math.min(200, rect.height * 0.5);
        const x = Math.max(0, (rect.width - width) / 2);
        const y = Math.max(0, (rect.height - height) / 2);
        
        setClipBox({
          x,
          y,
          width,
          height
        });
      }
    } else {
      setClipBox(null);
      setDragging(false);
      setResizing(null);
    }
  };

  // Handle mouse down on clip box
  const handleMouseDown = (e, action = 'move', handle = null) => {
    e.stopPropagation();
    if (!clipBox) return;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    
    if (action === 'move') {
      setDragging(true);
    } else if (action === 'resize') {
      setResizing(handle);
    }
  };

  // Handle touch start on clip box (for mobile)
  const handleTouchStart = (e, action = 'move', handle = null) => {
    e.stopPropagation();
    if (!clipBox || !e.touches[0]) return;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    setDragStart({ x, y });
    
    if (action === 'move') {
      setDragging(true);
    } else if (action === 'resize') {
      setResizing(handle);
    }
  };

  // Handle mouse move for dragging/resizing
  const handleMouseMove = (e) => {
    if (!clipBox || (!dragging && !resizing)) return;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    if (dragging) {
      // Move the entire box with boundary constraints
      setClipBox(prev => {
        if (!prev) return null;
        
        // Calculate new position based on mouse position
        const newX = x - (dragStart.x - prev.x);
        const newY = y - (dragStart.y - prev.y);
        
        // Apply boundary constraints
        const boundedX = Math.max(0, Math.min(newX, rect.width - prev.width));
        const boundedY = Math.max(0, Math.min(newY, rect.height - prev.height));
        
        const newBox = {
          ...prev,
          x: boundedX,
          y: boundedY
        };
        
        // Call crop change callback if provided
        if (onCropChange) {
          onCropChange(newBox);
        }
        
        return newBox;
      });
    } else if (resizing) {
      // Resize based on which handle is being dragged with boundary constraints
      setClipBox(prev => {
        if (!prev) return null;
        
        let newBox = { ...prev };
        
        switch (resizing) {
          case 'nw': // Top-left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'n': // Top
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'ne': // Top-right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'e': // Right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            break;
          case 'se': // Bottom-right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 's': // Bottom
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 'sw': // Bottom-left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
          case 'w': // Left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
        }
        
        // Ensure box stays within boundaries
        newBox.width = Math.min(newBox.width, rect.width - newBox.x);
        newBox.height = Math.min(newBox.height, rect.height - newBox.y);
        
        // Call crop change callback if provided
        if (onCropChange) {
          onCropChange(newBox);
        }
        
        return newBox;
      });
    }
    
    // Update drag start position for continuous tracking
    setDragStart({ x, y });
  };

  // Handle touch move for dragging/resizing (for mobile)
  const handleTouchMove = (e) => {
    if (!clipBox || (!dragging && !resizing) || !e.touches[0]) return;
    
    const rect = pageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.touches[0].clientY - rect.top, rect.height));
    
    if (dragging) {
      // Move the entire box with boundary constraints
      setClipBox(prev => {
        if (!prev) return null;
        
        // Calculate new position based on touch position
        const newX = x - (dragStart.x - prev.x);
        const newY = y - (dragStart.y - prev.y);
        
        // Apply boundary constraints
        const boundedX = Math.max(0, Math.min(newX, rect.width - prev.width));
        const boundedY = Math.max(0, Math.min(newY, rect.height - prev.height));
        
        const newBox = {
          ...prev,
          x: boundedX,
          y: boundedY
        };
        
        // Call crop change callback if provided
        if (onCropChange) {
          onCropChange(newBox);
        }
        
        return newBox;
      });
    } else if (resizing) {
      // Resize based on which handle is being dragged with boundary constraints
      setClipBox(prev => {
        if (!prev) return null;
        
        let newBox = { ...prev };
        
        switch (resizing) {
          case 'nw': // Top-left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'n': // Top
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'ne': // Top-right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'e': // Right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            break;
          case 'se': // Bottom-right
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 's': // Bottom
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 'sw': // Bottom-left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
          case 'w': // Left
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
        }
        
        // Ensure box stays within boundaries
        newBox.width = Math.min(newBox.width, rect.width - newBox.x);
        newBox.height = Math.min(newBox.height, rect.height - newBox.y);
        
        // Call crop change callback if provided
        if (onCropChange) {
          onCropChange(newBox);
        }
        
        return newBox;
      });
    }
    
    // Update drag start position for continuous tracking
    setDragStart({ x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDragging(false);
    setResizing(null);
  };

  // Handle touch end (for mobile)
  const handleTouchEnd = () => {
    setDragging(false);
    setResizing(null);
  };

  // Save the current clip box as a clipping
  const saveClipping = () => {
    if (clipBox) {
      const newClipping = {
        id: Date.now(),
        page: pageNumber,
        ...clipBox
      };
      setClippings([...clippings, newClipping]);
      setIsClipping(false);
      setClipBox(null);
    }
  };

  // Button click handlers
  const handlePdfClick = () => {
    // Use the pdfUrl prop that's passed to the component
    if (pdfUrl) {
      // Open the current PDF in a new tab
      console.log("Opening PDF in new tab:", pdfUrl);
      window.open(pdfUrl, "_blank");
    } else {
      // Extract date from URL query parameters as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const date = urlParams.get('date') || new Date().toISOString().split('T')[0];
      
      // Auto-detect domain
      const baseDomain = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
      const fallbackPdfUrl = `${baseDomain}/pdf?date=${date}&page=${pageNumber}`;
      
      // Debugging: Log the URL we're trying to access
      console.log("Checking fallback PDF URL:", fallbackPdfUrl);
      
      // Check if PDF exists before opening
      fetch(fallbackPdfUrl, { method: 'HEAD' })
        .then(response => {
          console.log("PDF check response status:", response.status);
          if (response.status === 200) {
            // PDF exists, open it in a new tab
            console.log("Opening PDF in new tab:", fallbackPdfUrl);
            window.open(fallbackPdfUrl, "_blank");
          } else {
            // PDF does not exist, show user-friendly message
            console.log("PDF not available, showing alert");
            alert("PDF not available for this page");
          }
        })
        .catch(error => {
          // Handle network errors
          console.error("Error checking PDF availability:", error);
          alert("Unable to open PDF. Please try again later.");
        });
    }
  };

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    window.location.href = `/epaper?date=${formattedDate}`;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPageNumber(Math.max(1, Math.min(newPage, numPages)));
    setShowPageSelector(false); // Close dropdown when page is selected
  };

  // Add mouse and touch event listeners
  useEffect(() => {
    if (isClipping) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isClipping, clipBox, dragging, resizing, dragStart]);

  // Prevent scrolling when calendar is open
  useEffect(() => {
    if (showCalendar) {
      // Prevent scrolling on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showCalendar]);

  // Calculate width based on screen size with proper sizing
  const getPDFWidth = () => {
    if (windowWidth < 480) {
      // Extra small devices (phones) - use maximum available width
      return windowWidth * 0.95; // Use 95% of available width to maximize display
    } else if (windowWidth < 768) {
      // Small devices (tablets)
      return windowWidth * 0.95; // Use 95% of available width to maximize display
    } else if (windowWidth < 992) {
      // Medium devices (small laptops)
      return windowWidth * 0.85; // Keep existing sizing for tablets/laptops
    } else {
      // Large devices (desktops) - proper sizing to show full page
      return windowWidth * 0.75;
    }
  };


  // Handle pinch zoom gesture on mobile
  const handlePinchZoom = (e) => {
    if (!isMobile) return;
    
    // Prevent default browser zoom behavior
    e.preventDefault();
    
    // Adjust scale based on pinch gesture
    if (e.scale > 1) {
      // Zoom in
      setScale(prevScale => Math.min(prevScale * e.scale, 3.0));
    } else if (e.scale < 1) {
      // Zoom out
      setScale(prevScale => Math.max(prevScale * e.scale, 0.5));
    }
  };

  // Add touch event listeners for better mobile handling
  useEffect(() => {
    // Only apply on mobile devices
    if (!isMobile) return;
    
    const pdfElement = pdfContentRef.current;
    if (!pdfElement) return;
    
    // Handle touch events for better zoom control with enhanced text clarity
    let initialDistance = 0;
    let initialScale = scale;
    
    const handleTouchStart = (e) => {
      // Only handle two-finger gestures
      if (e.touches.length === 2) {
        // Calculate initial distance between fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        initialScale = scale;
      }
    };
    
    const handleTouchMove = (e) => {
      // Only handle two-finger gestures with initialized distance
      if (e.touches.length === 2 && initialDistance > 0) {
        // Calculate current distance between fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Calculate scale factor
        const scaleFactor = currentDistance / initialDistance;
        const newScale = initialScale * scaleFactor;
        
        // Limit scale between 0.3 and 5.0 for better mobile experience and text clarity
        // Only update if the change is significant to prevent excessive re-renders
        const roundedScale = Math.round(newScale * 100) / 100; // Round to 2 decimal places
        if (Math.abs(roundedScale - scale) > 0.01) {
          setScale(Math.min(Math.max(roundedScale, 0.3), 5.0));
        }
        
        // Prevent default browser zoom for crisp text rendering
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      // Reset initial distance when touch ends
      initialDistance = 0;
      // Trigger re-render for better text clarity after zoom
      if (scale < 1.0) {
        // Force a slight re-render to enhance text clarity when zoomed out
        setScale(prev => prev === 1.0 ? 1.01 : prev);
      }
    };
    
    // Add event listeners with proper options for mobile
    pdfElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    pdfElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    pdfElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup event listeners
    return () => {
      pdfElement.removeEventListener('touchstart', handleTouchStart);
      pdfElement.removeEventListener('touchmove', handleTouchMove);
      pdfElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, scale]);

  // Navigation button styles
  const navButtonStyle = {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: isMobile ? '45px' : '50px',
    height: isMobile ? '45px' : '50px',
    fontSize: isMobile ? '20px' : '24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
    zIndex: 1000,
    pointerEvents: 'auto' // Enable pointer events for buttons
  };

  // Disabled button style
  const disabledButtonStyle = {
    ...navButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  // Handle styles for resize handles
  const handleStyle = {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    border: '1px solid white',
    borderRadius: '50%',
    zIndex: 1000
  };

  // Add CSS for mobile PDF rendering
  const mobilePdfStyles = `
    .mobile-pdf-page {
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      -ms-interpolation-mode: nearest-neighbor;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      font-smooth: always;
      -webkit-transform: translateZ(0);
      -moz-transform: translateZ(0);
      -ms-transform: translateZ(0);
      -o-transform: translateZ(0);
      transform: translateZ(0);
      font-kerning: normal;
      text-orientation: mixed;
    }
    
    /* Mobile page specific styles */
    .mobile-page {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 auto !important;
      display: block !important;
    }
    
    /* Enhance paragraph text specifically on mobile */
    @media (max-width: 768px) {
      .react-pdf__Page {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        -ms-interpolation-mode: nearest-neighbor;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-smooth: always;
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -ms-transform: translateZ(0);
        -o-transform: translateZ(0);
        transform: translateZ(0);
        backface-visibility: hidden;
        will-change: transform;
        font-kerning: normal;
        text-orientation: mixed;
        -webkit-font-feature-settings: "kern" 1;
        -moz-font-feature-settings: "kern" 1;
        font-feature-settings: "kern" 1;
      }
      
      /* Text layer styles removed since text selection is disabled */
    }
  `;

  return (
    <div className="pdf-viewer-container" style={{ 
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#f0f0f0',
      overflow: isMobile ? 'auto' : 'hidden', // Allow scrolling on mobile
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      touchAction: 'pan-y', // Allow vertical scrolling on mobile
      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      paddingBottom: isMobile ? '60px' : '0', // Add padding to account for fixed bottom navigation
    }}>
    <style>{mobilePdfStyles}</style>
    
    {/* Social Media Icons - Display above top toolbar with same width as PDF viewer */}
    {customization && (
      <div style={{ 
        width: isMobile ? '100%' : getPDFWidth(), // Use full width on mobile
        maxWidth: getPDFWidth(), // Max width based on function
        margin: '0 auto', // Center the container
        padding: '0',
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',  // Positioned at top with small margin
        zIndex: 999,  // Ensure icons appear below toolbar (zIndex 1000) but above PDF content
        boxSizing: 'border-box' // Include padding in width calculation
      }}>
        {renderSocialMediaIcons(customization)}
        {renderSocialMediaLinks(customization)}
      </div>
    )}
    
    {/* Modern Top Toolbar - Width matched to PDF content */}
    <div style={{
      position: 'sticky',
      top: '0',
      left: '0',
      zIndex: 1000,
      borderRadius: '0 0 50px 50px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: isMobile ? '100%' : getPDFWidth(), // Use full width on mobile
      maxWidth: getPDFWidth(), // Max width based on function
      flexDirection: 'row',
      gap: '0',
      margin: '0 auto',
      overflowX: windowWidth <= 576 ? 'auto' : 'visible', // Enable horizontal scroll only on mobile
      scrollbarWidth: 'none', // Hide scrollbar for Firefox
      msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
      boxSizing: 'border-box', // Include padding in width calculation
    }}>
      {/* Hide scrollbar for Webkit browsers */}
      {isMobile && (
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      )}
      
      {/* Page Selector Dropdown - Hidden on mobile per specification */}
      {windowWidth > 576 && (
        <div style={{ 
          position: 'relative',
          minWidth: '120px',
          flexShrink: 'initial'
        }}>
          <button
            onClick={() => setShowPageSelector(!showPageSelector)}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: '120px'
            }}
          >
            <span>Page {pageNumber}</span>
            <svg 
              style={{ 
                width: '16px', 
                height: '16px', 
                marginLeft: '8px',
                transform: showPageSelector ? 'rotate(180deg)' : 'rotate(0)'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPageSelector && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              marginTop: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              minWidth: '120px',
              zIndex: 1001
            }}>
              {Array.from({ length: numPages }, (_, i) => i + 1).map(page => (
                <div
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    backgroundColor: page === pageNumber ? '#e5e7eb' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: page === pageNumber ? '600' : 'normal',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  Page {page}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        minWidth: windowWidth <= 576 ? 'auto' : 'auto',
        margin: '0 10px',
        flexShrink: 0
      }}>
        <button
          onClick={previousPage}
          disabled={pageNumber <= 1}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
            opacity: pageNumber <= 1 ? 0.5 : 1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: windowWidth <= 576 ? '32px' : '32px',
            height: windowWidth <= 576 ? '32px' : '32px',
            minWidth: windowWidth <= 576 ? '32px' : '32px'
          }}
        >
          <svg style={{ 
            width: '20px', 
            height: '20px' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div style={{
          margin: '0 12px',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: windowWidth <= 576 ? '50px' : '60px',
          textAlign: 'center'
        }}>
          {pageNumber} / {numPages}
        </div>
        
        <button
          onClick={nextPage}
          disabled={pageNumber >= numPages}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px',
            cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
            opacity: pageNumber >= numPages ? 0.5 : 1,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: windowWidth <= 576 ? '32px' : '32px',
            height: windowWidth <= 576 ? '32px' : '32px',
            minWidth: windowWidth <= 576 ? '32px' : '32px'
          }}
        >
          <svg style={{ 
            width: '20px', 
            height: '20px' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        justifyContent: 'flex-end',
        flexShrink: 0
      }}>
        <button 
          onClick={toggleClipping}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
            backgroundColor: isClipping ? '#f59e0b' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: windowWidth <= 576 ? '36px' : 'auto', // Fixed height on mobile
            whiteSpace: 'nowrap'
          }}
        >
          <svg style={{
            width: '16px', 
            height: '16px', 
            marginRight: windowWidth <= 576 ? '0' : '5px'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span style={{ 
            display: windowWidth <= 576 ? 'none' : 'inline' // Hide text on mobile
          }}>
            {isClipping ? 'Cancel Clip' : 'Clip'}
          </span>
        </button>
        
        {isClipping && (
          <button 
            onClick={saveClipping}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: windowWidth <= 576 ? '36px' : 'auto', // Fixed height on mobile
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ 
              display: windowWidth <= 576 ? 'none' : 'inline' // Hide text on mobile
            }}>
              Save Clip
            </span>
          </button>
        )}
        
        <button 
          onClick={handlePdfClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: windowWidth <= 576 ? '36px' : 'auto', // Fixed height on mobile
            whiteSpace: 'nowrap'
          }}
        >
          <svg style={{
            width: '16px', 
            height: '16px', 
            marginRight: windowWidth <= 576 ? '0' : '5px'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span style={{ 
            display: windowWidth <= 576 ? 'none' : 'inline' // Hide text on mobile
          }}>
            PDF
          </span>
        </button>
        
        <button 
          ref={calendarButtonRef}
          onClick={handleCalendarClick}
          style={
            showCalendar 
              ? {
                  display: 'flex',
                  alignItems: 'center',
                  padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transform: 'scale(0.98)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  height: windowWidth <= 576 ? '36px' : 'auto', // Fixed height on mobile
                  whiteSpace: 'nowrap'
                }
              : {
                  display: 'flex',
                  alignItems: 'center',
                  padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  height: windowWidth <= 576 ? '36px' : 'auto', // Fixed height on mobile
                  whiteSpace: 'nowrap'
                }
          }
          onMouseDown={(e) => {
            const button = e.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.cssText = `
              position: absolute;
              width: ${size}px;
              height: ${size}px;
              left: ${x}px;
              top: ${y}px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              transform: scale(0);
              animation: ripple 0.6s linear;
              pointer-events: none;
              z-index: 1;
            `;
            ripple.className = 'ripple';
            button.appendChild(ripple);
            setTimeout(() => {
              ripple.remove();
            }, 600);
          }}
        >
          <svg style={{
            width: '16px', 
            height: '16px', 
            marginRight: windowWidth <= 576 ? '0' : '5px'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span style={{ 
            display: windowWidth <= 576 ? 'none' : 'inline' // Hide text on mobile
          }}>
            Calendar
          </span>
        </button>
      </div>
    </div>
    

    
    {/* Ripple animation style */}
    <style jsx>{`
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `}</style>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div>Loading PDF...</div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          color: '#d32f2f',
          textAlign: 'center'
        }}>
          <div>Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
      {/* Debug: Log customization data */}
      {customization && console.log('Customization data in render:', customization)}
            
      {/* Navigation Arrows - Now visible on both mobile and desktop */}
      <div className="pdf-navigation" style={{        position: 'absolute',
          top: '50%',
          left: isMobile ? '5px' : '15px',
          right: isMobile ? '5px' : '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'none' // Keep this to allow buttons to receive events
        }}>
          <button
            onClick={(e) => {e.stopPropagation(); previousPage();}}
            disabled={pageNumber <= 1}
            style={pageNumber <= 1 ? disabledButtonStyle : navButtonStyle}
          >
            &larr;
          </button>
                
          <button
            onClick={(e) => {e.stopPropagation(); nextPage();}}
            disabled={pageNumber >= numPages}
            style={pageNumber >= numPages ? disabledButtonStyle : navButtonStyle}
          >
            &rarr;
          </button>
        </div>
      
      {/* PDF Content - Properly sized for both desktop and mobile */}
      <div 
        ref={pdfContentRef}
        className="pdf-content"
        style={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // Align to top instead of center
          padding: isMobile ? '10px 5px 80px 5px' : '20px 0 60px 0', // Increased bottom padding on mobile to account for bottom toolbar
          boxSizing: 'border-box',
          overflow: 'auto', // Allow scrolling when needed
          touchAction: 'pan-x pan-y', // Allow panning but not browser zoom
          position: 'relative',
          zIndex: 1,
          ...(isMobile ? {
            imageRendering: scale < 1.0 ? 'crisp-edges' : 'crisp-edges',
            textRendering: scale < 1.0 ? 'optimizeLegibility' : 'geometricPrecision',
            fontSmooth: 'always',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            // Additional properties for zoom handling
            ...(scale < 1.0 ? {
              msHighContrastAdjust: 'none',
              fontKerning: 'normal',
              textOrientation: 'mixed'
            } : {})
          } : {})
        }}
      >        <div style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          maxWidth: '100%',
          overflow: 'visible',
          padding: '0',
          // Mobile-specific styles
          ...(isMobile && {
            display: 'block',
            margin: '0 auto',
          })
        }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div style={{ 
              textAlign: 'center',
              padding: '20px'
            }}>Loading PDF...</div>}
            error={<div style={{ 
              textAlign: 'center',
              padding: '20px',
              color: '#d32f2f'
            }}>Failed to load PDF. Please try again.</div>}
          >
            <div 
              ref={pageRef}
              style={{ 
                position: 'relative', 
                cursor: isClipping ? 'crosshair' : 'default',
                zIndex: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                ...{
                  imageRendering: scale < 1.0 ? 'crisp-edges' : 'crisp-edges',
                  textRendering: scale < 1.0 ? 'optimizeLegibility' : scale > 1.5 ? 'geometricPrecision' : 'optimizeLegibility',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  fontKerning: 'normal',
                  // Additional properties for better zoom handling
                  ...(scale < 1.0 ? {
                    imageRendering: 'crisp-edges',
                    msHighContrastAdjust: 'none',
                    textOrientation: 'mixed'
                  } : {})
                }
              }}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false} // Disable text layer to prevent text selection
                renderAnnotationLayer={true}
                width={Math.min(getPDFWidth(), windowWidth * 0.95)} // Ensure page width doesn't exceed screen width
                renderMode="canvas" // Use canvas rendering for better text quality
                canvasQuality="high" // High quality canvas rendering for better paragraph text clarity
                canvasBackground="#ffffff" // Set white background for better text contrast
                // Removed canvasRef as it was causing issues with rendering
                devicePixelRatio={getDynamicDevicePixelRatio()} // Dynamic pixel ratio based on zoom level for mobile
                style={{
                  imageRendering: scale < 1.0 ? 'crisp-edges' : 'crisp-edges', // Use crisp-edges for better quality when zoomed out
                  textRendering: scale < 1.0 ? 'optimizeLegibility' : scale > 1.5 ? 'geometricPrecision' : 'optimizeLegibility',
                  fontSmooth: 'always',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  webkitFontSmoothing: 'antialiased',
                  mozOsxFontSmoothing: 'grayscale',
                  fontKerning: 'normal',
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  // Additional properties for better zoom handling
                  ...(scale < 1.0 ? {
                    imageRendering: 'crisp-edges',
                    msHighContrastAdjust: 'none',
                    textOrientation: 'mixed'
                  } : {})
                }}
                // Additional properties for better text rendering on mobile
                enableWebGL={false} // Disable WebGL for more consistent rendering
                disableTextLayer={true} // Disable text layer to prevent text selection
                customTextRenderer={undefined} // Use default text renderer
                // Enhanced options for better Unicode and complex script support
                cMapUrl="https://unpkg.com/pdfjs-dist@5.4.296/cmaps/"
                cMapPacked={true}
                // Use enhanced text normalization for better Unicode handling
                normalizeWhitespace={true}
                disableRange={true}
                disableStream={true}
                // Ensure proper layout to prevent cutting
                height="auto"
                // Ensure the page fits properly in container
                className="mobile-page"
              />
              
              {/* Clip Box */}
              {isClipping && clipBox && (
                <div>
                  {/* Dimming overlay outside the crop region */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      pointerEvents: 'none',
                      zIndex: 999
                    }}
                  />
                  
                  {/* Crop area - transparent hole */}
                  <div
                    style={{
                      position: 'absolute',
                      left: clipBox.x,
                      top: clipBox.y,
                      width: clipBox.width,
                      height: clipBox.height,
                      pointerEvents: 'none',
                      zIndex: 1000,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                  
                  {/* Actual crop box with handles */}
                  <div
                    style={{
                      position: 'absolute',
                      left: clipBox.x,
                      top: clipBox.y,
                      width: clipBox.width,
                      height: clipBox.height,
                      border: '2px solid #3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      cursor: 'move',
                      zIndex: 1001
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                    onTouchStart={(e) => handleTouchStart(e, 'move')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Resize Handles - 8 sides */}
                    {/* Top-left handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'nw-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'nw')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Top-middle handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'n-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'n')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'n')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Top-right handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'ne-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'ne')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Middle-right handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        right: '-4px',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'e-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'e')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'e')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Bottom-right handle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'se-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'se')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Bottom-middle handle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 's-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 's')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 's')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Bottom-left handle */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '-4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'sw-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'sw')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Middle-left handle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '-4px',
                        transform: 'translateY(-50%)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'w-resize',
                        zIndex: 1002
                      }}
                      onMouseDown={(e) => handleMouseDown(e, 'resize', 'w')}
                      onTouchStart={(e) => handleTouchStart(e, 'resize', 'w')}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {/* Floating Action Buttons */}
                  <div
                    style={{
                      position: 'absolute',
                      top: clipBox.y - 40,
                      left: clipBox.x + clipBox.width - 160,
                      display: 'flex',
                      gap: '8px',
                      zIndex: 1003
                    }}
                  >
                    {/* Share Button */}
                    <button
                      onClick={async () => {
                        if (onCropChange) {
                          onCropChange(clipBox);
                        }
                        
                        // Generate the cropped image and wait for it to be created
                        let generatedImageUrl = null;
                        try {
                          generatedImageUrl = await generateCroppedImage();
                        } catch (error) {
                          console.error('Error generating cropped image:', error);
                          alert('Failed to generate clipped image. Please try again.');
                          return;
                        }
                        
                        // Only proceed if we have a valid image URL
                        if (!generatedImageUrl) {
                          alert('No image generated. Please try again.');
                          return;
                        }
                        
                        // Save the clipping to backend to get sequential numeric ID
                        try {
                          // Get the paper ID from URL parameters
                          const urlParams = new URLSearchParams(window.location.search);
                          const paperId = urlParams.get('paperId') || 'unknown';
                          
                          // Get the date from URL parameters
                          const date = urlParams.get('date') || new Date().toISOString().split('T')[0];
                          
                          // Save clipping to backend with the generated image URL
                          const clippingData = {
                            paperId: paperId,
                            page: pageNumber,
                            coordinates: {
                              x: clipBox.x,
                              y: clipBox.y,
                              width: clipBox.width,
                              height: clipBox.height
                            },
                            imageUrl: generatedImageUrl
                          };
                          
                          const response = await clippingsAPI.createClipping(clippingData);
                          
                          if (response.success && response.data) {
                            // Update the share URL with the actual clipId
                            const baseDomain = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
                            const newShareUrl = `${baseDomain}/clip/${response.data.clipId}`;
                            setShareUrl(newShareUrl);
                          } else {
                            throw new Error('Failed to save clipping');
                          }
                        } catch (error) {
                          console.error('Error saving clipping:', error);
                          alert('Failed to save clipping. Please try again.');
                          return;
                        }
                        
                        setShowShareModal(true);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                        <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                      </svg>
                      Share
                    </button>
                    
                    {/* Cancel Button */}
                    <button
                      onClick={() => {
                        setIsClipping(false);
                        setClipBox(null);
                        setDragging(false);
                        setResizing(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Saved clippings */}
              {clippings.filter(c => c.page === pageNumber).map(clipping => (
                <div 
                  key={clipping.id}
                  style={{
                    position: 'absolute',
                    left: clipping.x,
                    top: clipping.y,
                    width: clipping.width,
                    height: clipping.height,
                    border: '2px solid #10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                  }}
                />
              ))}
            </div>
          </Document>
        </div>
      </div>

      {/* Page Controls - Hidden on mobile, shown on desktop */}
      {!isMobile && (
        <div className="pdf-controls" style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '10px 16px',
          borderRadius: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <button 
            onClick={previousPage}
            disabled={pageNumber <= 1}
            style={{
              background: 'transparent',
              color: pageNumber <= 1 ? '#aaa' : 'white',
              border: '1px solid ' + (pageNumber <= 1 ? '#555' : '#fff'),
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Prev
          </button>
          
          <span style={{ 
            color: 'white', 
            alignSelf: 'center', 
            margin: '0 10px',
            fontSize: '14px',
            minWidth: '60px',
            textAlign: 'center'
          }}>
            {pageNumber} / {numPages}
          </span>
          
          <button 
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            style={{
              background: 'transparent',
              color: pageNumber >= numPages ? '#aaa' : 'white',
              border: '1px solid ' + (pageNumber >= numPages ? '#555' : '#fff'),
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Mobile Bottom Navigation Bar - Only visible on mobile */}
      {isMobile && (
        <div className="mobile-bottom-bar" style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          height: '60px',
          backgroundColor: 'white',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          // Ensure no overlap with content
          marginBottom: '0',
          marginTop: '0',
          paddingBottom: 'env(safe-area-inset-bottom, 0)', // Account for safe area on mobile devices
        }}>
          {/* Left Side - Navigation Arrows */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                opacity: pageNumber <= 1 ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
            </button>
            
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#333',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {pageNumber}/{numPages}
            </span>
            
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                opacity: pageNumber >= numPages ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          </div>
          
          {/* Right Side - Action Icons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <button
              onClick={toggleClipping}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isClipping ? '#f59e0b' : '#333'
              }}
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.25 1.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75zm4.5 0a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75zM3 5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5zm1.5 1a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-7z"/>
              </svg>
            </button>
            
            <button
              onClick={handleCalendarClick}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333'
              }}
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    {/* Share Modal */}
    {showShareModal && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(2px)'
        }}
        onClick={() => {
          cleanupImage();
          setShowShareModal(false);
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '24px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}
          >
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Share It</h2>
            <button
              onClick={() => {
                cleanupImage();
                setShowShareModal(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '4px',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
          
          {/* Cropped Image Preview */}
          <div 
            style={{
              position: 'relative',
              marginBottom: '20px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #eee',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isGeneratingPreview ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 10px',
                  animationName: 'spin',
                  animationDuration: '1s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite'
                }}></div>
                <p>Generating preview...</p>
              </div>
            ) : croppedImage ? (
              <>
                {/* Preview Image */}
                <img 
                  src={croppedImage} 
                  alt="Cropped preview" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    maxWidth: '100%'
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder-cropped-image.webp';
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
                <p>Failed to generate preview</p>
              </div>
            )}
          </div>
          
          {/* Shareable URL */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Shareable Link
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={shareUrl}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#f9f9f9'
                }}
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
                  } catch (err) {
                    console.error('Failed to copy: ', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = shareUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
                  }
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: copySuccess ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          
          {/* Social Media Buttons */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
              Share On
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {/* Facebook */}
              <button
                onClick={() => {
                  const text = 'Check out this clipping from the e-paper!';
                  const url = `${shareUrl}`;
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
                  window.open(facebookUrl, '_blank');
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#1877f2',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Share on Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z"/>
                </svg>
              </button>
              
              {/* Twitter/X */}
              <button
                onClick={() => {
                  const text = 'Check out this clipping from the e-paper!';
                  const url = `${shareUrl}`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                  window.open(twitterUrl, '_blank');
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'black',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Share on Twitter"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              
              {/* WhatsApp */}
              <button
                onClick={() => {
                  const text = `Check out this clipping from the e-paper! ${shareUrl}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#25D366',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Share on WhatsApp"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
              
              {/* Email */}
              <button
                onClick={() => {
                  const subject = 'Check out this clipping from the e-paper!';
                  const body = `I wanted to share this clipping with you: ${shareUrl}`;
                  const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.open(emailUrl, '_blank');
                }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#ea4335',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                title="Share via Email"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.open(shareUrl, '_blank')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Open
            </button>
            <button
              onClick={downloadCroppedImage}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Calendar Popup */}
    {showCalendar && createPortal(
      <CalendarPopup 
        onClose={() => setShowCalendar(false)} 
        onDateSelect={handleDateSelect}
        buttonRef={calendarButtonRef} // Pass button ref
      />,
      document.body
    )}
    
    </div>
  );
};

export default PDFViewer;