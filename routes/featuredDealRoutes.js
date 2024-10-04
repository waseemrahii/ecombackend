import express from 'express'
import {
    createFeaturedDeal,
    getFeaturedDeals,
    updateFeaturedDeal,
    addProductToFeaturedDeal,
    updateFeaturedDealStatus,
    deleteFeaturedDeal,
    getFeaturedDealById,
    removeProductFromFeaturedDeal,
} from '../controllers/featuredDealController.js'

import { validateSchema } from '../middleware/validationMiddleware.js'
import featuredDealValidationSchema from './../validations/featuredDealValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()
router
    .route('/')
    .post(
        protect,
        restrictTo('admin'),
        validateSchema(featuredDealValidationSchema),
        createFeaturedDeal
    )
    .get(getFeaturedDeals)

router
    .route('/:id')
    .get(getFeaturedDealById)
    .delete(protect, restrictTo('admin'), deleteFeaturedDeal)
    .put(protect, restrictTo('admin'), updateFeaturedDeal)

router
    .route('/:id/add-product')
    .put(protect, restrictTo('admin'), addProductToFeaturedDeal)

router
    .route('/:id/status')
    .put(protect, restrictTo('admin'), updateFeaturedDealStatus)

router
    .route('/:id/remove-product')
    .delete(protect, restrictTo('admin'), removeProductFromFeaturedDeal)

export default router
