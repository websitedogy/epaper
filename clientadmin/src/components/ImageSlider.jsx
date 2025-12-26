import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PDFBreakingNewsBar from "./PDFBreakingNewsBar";
import CalendarPopup from "./CalendarPopup";
import { clippingsAPI, epaperAPI } from "../services/api";
import PublicSocialMediaIcons from "./PublicSocialMediaIcons";

const ImageSlider = ({ images, customization: propCustomization }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isClipping, setIsClipping] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
  const [customization, setCustomization] = useState(null);
  const calendarButtonRef = useRef(null);
  const imageRef = useRef(null);

  const totalPages = images.length;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch customization data
  useEffect(() => {
    // Always use propCustomization if available, otherwise fetch
    if (propCustomization) {
      console.log('ImageSlider: Received propCustomization:', propCustomization);
      setCustomization(propCustomization);
      return;
    }
    
    const fetchCustomization = async () => {
      try {
        const response = await epaperAPI.getEpaper();
        console.log('ImageSlider: Fetched customization response:', response);
        if (response && response.data && response.data.customization) {
          console.log('ImageSlider: Setting customization from API:', response.data.customization);
          setCustomization(response.data.customization);
        } else {
          console.log('ImageSlider: No customization data in response');
        }
      } catch (error) {
        console.error("Error fetching customization:", error);
      }
    };

    fetchCustomization();
  }, [propCustomization]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages]);

  const getCurrentImage = () => {
    return images.find(img => img.page === currentPage) || images[currentPage - 1];
  };

  const currentImage = getCurrentImage();

  const toggleClipping = () => {
    setIsClipping(!isClipping);
    if (!isClipping) {
      // Initialize clip box in the center of the image when starting clipping
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
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

  const handlePdfClick = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date') || new Date().toISOString().split('T')[0];
    const baseDomain = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
    const pdfUrl = `${baseDomain}/pdf?date=${date}&page=${currentPage}`;
    alert("PDF not available for this page");
  };

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handlePageChange = (newPage) => {
    goToPage(newPage);
    setShowPageSelector(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    window.location.href = `/epaper?date=${formattedDate}`;
  };

  // Prevent scrolling when calendar is open
  useEffect(() => {
    if (showCalendar) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showCalendar]);

  // Handle pinch-to-zoom gestures with enhanced responsiveness and high-resolution support
  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    let initialScale = 1;
    let currentScale = 1;
    let lastUpdateTime = 0;
    let highResLoaded = false;
    let originalSrc = currentImage?.imageUrl;
    let highResImage = null;
    
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
        lastUpdateTime = Date.now();
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault(); // Prevent default scrolling behavior
        
        // Throttle updates for better performance
        const now = Date.now();
        if (now - lastUpdateTime < 16) return; // ~60fps limit
        lastUpdateTime = now;
        
        // For better text sharpness during zoom, update more frequently at critical zoom levels
        const shouldUpdateImmediately = (currentScale > 1.2 && currentScale < 1.3) || 
          (currentScale > 2.4 && currentScale < 2.6);
        if (shouldUpdateImmediately) {
          lastUpdateTime = 0; // Force update on next frame
        }
        
        // Calculate current distance between fingers
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // Calculate new scale with enhanced sensitivity
        const scaleFactor = currentDistance / initialDistance;
        currentScale = Math.min(Math.max(initialScale * scaleFactor, 0.5), 8); // Increased max zoom to 8x
        
        // Load high-resolution image when zooming in significantly
        if (currentScale > 1.5 && !highResLoaded && originalSrc) {
          // Check if there's a high-resolution version available
          const highResSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '_highres.$1');
          
          // Preload high-res image if not already loaded
          if (!highResImage) {
            highResImage = new Image();
            highResImage.onload = () => {
              if (element && element.src === originalSrc) {
                element.src = highResSrc;
                highResLoaded = true;
              }
            };
            highResImage.onerror = () => {
              // If high-res image doesn't exist, keep using original
              console.log('High-resolution image not available, using original');
              highResImage = null;
            };
            highResImage.src = highResSrc;
          } else if (element && element.src === originalSrc) {
            // If already preloaded, use it immediately
            element.src = highResImage.src;
            highResLoaded = true;
          }
        }
        
        // Apply scale transform to image with hardware acceleration
        element.style.transform = `translateZ(0) scale(${currentScale})`;
        element.style.transformOrigin = 'center center';
        
        // Enhance image rendering quality during zoom
        // Enhanced rendering modes based on zoom level for optimal sharpness
        if (currentScale > 2.5) {
          element.style.imageRendering = 'pixelated';
          element.style.webkitImageRendering = 'pixelated';
          element.style.mozImageRendering = 'pixelated';
          element.style.msImageRendering = 'pixelated';
          element.style.oImageRendering = 'pixelated';
        } else if (currentScale > 1.2) {
          element.style.imageRendering = 'crisp-edges';
          element.style.webkitImageRendering = '-webkit-optimize-contrast';
          element.style.mozImageRendering = '-moz-crisp-edges';
          element.style.msImageRendering = 'nearest-neighbor';
          element.style.oImageRendering = '-o-crisp-edges';
        } else {
          element.style.imageRendering = '-webkit-optimize-contrast';
          element.style.webkitImageRendering = '-webkit-optimize-contrast';
          element.style.mozImageRendering = '-moz-crisp-edges';
          element.style.msImageRendering = 'nearest-neighbor';
          element.style.oImageRendering = '-o-crisp-edges';
        }
        
        // NEW: Additional enhancements for ultra-sharp text rendering during zoom
        element.style.contain = 'strict';
        element.style.contentVisibility = 'auto';
        element.style.perspective = '1px';
        element.style.webkitPerspective = '1px';
        element.style.isolation = 'isolate';
        element.style.mixBlendMode = 'plus-lighter';
        element.style.willChange = 'transform';
      }
    };

    const handleTouchEnd = (e) => {
      // Reset to original image when zoom level is low
      if (currentScale < 1.2 && highResLoaded && originalSrc && element) {
        element.src = originalSrc;
        highResLoaded = false;
        element.style.imageRendering = 'crisp-edges';
        element.style.webkitImageRendering = '-webkit-optimize-contrast';
        element.style.mozImageRendering = '-moz-crisp-edges';
        element.style.msImageRendering = 'nearest-neighbor';
        element.style.oImageRendering = '-o-crisp-edges';
      }
      
      // Reset scale if it's close to 1
      if (Math.abs(currentScale - 1) < 0.1) {
        currentScale = 1;
        if (element) {
          element.style.transform = 'translateZ(0) scale(1)';
          element.style.imageRendering = '-webkit-optimize-contrast';
          element.style.webkitImageRendering = '-webkit-optimize-contrast';
          element.style.mozImageRendering = '-moz-crisp-edges';
          element.style.msImageRendering = 'nearest-neighbor';
          element.style.oImageRendering = '-o-crisp-edges';
          element.style.willChange = 'auto';
        }
      }
    };

    // Mouse wheel zoom support for desktop
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        currentScale = Math.min(Math.max(currentScale + delta, 0.5), 8);
        
        // For better text sharpness during zoom, update more frequently at critical zoom levels
        const shouldUpdateImmediately = (currentScale > 1.2 && currentScale < 1.3) || 
          (currentScale > 2.4 && currentScale < 2.6);
        if (shouldUpdateImmediately) {
          // Force immediate update for better text sharpness
          if (element) {
            element.style.transform = `translateZ(0) scale(${currentScale})`;
          }
        }
        
        // Apply scale transform
        if (element) {
          element.style.transform = `translateZ(0) scale(${currentScale})`;
          element.style.transformOrigin = 'center center';
          element.style.willChange = 'transform';
          
          // Enhance image rendering quality during zoom
          // Enhanced rendering modes based on zoom level for optimal sharpness
          if (currentScale > 2.5) {
            element.style.imageRendering = 'pixelated';
            element.style.webkitImageRendering = 'pixelated';
            element.style.mozImageRendering = 'pixelated';
            element.style.msImageRendering = 'pixelated';
            element.style.oImageRendering = 'pixelated';
          } else if (currentScale > 1.2) {
            element.style.imageRendering = 'crisp-edges';
            element.style.webkitImageRendering = '-webkit-optimize-contrast';
            element.style.mozImageRendering = '-moz-crisp-edges';
            element.style.msImageRendering = 'nearest-neighbor';
            element.style.oImageRendering = '-o-crisp-edges';
          } else {
            element.style.imageRendering = '-webkit-optimize-contrast';
            element.style.webkitImageRendering = '-webkit-optimize-contrast';
            element.style.mozImageRendering = '-moz-crisp-edges';
            element.style.msImageRendering = 'nearest-neighbor';
            element.style.oImageRendering = '-o-crisp-edges';
          }
          
          // NEW: Additional enhancements for ultra-sharp text rendering during zoom
          element.style.contain = 'strict';
          element.style.contentVisibility = 'auto';
          element.style.perspective = '1px';
          element.style.webkitPerspective = '1px';
          element.style.isolation = 'isolate';
          element.style.mixBlendMode = 'plus-lighter';
        }
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('wheel', handleWheel);
      // Clean up high-res image
      if (highResImage) {
        highResImage = null;
      }
    };
  }, [currentImage]);
  // Add mouse and touch event listeners for clipping
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

  // Handle mouse down on clip box
  const handleMouseDown = (e, action = 'move', handle = null) => {
    e.stopPropagation();
    if (!clipBox || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    
    if (action === 'move') {
      setDragging(true);
    } else if (action === 'resize') {
      setResizing(handle);
    }
  };

  // Handle touch start on clip box
  const handleTouchStart = (e, action = 'move', handle = null) => {
    e.stopPropagation();
    if (!clipBox || !imageRef.current || !e.touches[0]) return;
    
    const rect = imageRef.current.getBoundingClientRect();
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
    if (!clipBox || (!dragging && !resizing) || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    if (dragging) {
      setClipBox(prev => {
        if (!prev) return null;
        const newX = x - (dragStart.x - prev.x);
        const newY = y - (dragStart.y - prev.y);
        const boundedX = Math.max(0, Math.min(newX, rect.width - prev.width));
        const boundedY = Math.max(0, Math.min(newY, rect.height - prev.height));
        return { ...prev, x: boundedX, y: boundedY };
      });
    } else if (resizing) {
      setClipBox(prev => {
        if (!prev) return null;
        let newBox = { ...prev };
        
        switch (resizing) {
          case 'nw':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'n':
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'ne':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'e':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            break;
          case 'se':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 's':
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 'sw':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
          case 'w':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
        }
        
        newBox.width = Math.min(newBox.width, rect.width - newBox.x);
        newBox.height = Math.min(newBox.height, rect.height - newBox.y);
        return newBox;
      });
    }
    
    setDragStart({ x, y });
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!clipBox || (!dragging && !resizing) || !imageRef.current || !e.touches[0]) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.touches[0].clientY - rect.top, rect.height));
    
    if (dragging) {
      setClipBox(prev => {
        if (!prev) return null;
        const newX = x - (dragStart.x - prev.x);
        const newY = y - (dragStart.y - prev.y);
        const boundedX = Math.max(0, Math.min(newX, rect.width - prev.width));
        const boundedY = Math.max(0, Math.min(newY, rect.height - prev.height));
        return { ...prev, x: boundedX, y: boundedY };
      });
    } else if (resizing) {
      setClipBox(prev => {
        if (!prev) return null;
        let newBox = { ...prev };
        
        switch (resizing) {
          case 'nw':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'n':
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'ne':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height - (y - dragStart.y));
            newBox.y = Math.max(0, Math.min(prev.y + (y - dragStart.y), rect.height - newBox.height));
            break;
          case 'e':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            break;
          case 'se':
            newBox.width = Math.max(20, prev.width + (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 's':
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            break;
          case 'sw':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.height = Math.max(20, prev.height + (y - dragStart.y));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
          case 'w':
            newBox.width = Math.max(20, prev.width - (x - dragStart.x));
            newBox.x = Math.max(0, Math.min(prev.x + (x - dragStart.x), rect.width - newBox.width));
            break;
        }
        
        newBox.width = Math.min(newBox.width, rect.width - newBox.x);
        newBox.height = Math.min(newBox.height, rect.height - newBox.y);
        return newBox;
      });
    }
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(null);
  };

  const handleTouchEnd = () => {
    setDragging(false);
    setResizing(null);
  };

  // Download cropped image
  const downloadCroppedImage = () => {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = 'clipped-image.png';
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

  // Generate cropped image with clip settings applied (for regular images, not PDF)
  const generateCroppedImage = async () => {
    if (!clipBox || !imageRef.current) return Promise.reject(new Error('No clip box or image reference'));
    
    setIsGeneratingPreview(true);
    
    return new Promise((resolve, reject) => {
      try {
        const img = imageRef.current;
        
        // Wait for image to be fully loaded
        if (!img.complete || img.naturalWidth === 0) {
          img.onload = () => processImage();
          img.onerror = () => reject(new Error('Failed to load image'));
        } else {
          processImage();
        }
        
        function processImage() {
          try {
            // Get clip customization settings
            const clipSettings = customization?.clip || {};
            const topClipSettings = clipSettings.topClip || {};
            const footerClipSettings = clipSettings.footerClip || {};
            const displayOptions = clipSettings.displayOptions || {};
            
            // Get logo URLs
            const topLogoUrl = clipSettings.topLogoUrl || '';
            const footerLogoUrl = clipSettings.footerLogoUrl || '';
            
            // Get the actual display dimensions
            const rect = img.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            
            // Calculate actual crop dimensions
            const cropX = Math.round(clipBox.x * scaleX);
            const cropY = Math.round(clipBox.y * scaleY);
            const cropWidth = Math.round(clipBox.width * scaleX);
            const cropHeight = Math.round(clipBox.height * scaleY);
            
            // Calculate banner heights
            const topBannerHeight = topClipSettings.logoHeight || 50;
            const footerBannerHeight = footerClipSettings.logoHeight || 50;
            const totalHeight = cropHeight + topBannerHeight + footerBannerHeight;
            
            // Create canvas for final composed image
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
            
            // Set canvas size
            tempCanvas.width = cropWidth;
            tempCanvas.height = totalHeight;
            
            // Function to draw the complete image with banners
            const drawCompleteImage = () => {
              // Fill top banner with background color
              tempCtx.fillStyle = topClipSettings.backgroundColor || '#ffffff';
              tempCtx.fillRect(0, 0, cropWidth, topBannerHeight);
              
              // Draw top logo if available
              if (topLogoUrl) {
                const topLogo = new Image();
                topLogo.crossOrigin = 'anonymous'; // Enable CORS
                topLogo.onload = () => {
                  try {
                    // Calculate logo dimensions maintaining aspect ratio
                    const maxWidth = cropWidth * 0.3;
                    const maxHeight = topBannerHeight * 0.8;
                    let logoWidth = topLogo.width;
                    let logoHeight = topLogo.height;
                    
                    if (logoWidth > maxWidth || logoHeight > maxHeight) {
                      const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
                      logoWidth *= scale;
                      logoHeight *= scale;
                    }
                    
                    // Calculate position based on alignment
                    let x = 20;
                    if (topClipSettings.position === 'Center') {
                      x = (cropWidth - logoWidth) / 2;
                    } else if (topClipSettings.position === 'Right') {
                      x = cropWidth - logoWidth - 20;
                    }
                    
                    const y = (topBannerHeight - logoHeight) / 2;
                    tempCtx.drawImage(topLogo, x, y, logoWidth, logoHeight);
                    finishDrawing();
                  } catch (error) {
                    console.warn('Error drawing top logo:', error);
                    finishDrawing();
                  }
                };
                topLogo.onerror = () => finishDrawing();
                topLogo.src = topLogoUrl;
              } else {
                finishDrawing();
              }
            };
            
            // Function to draw the cropped content and footer
            const finishDrawing = () => {
              try {
                // Draw the cropped portion of the image
                tempCtx.drawImage(
                  img,
                  cropX, cropY, cropWidth, cropHeight,
                  0, topBannerHeight, cropWidth, cropHeight
                );
                
                // Fill footer banner with background color
                tempCtx.fillStyle = footerClipSettings.backgroundColor || '#ffffff';
                tempCtx.fillRect(0, topBannerHeight + cropHeight, cropWidth, footerBannerHeight);
                
                // Draw footer logo if available
                if (footerLogoUrl) {
                  const footerLogo = new Image();
                  footerLogo.crossOrigin = 'anonymous'; // Enable CORS
                  footerLogo.onload = () => {
                    try {
                      const maxWidth = cropWidth * 0.3;
                      const maxHeight = footerBannerHeight * 0.8;
                      let logoWidth = footerLogo.width;
                      let logoHeight = footerLogo.height;
                      
                      if (logoWidth > maxWidth || logoHeight > maxHeight) {
                        const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
                        logoWidth *= scale;
                        logoHeight *= scale;
                      }
                      
                      let x = 20;
                      if (footerClipSettings.position === 'Center') {
                        x = (cropWidth - logoWidth) / 2;
                      } else if (footerClipSettings.position === 'Right') {
                        x = cropWidth - logoWidth - 20;
                      }
                      
                      const y = topBannerHeight + cropHeight + (footerBannerHeight - logoHeight) / 2;
                      tempCtx.drawImage(footerLogo, x, y, logoWidth, logoHeight);
                      addTextOverlays();
                    } catch (error) {
                      console.warn('Error drawing footer logo:', error);
                      addTextOverlays();
                    }
                  };
                  footerLogo.onerror = () => addTextOverlays();
                  footerLogo.src = footerLogoUrl;
                } else {
                  addTextOverlays();
                }
              } catch (error) {
                console.warn('Error in finishDrawing:', error);
                addTextOverlays();
              }
            };
            
            // Function to add text overlays (date and page number)
            const addTextOverlays = () => {
              try {
                const date = new Date().toLocaleDateString();
                const pageNumText = `Page ${currentPage}`;
                const domainName = window.location.hostname || 'epaper';
                
                tempCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                tempCtx.font = '12px Arial';
                
                const footerYPosition = topBannerHeight + cropHeight + footerBannerHeight - 10;
                
                if (displayOptions.showDate !== false) {
                  tempCtx.fillText(`${domainName} | ${date}`, 10, footerYPosition);
                }
                
                if (displayOptions.showPageNumber !== false) {
                  const pageNumMetrics = tempCtx.measureText(pageNumText);
                  tempCtx.fillText(pageNumText, cropWidth - pageNumMetrics.width - 10, footerYPosition);
                }
                
                // Convert to blob
                tempCanvas.toBlob((blob) => {
                  if (blob) {
                    const dataUrl = URL.createObjectURL(blob);
                    setCroppedImage(dataUrl);
                    setIsGeneratingPreview(false);
                    resolve(dataUrl);
                  } else {
                    setIsGeneratingPreview(false);
                    reject(new Error('Failed to create blob'));
                  }
                }, 'image/png');
              } catch (error) {
                console.error('Error in addTextOverlays:', error);
                setIsGeneratingPreview(false);
                reject(error);
              }
            };
            
            // Start the drawing process
            drawCompleteImage();
          } catch (error) {
            console.error('Error in processImage:', error);
            setIsGeneratingPreview(false);
            reject(error);
          }
        }
      } catch (error) {
        console.error('Error generating cropped image:', error);
        setIsGeneratingPreview(false);
        reject(error);
      }
    });
  };

  const isMobile = windowWidth < 768;

  // Navigation button styles - Same as PDFViewer
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
    zIndex: 100,
    pointerEvents: 'auto'
  };

  const disabledButtonStyle = {
    ...navButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  return (
    <div className="pdf-viewer-container" style={{ 
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#f0f0f0',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '0'
    }}>

      {/* Top Toolbar - Always show like PDFViewer */}
      {(
        customization?.topToolbarSettings?.modifiedHtml ? (
          <div 
            className="top-toolbar-modified"
            dangerouslySetInnerHTML={{ 
              __html: `
                ${customization.topToolbarSettings.modifiedHtml}
                <style>${customization.topToolbarSettings.modifiedCss || ''}</style>
              ` 
            }}
          />
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '95%',
            maxWidth: '800px',
            flexDirection: 'row',
            gap: '0',
            overflowX: windowWidth <= 576 ? 'auto' : 'visible',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            margin: '10px auto',
            flexWrap: windowWidth <= 576 ? 'nowrap' : 'wrap'
          }} className="crisp-text">            {/* Hide scrollbar for Webkit browsers */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {/* Page Selector Dropdown - Hidden in mobile view */}
            {windowWidth > 576 && (
              <div style={{ 
                position: 'relative',
                minWidth: windowWidth <= 576 ? 'auto' : '120px',
                flexShrink: windowWidth <= 576 ? 0 : 'initial'
              }} className="crisp-text">
                <button
                  onClick={() => setShowPageSelector(!showPageSelector)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '20px',
                    padding: windowWidth <= 576 ? '8px 12px' : '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minWidth: windowWidth <= 576 ? 'auto' : '120px',
                    height: windowWidth <= 576 ? '36px' : 'auto'
                  }}
                >
                  <span>Page {currentPage}</span>
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
                    minWidth: windowWidth <= 576 ? '100px' : '120px',
                    zIndex: 1001
                  }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <div
                        key={page}
                        onClick={() => handlePageChange(page)}
                        style={{
                          padding: windowWidth <= 576 ? '10px 14px' : '10px 16px',
                          cursor: 'pointer',
                          backgroundColor: page === currentPage ? '#e5e7eb' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '14px',
                          fontWeight: page === currentPage ? '600' : 'normal',
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
              margin: windowWidth <= 576 ? '0 5px' : '0 10px',
              flexShrink: 0
            }} className="crisp-text">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.5 : 1,
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
                {currentPage} / {totalPages}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.5 : 1,
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
            }} className="crisp-text">
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
                  height: windowWidth <= 576 ? '36px' : 'auto',
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
                  display: windowWidth <= 576 ? 'none' : 'inline'
                }}>
                  {isClipping ? 'Cancel Clip' : 'Clip'}
                </span>
              </button>
              
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
                  height: windowWidth <= 576 ? '36px' : 'auto',
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
                  display: windowWidth <= 576 ? 'none' : 'inline'
                }}>
                  PDF
                </span>
              </button>
              
              <button 
                ref={calendarButtonRef}
                onClick={handleCalendarClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: windowWidth <= 576 ? '8px 10px' : '8px 12px',
                  backgroundColor: showCalendar ? '#059669' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  height: windowWidth <= 576 ? '36px' : 'auto',
                  whiteSpace: 'nowrap',
                  transform: showCalendar ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
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
                <i className="fas fa-calendar-alt" style={{
                  width: '16px', 
                  height: '16px', 
                  marginRight: windowWidth <= 576 ? '0' : '5px'
                }}></i>
                <span style={{ 
                  display: windowWidth <= 576 ? 'none' : 'inline'
                }}>
                  Calendar
                </span>
              </button>
            </div>
          </div>
        )
      )}
      
      {/* Ripple animation style */}
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        /* Crisp text rendering optimizations */
        .crisp-text {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-feature-settings: "liga" 1;
          -webkit-text-size-adjust: 100%;
          -moz-text-size-adjust: 100%;
          text-size-adjust: 100%;
          /* Additional text sharpening for high-DPI displays */
          -webkit-font-smoothing: subpixel-antialiased;
          font-smooth: always;
          /* Further enhancements for crisp text */
          text-shadow: 0 0 1px rgba(0,0,0,0.01);
        }
        
        /* High DPI image rendering with enhanced sharpness */
        img.crisp-image {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          -ms-interpolation-mode: nearest-neighbor;
          /* Enhanced for zoom operations */
          transform-origin: center center;
          will-change: transform;
          /* Additional properties for sharper text */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: geometricPrecision;
          shape-rendering: crispEdges;
          /* Enhanced properties for maximum sharpness */
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          -ms-transform: translateZ(0);
          -o-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          /* Sharpening for high-resolution displays */
          image-resolution: from-image;
          image-orientation: from-image;
          /* Additional properties for maximum sharpness */
          filter: contrast(1.05) saturate(1.1);
          mix-blend-mode: normal;
          /* NEW: Additional enhancements for ultra-sharp text rendering */
          contain: strict;
          content-visibility: auto;
          /* NEW: Hardware acceleration enhancements */
          perspective: 1px;
          -webkit-perspective: 1px;
          /* NEW: Subpixel rendering optimizations */
          -webkit-text-stroke: 0.1px transparent;
          text-stroke: 0.1px transparent;
          /* NEW: Enhanced anti-aliasing */
          -webkit-filter: contrast(1.05) saturate(1.05) brightness(1.02);
          filter: contrast(1.05) saturate(1.05) brightness(1.02);
          /* NEW: Additional sharpness enhancements */
          isolation: isolate;
          mix-blend-mode: plus-lighter;
        }
        
        /* Container optimizations for smooth zooming */
        .pdf-content {
          contain: layout style paint;
          /* Additional container optimizations for image sharpness */
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          -ms-transform: translateZ(0);
          -o-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>

      {/* Bottom Fixed Bar - New Feature (Mobile Only) */}
      {windowWidth <= 768 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end', // Align items to the right
          zIndex: 1000,
          height: '60px'
        }} className="crisp-text">
          {/* Right Side - Icons Only */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px' // Space between icons
          }}>
            {/* Clip Icon */}
            <button 
              onClick={toggleClipping}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: isClipping ? '#f59e0b' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title={isClipping ? 'Cancel Clip' : 'Clip'}
            >
              <i className="fas fa-scissors" style={{ fontSize: '20px' }}></i>
            </button>
            
            {/* Calendar Icon */}
            <button 
              ref={calendarButtonRef}
              onClick={handleCalendarClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: showCalendar ? '#059669' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transform: showCalendar ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
              title="Calendar"
            >
              <i className="fas fa-calendar-alt" style={{ fontSize: '20px' }}></i>
            </button>
          </div>
        </div>
      )}

      {/* PDF Breaking News Bar - Shown below the Top Toolbar */}
      <PDFBreakingNewsBar customization={customization} />

      {/* Social Media Icons Above Slider - REMOVED to avoid duplication */}

      {/* Image Content - Same structure as PDFViewer */}
      <div 
        className="pdf-content crisp-text"
        style={{ 
          width: '100%', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '10px',
          paddingBottom: windowWidth <= 768 ? '80px' : '20px', // Dynamic padding based on screen size
          paddingLeft: '0',
          paddingRight: '0',
          boxSizing: 'border-box',
          overflow: 'hidden',
          touchAction: 'pan-x pan-y',
          imageRendering: 'crisp-edges',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform',
          position: 'relative'
        }}
      >
      
      {/* Navigation Arrows */}
      <div className="pdf-navigation" style={{
        position: 'absolute',
        top: '50%',
        left: isMobile ? '5px' : '15px',
        right: isMobile ? '5px' : '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none' // Keep this to allow buttons to receive events
      }}>
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          style={currentPage <= 1 ? disabledButtonStyle : navButtonStyle}
        >
          &larr;
        </button>
        
        <button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          style={currentPage >= totalPages ? disabledButtonStyle : navButtonStyle}
        >
          &rarr;
        </button>
      </div>        <div style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          imageRendering: 'crisp-edges',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}>
          {currentImage?.imageUrl ? (
            <div style={{ position: 'relative', cursor: isClipping ? 'crosshair' : 'default' }}>
              <img
                ref={imageRef}
                src={currentImage.imageUrl}
                alt={`Page ${currentPage}`}
                crossOrigin="anonymous"
                className="crisp-image"
                // Attempt to load high-resolution version if available
                onLoad={(e) => {
                  // Preload high-res version in the background
                  const highResSrc = currentImage.imageUrl.replace(/\.(jpg|jpeg|png)$/i, '_highres.$1');
                  const img = new Image();
                  img.onload = () => {
                    // High-res version exists, keep reference for zooming
                    console.log('High-resolution image preloaded');
                  };
                  img.onerror = () => {
                    // High-res version doesn't exist
                    console.log('No high-resolution version available');
                  };
                  img.src = highResSrc;
                }}
                // Set image decoding for better quality
                decoding="async"
                loading="lazy"
                style={{
                  width: isMobile ? windowWidth * 0.9 : windowWidth * 0.75,
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  // Enhanced rendering for maximum sharpness
                  imageRendering: '-webkit-optimize-contrast',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  // Enhanced rendering for crisp text with zoom support
                  msInterpolationMode: 'nearest-neighbor',
                  transition: 'transform 0.1s ease, image-rendering 0.1s ease',
                  willChange: 'transform',
                  // Higher quality interpolation for smoother zoom
                  imageResolution: 'from-image',
                  // Additional properties for sharper text during zoom
                  textRendering: 'geometricPrecision',
                  shapeRendering: 'crispEdges',
                  fontSmooth: 'always',
                  imageOrientation: 'from-image',
                  // Additional properties for high-DPI displays
                  '-webkit-font-smoothing': 'antialiased',
                  '-moz-osx-font-smoothing': 'grayscale',
                  // Enhanced properties for maximum sharpness during zoom
                  MozBackfaceVisibility: 'hidden',
                  OBackfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  msBackfaceVisibility: 'hidden',
                  // Ensure crisp edges on all browsers
                  imageRendering: 'crisp-edges',
                  msImageRendering: 'nearest-neighbor',
                  mozImageRendering: '-moz-crisp-edges',
                  oImageRendering: '-o-crisp-edges',
                  webkitImageRendering: '-webkit-optimize-contrast',
                  // Additional enhancements for maximum sharpness
                  filter: 'contrast(1.05) saturate(1.1)',
                  mixBlendMode: 'normal',
                  isolation: 'isolate',
                  // NEW: Additional enhancements for ultra-sharp text rendering
                  contain: 'strict',
                  contentVisibility: 'auto',
                  // NEW: Hardware acceleration enhancements
                  perspective: '1px',
                  WebkitPerspective: '1px',
                  // NEW: Subpixel rendering optimizations
                  WebkitTextStroke: '0.1px transparent',
                  textStroke: '0.1px transparent',
                  // NEW: Enhanced anti-aliasing
                  WebkitFilter: 'contrast(1.05) saturate(1.05) brightness(1.02)',
                  filter: 'contrast(1.05) saturate(1.05) brightness(1.02)',
                  // NEW: Additional sharpness enhancements
                  isolation: 'isolate',
                  mixBlendMode: 'plus-lighter'
                }}
              />
              
              {/* Clip Box Overlay */}
              {isClipping && clipBox && (
                <div>
                  {/* Dimming overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 999
                  }} />
                  
                  {/* Transparent hole */}
                  <div style={{
                    position: 'absolute',
                    left: clipBox.x,
                    top: clipBox.y,
                    width: clipBox.width,
                    height: clipBox.height,
                    pointerEvents: 'none',
                    zIndex: 1000,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }} />
                  
                  {/* Clip box with handles */}
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
                  >
                    {/* 8 Resize Handles */}
                    {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
                      const positions = {
                        nw: { top: '-4px', left: '-4px', cursor: 'nw-resize' },
                        n: { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
                        ne: { top: '-4px', right: '-4px', cursor: 'ne-resize' },
                        e: { top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'e-resize' },
                        se: { bottom: '-4px', right: '-4px', cursor: 'se-resize' },
                        s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
                        sw: { bottom: '-4px', left: '-4px', cursor: 'sw-resize' },
                        w: { top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'w-resize' }
                      };
                      
                      return (
                        <div
                          key={handle}
                          style={{
                            position: 'absolute',
                            ...positions[handle],
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#3b82f6',
                            border: '1px solid white',
                            borderRadius: '50%',
                            zIndex: 1002
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                          onTouchStart={(e) => handleTouchStart(e, 'resize', handle)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{
                    position: 'absolute',
                    top: clipBox.y - 40,
                    left: clipBox.x + clipBox.width - 160,
                    display: 'flex',
                    gap: '8px',
                    zIndex: 1003
                  }}>
                    <button
                      onClick={async () => {
                        let generatedImageUrl = null;
                        try {
                          generatedImageUrl = await generateCroppedImage();
                        } catch (error) {
                          alert('Failed to generate clipped image. Please try again.');
                          return;
                        }
                        
                        if (!generatedImageUrl) {
                          alert('No image generated. Please try again.');
                          return;
                        }
                        
                        try {
                          const urlParams = new URLSearchParams(window.location.search);
                          const paperId = urlParams.get('paperId') || 'unknown';
                          
                          const imageResponse = await fetch(generatedImageUrl);
                          const imageBlob = await imageResponse.blob();
                          
                          const clippingFormData = new FormData();
                          clippingFormData.append('clippingImage', imageBlob, 'clipped-image.png');
                          clippingFormData.append('paperId', paperId);
                          clippingFormData.append('page', currentPage);
                          clippingFormData.append('coordinates[x]', clipBox.x);
                          clippingFormData.append('coordinates[y]', clipBox.y);
                          clippingFormData.append('coordinates[width]', clipBox.width);
                          clippingFormData.append('coordinates[height]', clipBox.height);
                          
                          const clippingResponse = await clippingsAPI.createClipping(clippingFormData);
                          
                          if (clippingResponse.success && clippingResponse.data) {
                            const baseDomain = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
                            const newShareUrl = `${baseDomain}/clip/${clippingResponse.data.clipId}`;
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
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Share
                    </button>
                    
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
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <p>Image not available</p>
            </div>
          )}
        </div>
      </div>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
              >
                ×
              </button>
            </div>
            
            {/* Cropped Image Preview */}
            <div style={{
              position: 'relative',
              marginBottom: '20px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #eee',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isGeneratingPreview ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 10px'
                  }}></div>
                  <p>Generating preview...</p>
                </div>
              ) : croppedImage ? (
                <img 
                  src={croppedImage} 
                  alt="Cropped preview" 
                  style={{ width: '100%', height: 'auto', display: 'block', maxWidth: '100%' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
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
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch (err) {
                      const textArea = document.createElement('textarea');
                      textArea.value = shareUrl;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
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
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12z"/>
                  </svg>
                </button>
                
                {/* Twitter/X */}
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
                
                {/* WhatsApp */}
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </button>
                
                {/* Email */}
                <button
                  onClick={() => window.open(`mailto:?subject=Check this out&body=${encodeURIComponent(shareUrl)}`, '_blank')}
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
                  fontSize: '16px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
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
                  fontSize: '16px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
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

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;
