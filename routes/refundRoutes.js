import express from 'express'
import {
    createRefund,
    getAllRefunds,
    getRefundById,
    updateRefundStatus,
    deleteRefund,
} from '../controllers/refundController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import refundValidationSchema from './../validations/refundValidator.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .get(protect, restrictTo('admin', 'vendor'), getAllRefunds)
    .post(protect, validateSchema(refundValidationSchema), createRefund)

router.route('/:id').get(protect, getRefundById).delete(protect, deleteRefund)

router.put(
    '/:id/status',
    protect,
    restrictTo('admin', 'vendor'),
    updateRefundStatus
)

export default router
