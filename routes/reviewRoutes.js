import express from 'express'

import { validateSchema } from '../middleware/validationMiddleware.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'
import {
    createProductReview,
    deleteProductReview,
    getAllProductReviews,
    getProductReviewById,
    updateProductReview,
    updateProductReviewStatus,
} from '../controllers/reviewController.js'
import reviewValidationSchema from '../validations/reviewValidator.js'

const router = express.Router()

router
    .route('/')
    .post(protect, validateSchema(reviewValidationSchema), createProductReview)
    .get(getAllProductReviews)

router
    .route('/:id')
    .get(protect, getProductReviewById)
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview)

router.put(
    '/status/:id',
    protect,
    restrictTo('admin', 'vendor'),
    updateProductReviewStatus
)

export default router
