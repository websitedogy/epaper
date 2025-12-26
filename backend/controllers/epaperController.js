import Epaper from "../models/Epaper.js";
import Client from "../models/Client.js";
import upload from "../middleware/upload.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fsExtra from "fs-extra";
import * as pdf2pic from "pdf2pic";
import * as pdfParse from "pdf-parse";
import pdf from "pdf-poppler"; // Add this import for pdf-poppler

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Get or create epaper for client
// @route   GET /api/epaper
// @access  Private
export const getEpaper = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    let epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      epaper = await Epaper.create({ clientId: client._id });
    }

    // Ensure social media styles exist with defaults
    const socialMediaStyles = client.socialMediaStyles || {
      style1: {
        name: "Style 1",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style2: {
        name: "Style 2",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style3: {
        name: "Style 3",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style4: {
        name: "Style 4",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style5: {
        name: "Style 5",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      }
    };

    // Ensure selected social media style exists with default
    const selectedSocialMediaStyle = client.selectedSocialMediaStyle || "style1";
    // Return client data including categories, subcategories, pages, customization, ads, and papers
    res.status(200).json({
      success: true,
      data: {
        categories: client.categories || [],
        subCategories: client.subCategories || [],
        pages: client.pages || [],
        customization: {
          ...(client.customization ? client.customization.toObject() : {}),
          socialMediaStyles: socialMediaStyles,
          selectedSocialMediaStyle: selectedSocialMediaStyle,
          socialLinks: client.customization?.socialLinks || { iconStyle: "circle", links: {} }
        },
        ads: client.ads || [],
        papers: epaper.papers || [],
      },
    });  } catch (error) {
    console.error("Error in getEpaper:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PAPERS MANAGEMENT

// @desc    Create new paper with PDF processing
// @route   POST /api/epaper/papers
// @access  Private
export const createPaper = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    let epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      epaper = await Epaper.create({ clientId: client._id });
    }

    // Check for duplicate scheduled date
    if (req.body.scheduleDate) {
      const existingPaper = epaper.papers.find(
        (paper) =>
          paper.scheduleDate &&
          new Date(paper.scheduleDate).toDateString() ===
            new Date(req.body.scheduleDate).toDateString()
      );

      if (existingPaper) {
        return res.status(400).json({
          success: false,
          message: "A paper is already scheduled for this date",
        });
      }
    }

    // Process PDF if uploaded
    if (req.files && req.files.pdf) {
      const pdfFile = req.files.pdf[0];
      const pdfPath = pdfFile.path;

      // Set PDF URL and size
      req.body.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${
        pdfFile.filename
      }`;
      req.body.pdfSize = pdfFile.size;

      // Parse form data from the "data" field if it exists
      if (req.body.data) {
        try {
          const parsedData = JSON.parse(req.body.data);
          // Merge parsed data with req.body
          Object.assign(req.body, parsedData);
        } catch (parseError) {
          console.error("Error parsing form data:", parseError);
        }
      }

      // Get PDF page count
      try {
        const pdfBuffer = fs.readFileSync(pdfPath);
        // Use pdf-parse correctly by importing the default export
        const pdfData = await pdfParse(pdfBuffer);
        req.body.pageCount = pdfData.numpages;
        console.log("PDF page count extracted:", pdfData.numpages);
      } catch (pageCountError) {
        console.error("Error getting page count:", pageCountError);
        req.body.pageCount = 0;
      }

      // Convert PDF to images using pdf-poppler with high-quality settings for sharp text rendering
      // Using PNG format at 350 DPI with full anti-aliasing for optimal quality
      try {
        const outputDir = path.join(__dirname, "..", "uploads", "pages");
        await fsExtra.ensureDir(outputDir);

        // Generate unique folder for this PDF
        const pdfId = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const pdfOutputDir = path.join(outputDir, pdfId);
        await fsExtra.ensureDir(pdfOutputDir);

        // Convert PDF to images using pdf-poppler with enhanced quality settings
        const opts = {
          format: "png",
          out_dir: pdfOutputDir,
          out_prefix: "page",
          page: null, // Convert all pages
          dpi: 400, // Increased DPI for sharper text rendering (was 350)
          antialias: true,
          text_antialias: true,
          graphics_antialias: true,
          text_alpha_bits: 4,
          graphics_alpha_bits: 4,
          // Additional quality enhancement options
          jpeg_quality: 100, // Not used for PNG but ensures max quality if fallback occurs
          png_upscale: true, // Enable PNG upscaling for better quality
          paper_size: "A4", // Standard paper size for consistency
          fit_to_page: true, // Ensure content fits page properly
          // Color profile settings for better color accuracy
          default_ccode: "srgb", // Standard RGB color space
          overprint_preview: true // Better color handling
        };

        await pdf.convert(pdfPath, opts);

        // Read generated images and create image URLs
        const files = await fsExtra.readdir(pdfOutputDir);
        const imageFiles = files
          .filter(file => file.endsWith(".png"))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.match(/\d+/)?.[0] || "0");
            return numA - numB;
          });

        req.body.images = imageFiles.map((file, index) => ({
          page: index + 1,
          imageUrl: `${req.protocol}://${req.get("host")}/uploads/pages/${pdfId}/${file}`,
        }));

        console.log(`Generated ${req.body.images.length} page images`);
      } catch (imageError) {
        console.error("Error converting PDF to images:", imageError);
        req.body.images = [];
      }
    }

    // Add the paper to the epaper collection
    epaper.papers.push(req.body);
    await epaper.save();

    res.status(201).json({
      success: true,
      data: epaper.papers[epaper.papers.length - 1],
      message: "Paper created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update paper with PDF processing
// @route   PUT /api/epaper/papers/:paperId
// @access  Private
export const updatePaper = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      return res
        .status(404)
        .json({ success: false, message: "Epaper not found" });
    }

    const paper = epaper.papers.id(req.params.paperId);
    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    }

    // Check for duplicate scheduled date (excluding current paper)
    if (req.body.scheduleDate) {
      const existingPaper = epaper.papers.find(
        (p) =>
          p._id.toString() !== paper._id.toString() &&
          p.scheduleDate &&
          new Date(p.scheduleDate).toDateString() ===
            new Date(req.body.scheduleDate).toDateString()
      );

      if (existingPaper) {
        return res.status(400).json({
          success: false,
          message: "A paper is already scheduled for this date",
        });
      }
    }

    // Process PDF if uploaded
    if (req.files && req.files.pdf) {
      const pdfFile = req.files.pdf[0];
      const pdfPath = pdfFile.path;

      // Set PDF URL and size
      req.body.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${
        pdfFile.filename
      }`;
      req.body.pdfSize = pdfFile.size;

      // Parse form data from the "data" field if it exists
      if (req.body.data) {
        try {
          const parsedData = JSON.parse(req.body.data);
          // Merge parsed data with req.body
          Object.assign(req.body, parsedData);
        } catch (parseError) {
          console.error("Error parsing form data:", parseError);
        }
      }

      // Get PDF page count
      try {
        const pdfBuffer = fs.readFileSync(pdfPath);
        // Use pdf-parse correctly by importing the default export
        const pdfData = await pdfParse(pdfBuffer);
        req.body.pageCount = pdfData.numpages;
        console.log("PDF page count extracted:", pdfData.numpages);
      } catch (pageCountError) {
        console.error("Error getting page count:", pageCountError);
        req.body.pageCount = 0;
      }

      // Convert PDF to images using pdf-poppler with high-quality settings for sharp text rendering
      // Using PNG format at 400 DPI with full anti-aliasing for optimal quality
      try {
        const outputDir = path.join(__dirname, "..", "uploads", "pages");
        await fsExtra.ensureDir(outputDir);

        // Generate unique folder for this PDF
        const pdfId = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const pdfOutputDir = path.join(outputDir, pdfId);
        await fsExtra.ensureDir(pdfOutputDir);

        // Convert PDF to images using pdf-poppler with enhanced quality settings
        const opts = {
          format: "png",
          out_dir: pdfOutputDir,
          out_prefix: "page",
          page: null, // Convert all pages
          dpi: 400, // Increased DPI for sharper text rendering (was 350)
          antialias: true,
          text_antialias: true,
          graphics_antialias: true,
          text_alpha_bits: 4,
          graphics_alpha_bits: 4,
          // Additional quality enhancement options
          jpeg_quality: 100, // Not used for PNG but ensures max quality if fallback occurs
          png_upscale: true, // Enable PNG upscaling for better quality
          paper_size: "A4", // Standard paper size for consistency
          fit_to_page: true, // Ensure content fits page properly
          // Color profile settings for better color accuracy
          default_ccode: "srgb", // Standard RGB color space
          overprint_preview: true // Better color handling
        };

        await pdf.convert(pdfPath, opts);

        // Read generated images and create image URLs
        const files = await fsExtra.readdir(pdfOutputDir);
        const imageFiles = files
          .filter(file => file.endsWith(".png"))
          .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.match(/\d+/)?.[0] || "0");
            return numA - numB;
          });

        req.body.images = imageFiles.map((file, index) => ({
          page: index + 1,
          imageUrl: `${req.protocol}://${req.get("host")}/uploads/pages/${pdfId}/${file}`,
        }));

        console.log(`Generated ${req.body.images.length} page images`);
      } catch (imageError) {
        console.error("Error converting PDF to images:", imageError);
        req.body.images = [];
      }
    }

    // Update the paper with new data
    Object.assign(paper, req.body);
    await epaper.save();

    res.status(200).json({
      success: true,
      data: paper,
      message: "Paper updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete paper
// @route   DELETE /api/epaper/papers/:paperId
// @access  Private
export const deletePaper = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      return res
        .status(404)
        .json({ success: false, message: "Epaper not found" });
    }

    epaper.papers.pull(req.params.paperId);
    await epaper.save();

    res
      .status(200)
      .json({ success: true, message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Replace a single page image in a paper
// @route   PUT /api/epaper/papers/:paperId/pages/:pageNumber
// @access  Private
export const replacePage = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      return res
        .status(404)
        .json({ success: false, message: "Epaper not found" });
    }

    const paper = epaper.papers.id(req.params.paperId);
    if (!paper) {
      return res
        .status(404)
        .json({ success: false, message: "Paper not found" });
    }

    const pageNumber = parseInt(req.params.pageNumber);
    const pageIndex = paper.images.findIndex(img => img.page === pageNumber);

    if (pageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    // Check if a new page image was uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    // Create new image URL
    const newImageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Update the page image URL
    paper.images[pageIndex].imageUrl = newImageUrl;
    await epaper.save();

    res.status(200).json({
      success: true,
      data: paper.images[pageIndex],
      message: "Page replaced successfully",
    });
  } catch (error) {
    console.error("Error replacing page:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CUSTOMIZATION MANAGEMENT

// @desc    Update customization settings
// @route   PUT /api/epaper/customization
// @access  Private
export const updateCustomization = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Update customization in client document
    // Preserve existing customization and merge with new data
    const updatedCustomization = {
      navbar: {
        ...(client.customization && client.customization.navbar ? client.customization.navbar.toObject() : {}),
        ...req.body.navbar,
        // Specifically preserve menu visibility settings
        menuVisibility: {
          ...(client.customization && client.customization.navbar && client.customization.navbar.menuVisibility ? 
            client.customization.navbar.menuVisibility.toObject() : {}),
          ...req.body.navbar?.menuVisibility,
        }
      },      
      footer: {
        ...(client.customization && client.customization.footer ? client.customization.footer.toObject() : {}),
        ...req.body.footer,
      },
      clip: {
        ...(client.customization && client.customization.clip ? client.customization.clip.toObject() : {}),
        ...req.body.clip,
      },
      promotionalBanners: req.body.promotionalBanners || 
        (client.customization && client.customization.promotionalBanners ? client.customization.promotionalBanners : []) || [],
      topToolbarSettings: {
        ...(client.customization && client.customization.topToolbarSettings ? client.customization.topToolbarSettings.toObject() : {}),
        ...req.body.topToolbarSettings,
      },
      breakingNews: req.body.breakingNews || 
        (client.customization && client.customization.breakingNews ? client.customization.breakingNews : []) || [],
      socialLinks: req.body.socialLinks || 
        (client.customization && client.customization.socialLinks ? client.customization.socialLinks : { iconStyle: "circle", links: {} }),
    };

    // Handle social media styles - store directly in customization
    // Check if socialMediaStyles is directly in req.body
    if (req.body.socialMediaStyles) {
      updatedCustomization.socialMediaStyles = req.body.socialMediaStyles;
    } 
    // Check if socialMediaStyles is in the customization object
    else if (req.body.customization && req.body.customization.socialMediaStyles) {
      updatedCustomization.socialMediaStyles = req.body.customization.socialMediaStyles;
    }
    
    // Handle selected social media style
    if (req.body.selectedSocialMediaStyle) {
      updatedCustomization.selectedSocialMediaStyle = req.body.selectedSocialMediaStyle;
    } else if (req.body.customization && req.body.customization.selectedSocialMediaStyle) {
      updatedCustomization.selectedSocialMediaStyle = req.body.customization.selectedSocialMediaStyle;
    }

    client.customization = updatedCustomization;
    await client.save();

    // Prepare default social media styles structure
    const defaultSocialMediaStyles = {
      style1: {
        name: "Style 1",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style2: {
        name: "Style 2",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style3: {
        name: "Style 3",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style4: {
        name: "Style 4",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style5: {
        name: "Style 5",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style6: {
        name: "Style 6",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style7: {
        name: "Style 7",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      }
    };

    // Ensure social media styles exist with defaults
    let socialMediaStyles = defaultSocialMediaStyles;
    if (client.customization && client.customization.socialMediaStyles) {
      try {
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles 
        };
      } catch (e) {
        // If toObject() fails, use the raw object
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles 
        };
      }
    }

    // Ensure selected social media style exists with default
    const selectedSocialMediaStyle = (client.customization && client.customization.selectedSocialMediaStyle) || "style1";

    // Build the complete socialMediaIcons object
    const socialMediaIcons = {
      selectedStyle: selectedSocialMediaStyle,
      urls: {}, // Will be populated from the selected style
      styles: {
        style1: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style2: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ],
        style3: [
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style4: [
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" }
        ],
        style5: [
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style6: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style7: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ]
      }
    };

    // Populate URLs from the selected style
    const selectedStyleData = socialMediaStyles[selectedSocialMediaStyle];
    if (selectedStyleData && selectedStyleData.icons) {
      socialMediaIcons.urls = { ...selectedStyleData.icons };
    } else {
      // Default empty URLs
      socialMediaIcons.urls = {
        facebook: "",
        whatsapp: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        x: "",
        telegram: ""
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...(client.customization ? client.customization.toObject() : {})
      },
      message: "Customization updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCustomization:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customization settings with file uploads
// @route   PUT /api/epaper/customization/files
// @access  Private
export const updateCustomizationWithFiles = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Parse customization data from form data
    let customizationData = {};
    if (req.body.customization) {
      try {
        customizationData = JSON.parse(req.body.customization);
      } catch (parseError) {
        console.error("Error parsing customization data:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid customization data format" 
        });
      }
    }

    // Handle navbar logo
    if (req.files && req.files.navbarLogo && req.files.navbarLogo.length > 0) {
      const navbarLogo = req.files.navbarLogo[0];
      customizationData.navbar = {
        ...customizationData.navbar,
        logoUrl: `${req.protocol}://${req.get("host")}/uploads/${
          navbarLogo.filename
        }`,
      };
    }

    // Handle footer logo
    if (req.files && req.files.footerLogo && req.files.footerLogo.length > 0) {
      const footerLogo = req.files.footerLogo[0];
      customizationData.footer = {
        ...customizationData.footer,
        logoUrl: `${req.protocol}://${req.get("host")}/uploads/${
          footerLogo.filename
        }`,
      };
    }
    
    // Handle clip logos
    if (req.files && req.files.topClipLogo && req.files.topClipLogo.length > 0) {
      const topClipLogo = req.files.topClipLogo[0];
      customizationData.clip = {
        ...customizationData.clip,
        topLogoUrl: `${req.protocol}://${req.get("host")}/uploads/${
          topClipLogo.filename
        }`,
      };
    }
    
    if (req.files && req.files.footerClipLogo && req.files.footerClipLogo.length > 0) {
      const footerClipLogo = req.files.footerClipLogo[0];
      customizationData.clip = {
        ...customizationData.clip,
        footerLogoUrl: `${req.protocol}://${req.get("host")}/uploads/${
          footerClipLogo.filename
        }`,
      };
    }
    
    // Handle promotional banners - merge with existing data and uploaded files
    if (customizationData.promotionalBanners && Array.isArray(customizationData.promotionalBanners)) {
      // We have banner data from the form
      const banners = customizationData.promotionalBanners;
      
      // If there are uploaded files, update the imageUrl for banners that need new images
      if (req.files && req.files.promotionalBanners && req.files.promotionalBanners.length > 0) {
        // Count how many banners need file uploads (those with empty or File imageUrl)
        let fileIndex = 0;
        for (let i = 0; i < banners.length; i++) {
          // If banner has no imageUrl or it was a File object (now empty/undefined after JSON stringify)
          if (!banners[i].imageUrl || banners[i].imageUrl === '') {
            if (fileIndex < req.files.promotionalBanners.length) {
              banners[i].imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.promotionalBanners[fileIndex].filename}`;
              fileIndex++;
            }
          }
          // Ensure banner has an ID
          if (!banners[i].id) {
            banners[i].id = new mongoose.Types.ObjectId().toString();
          }
        }
      } else {
        // No new files, just ensure all banners have IDs and preserve existing imageUrls
        banners.forEach(banner => {
          if (!banner.id) {
            banner.id = new mongoose.Types.ObjectId().toString();
          }
        });
      }
      
      customizationData.promotionalBanners = banners;
    } else if (req.files && req.files.promotionalBanners && req.files.promotionalBanners.length > 0) {
      // No existing banner data, create new ones from uploaded files
      const uploadedBanners = req.files.promotionalBanners.map((file) => ({
        id: new mongoose.Types.ObjectId().toString(),
        imageUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        redirectUrl: "",
        isActive: false,
        title: ""
      }));
      
      customizationData.promotionalBanners = uploadedBanners;
    }

    // Update customization in client document
    // Preserve existing customization and merge with new data
    const updatedCustomization = {
      navbar: {
        ...(client.customization && client.customization.navbar ? client.customization.navbar.toObject() : {}),
        ...customizationData.navbar,
        // Specifically preserve menu visibility settings
        menuVisibility: {
          ...(client.customization && client.customization.navbar && client.customization.navbar.menuVisibility ? 
            client.customization.navbar.menuVisibility.toObject() : {}),
          ...customizationData.navbar?.menuVisibility,
        }
      },
      footer: {
        ...(client.customization && client.customization.footer ? client.customization.footer.toObject() : {}),
        ...customizationData.footer,
      },
      clip: {
        ...(client.customization && client.customization.clip ? client.customization.clip.toObject() : {}),
        ...customizationData.clip,
      },
      promotionalBanners: customizationData.promotionalBanners || 
        (client.customization && client.customization.promotionalBanners ? client.customization.promotionalBanners : []) || [],
      topToolbarSettings: {
        ...(client.customization && client.customization.topToolbarSettings ? client.customization.topToolbarSettings.toObject() : {}),
        ...customizationData.topToolbarSettings,
      },
      breakingNews: customizationData.breakingNews || 
        (client.customization && client.customization.breakingNews ? client.customization.breakingNews : []) || [],
      socialLinks: customizationData.socialLinks || 
        (client.customization && client.customization.socialLinks ? client.customization.socialLinks : { iconStyle: "circle", links: {} }),
    };

    client.customization = updatedCustomization;
    
    // Handle social media styles - store directly in customization
    // Check if socialMediaStyles is in customizationData
    if (customizationData.socialMediaStyles) {
      updatedCustomization.socialMediaStyles = customizationData.socialMediaStyles;
    }
    
    // Handle selected social media style
    if (customizationData.selectedSocialMediaStyle) {
      updatedCustomization.selectedSocialMediaStyle = customizationData.selectedSocialMediaStyle;
    }

    await client.save();

    // Prepare default social media styles structure
    const defaultSocialMediaStyles = {
      style1: {
        name: "Style 1",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style2: {
        name: "Style 2",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style3: {
        name: "Style 3",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style4: {
        name: "Style 4",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style5: {
        name: "Style 5",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style6: {
        name: "Style 6",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      },
      style7: {
        name: "Style 7",
        icons: {
          facebook: "",
          whatsapp: "",
          instagram: "",
          linkedin: "",
          youtube: "",
          x: "",
          telegram: ""
        }
      }
    };

    // Ensure social media styles exist with defaults
    let socialMediaStyles = defaultSocialMediaStyles;
    if (client.customization && client.customization.socialMediaStyles) {
      try {
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles 
        };
      } catch (e) {
        // If toObject() fails, use the raw object
        socialMediaStyles = { 
          ...defaultSocialMediaStyles, 
          ...client.customization.socialMediaStyles 
        };
      }
    }

    // Ensure selected social media style exists with default
    const selectedSocialMediaStyle = (client.customization && client.customization.selectedSocialMediaStyle) || "style1";

    // Build the complete socialMediaIcons object
    const socialMediaIcons = {
      selectedStyle: selectedSocialMediaStyle,
      urls: {}, // Will be populated from the selected style
      styles: {
        style1: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style2: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ],
        style3: [
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style4: [
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" }
        ],
        style5: [
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" }
        ],
        style6: [
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" }
        ],
        style7: [
          { name: "Telegram", key: "telegram", iconClass: "fab fa-telegram-plane", color: "#0088CC" },
          { name: "YouTube", key: "youtube", iconClass: "fab fa-youtube", color: "#FF0000" },
          { name: "LinkedIn", key: "linkedin", iconClass: "fab fa-linkedin-in", color: "#0A66C2" },
          { name: "Instagram", key: "instagram", iconClass: "fab fa-instagram", color: "#E4405F" },
          { name: "WhatsApp", key: "whatsapp", iconClass: "fab fa-whatsapp", color: "#25D366" },
          { name: "Facebook", key: "facebook", iconClass: "fab fa-facebook-f", color: "#1877F2" }
        ]
      }
    };

    // Populate URLs from the selected style
    const selectedStyleData = socialMediaStyles[selectedSocialMediaStyle];
    if (selectedStyleData && selectedStyleData.icons) {
      socialMediaIcons.urls = { ...selectedStyleData.icons };
    } else {
      // Default empty URLs
      socialMediaIcons.urls = {
        facebook: "",
        whatsapp: "",
        instagram: "",
        linkedin: "",
        youtube: "",
        x: "",
        telegram: ""
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...(client.customization ? client.customization.toObject() : {})
      },
      message: "Customization updated successfully with files",
    });
  } catch (error) {
    console.error("Error in updateCustomizationWithFiles:", error);
    res.status(500).json({ 
      success: false, 
      message: "Something went wrong at updateCustomizationWithFiles" 
    });
  }
};

// ADS MANAGEMENT

// @desc    Create new ad
// @route   POST /api/epaper/ads
// @access  Private
export const createAd = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Add ad to client document
    client.ads.push(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client.ads[client.ads.length - 1],
      message: "Ad created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ad
// @route   PUT /api/epaper/ads/:adId
// @access  Private
export const updateAd = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const ad = client.ads.id(req.params.adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    Object.assign(ad, req.body);
    await client.save();

    res
      .status(200)
      .json({ success: true, data: ad, message: "Ad updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ad
// @route   DELETE /api/epaper/ads/:adId
// @access  Private
export const deleteAd = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    client.ads.pull(req.params.adId);
    await client.save();

    res.status(200).json({ success: true, message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CATEGORIES MANAGEMENT

// @desc    Create new category
// @route   POST /api/epaper/categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Add category to client document
    client.categories.push(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client.categories[client.categories.length - 1],
      message: "Category created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/epaper/categories/:categoryId
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const category = client.categories.id(req.params.categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    Object.assign(category, req.body);
    await client.save();

    res.status(200).json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/epaper/categories/:categoryId
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    client.categories.pull(req.params.categoryId);
    await client.save();

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUBCATEGORIES MANAGEMENT

// @desc    Create new subcategory
// @route   POST /api/epaper/subcategories
// @access  Private
export const createSubCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Add subcategory to client document
    client.subCategories.push(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client.subCategories[client.subCategories.length - 1],
      message: "SubCategory created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subcategory
// @route   PUT /api/epaper/subcategories/:subCategoryId
// @access  Private
export const updateSubCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const subCategory = client.subCategories.id(req.params.subCategoryId);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found" });
    }

    Object.assign(subCategory, req.body);
    await client.save();

    res.status(200).json({
      success: true,
      data: subCategory,
      message: "SubCategory updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/epaper/subcategories/:subCategoryId
// @access  Private
export const deleteSubCategory = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    client.subCategories.pull(req.params.subCategoryId);
    await client.save();

    res
      .status(200)
      .json({ success: true, message: "SubCategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PAGES MANAGEMENT

// @desc    Create new page
// @route   POST /api/epaper/pages
// @access  Private
export const createPage = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Add page to client document
    client.pages.push(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      data: client.pages[client.pages.length - 1],
      message: "Page created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update page
// @route   PUT /api/epaper/pages/:pageId
// @access  Private
export const updatePage = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    const page = client.pages.id(req.params.pageId);
    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    Object.assign(page, req.body);
    await client.save();

    res.status(200).json({
      success: true,
      data: page,
      message: "Page updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete page
// @route   DELETE /api/epaper/pages/:pageId
// @access  Private
export const deletePage = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const client = await Client.findOne({ apiKey });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    client.pages.pull(req.params.pageId);
    await client.save();

    res
      .status(200)
      .json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pages created today for a specific paper
// @route   GET /api/epaper/pages/today
// @access  Private
export const getTodayPages = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const { epaperId } = req.query;
    
    const client = await Client.findOne({ apiKey });
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const epaper = await Epaper.findOne({ clientId: client._id });
    if (!epaper) {
      return res.status(404).json({ success: false, message: "Epaper not found" });
    }

    // Find the specific paper
    const paper = epaper.papers.id(epaperId);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Filter pages created today and add paper title to each page
    const todayPages = paper.images.filter(page => {
      const pageDate = new Date(page.createdAt || paper.createdAt);
      return pageDate >= startOfDay && pageDate <= endOfDay;
    }).map(page => ({
      ...page.toObject(),
      paperTitle: paper.title || "Untitled Edition"
    }));

    res.status(200).json({
      success: true,
      data: todayPages,
      count: todayPages.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if epaper exists for a specific date
// @route   GET /api/epaper/check?date=YYYY-MM-DD
// @access  Public
export const checkEpaperByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }
    
    // Find all epapers and check if any paper has this date
    const epapers = await Epaper.find({});
    
    let paperExists = false;
    let foundPaper = null;
    
    for (const epaper of epapers) {
      const paper = epaper.papers.find(p => {
        if (p.scheduleDate) {
          const paperDate = new Date(p.scheduleDate);
          const queryDate = new Date(date);
          return paperDate.toDateString() === queryDate.toDateString();
        }
        return false;
      });
      
      if (paper) {
        paperExists = true;
        foundPaper = paper;
        break;
      }
    }
    
    res.status(200).json({
      success: true,
      exists: paperExists,
      paper: paperExists ? foundPaper : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
