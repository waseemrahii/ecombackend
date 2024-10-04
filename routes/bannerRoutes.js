import express from 'express'
import path from 'path'
import {
    createBanner,
    getBanners,
    updateBanner,
    deleteBanner,
    getBannerById,
} from '../controllers/bannerController.js'
import checkObjectId from '../middleware/checkObjectId.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(protect, restrictTo('admin'), createBanner)
    .get(getBanners)

router
    .route('/:id', checkObjectId)
    .get(getBannerById)
    .put(protect, restrictTo('admin'), updateBanner)
    .delete(protect, restrictTo('admin'), deleteBanner)

export default router
