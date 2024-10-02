import express from "express";
import { advancedSearch } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", advancedSearch);

export default router;
