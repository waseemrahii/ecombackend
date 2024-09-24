import express from 'express'
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon,
} from '../controllers/couponController.js'
const router = express.Router()

router.route('/').post(createCoupon).get(getAllCoupons)

router.route('/:id').get(getCouponById).put(updateCoupon).delete(deleteCoupon)

router.route('/:id/status').patch(updateCouponStatus)

export default router
