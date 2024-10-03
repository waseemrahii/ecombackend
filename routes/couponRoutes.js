import express from 'express'
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon,
} from '../controllers/couponController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
const router = express.Router()

router
    .route('/')
    .post(protect, restrictTo('admin', 'vendor'), createCoupon)
    .get(getAllCoupons)

router
    .route('/:id')
    .get(getCouponById)
    .put(protect, restrictTo('admin', 'vendor'), updateCoupon)
    .delete(protect, restrictTo('admin', 'vendor'), deleteCoupon)

router
    .route('/:id/status')
    .put(protect, restrictTo('admin', 'vendor'), updateCouponStatus)

export default router
