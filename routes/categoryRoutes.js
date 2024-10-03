import express from "express";
import multer from "multer";
import path from "path";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
} from "../controllers/categoryController.js";
import { validateSchema } from "./../middleware/validationMiddleware.js";
import categoryValidationSchema from "./../validations/categoryValidator.js";
import { protect, restrictTo } from "./../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createCategory).get(getCategories);

router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, restrictTo("admin"), updateCategory)
  .delete(protect, restrictTo("admin"), deleteCategory);

router.route("/slug/:slug").get(getCategoryBySlug);

export default router;
