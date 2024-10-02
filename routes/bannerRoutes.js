import express from "express";
import path from "path";
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  getBannerById,
} from "../controllers/bannerController.js";
import checkObjectId from "../middleware/checkObjectId.js";

const router = express.Router();

router.route("/").post(createBanner).get(getBanners);

router
  .route("/:id", checkObjectId)
  .get(getBannerById)
  .put(updateBanner)
  .delete(deleteBanner);

export default router;
