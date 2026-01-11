import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// TODO add protectRoute and adminRoute middlewares
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.patch("/:id", toggleFeaturedProduct);
router.post("/", createProduct);
router.delete("/:id", deleteProduct);

export default router;
