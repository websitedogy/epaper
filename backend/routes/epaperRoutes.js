import express from "express";
import {
  getEpaper,
  createPaper,
  updatePaper,
  deletePaper,
  replacePage,
  updateCustomization,
  updateCustomizationWithFiles,
  createAd,
  updateAd,
  deleteAd,
  createCategory,
  updateCategory,
  deleteCategory,
  createPage,
  updatePage,
  deletePage,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  checkEpaperByDate,
  getTodayPages
} from "../controllers/epaperController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Get epaper data
router.get("/", getEpaper);

// Check if epaper exists for a specific date
router.get("/check", checkEpaperByDate);

// Get today's pages for a specific paper
router.get("/pages/today", getTodayPages);

// Paper routes
router.post(
  "/papers",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createPaper
);
router.put(
  "/papers/:paperId",
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updatePaper
);
router.delete("/papers/:paperId", deletePaper);

// Replace a single page in a paper
router.put(
  "/papers/:paperId/pages/:pageNumber",
  upload.single("pageImage"),
  replacePage
);

// Customization routes
router.put("/customization", updateCustomization);
router.put(
  "/customization/files",
  upload.fields([
    { name: "navbarLogo", maxCount: 1 },
    { name: "footerLogo", maxCount: 1 },
    { name: "footerBanner", maxCount: 1 },
    { name: "topClipLogo", maxCount: 1 },
    { name: "footerClipLogo", maxCount: 1 },
    { name: "promotionalBanners", maxCount: 10 },
  ]),
  updateCustomizationWithFiles
);
// Ads routes
router.post("/ads", createAd);
router.put("/ads/:adId", updateAd);
router.delete("/ads/:adId", deleteAd);

// Categories routes
router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

// SubCategories routes
router.post("/subcategories", createSubCategory);
router.put("/subcategories/:subCategoryId", updateSubCategory);
router.delete("/subcategories/:subCategoryId", deleteSubCategory);

// Pages routes
router.post("/pages", createPage);
router.put("/pages/:pageId", updatePage);
router.delete("/pages/:pageId", deletePage);

export default router;