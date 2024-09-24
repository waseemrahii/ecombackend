import express from 'express'
import {
    createFeaturedDeal,
    getFeaturedDeals,
    updateFeaturedDeal,
    addProductToFeaturedDeal,
    updateFeaturedDealStatus,
    deleteFeaturedDeal,
    getFeaturedDealById,
    deleteProductFromFeaturedDeal,
} from '../controllers/featuredDealController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import featuredDealValidationSchema from './../validations/featuredDealValidator.js'

const router = express.Router()
router
    .route('/')
    .post(validateSchema(featuredDealValidationSchema), createFeaturedDeal)
    .get(getFeaturedDeals)

router
    .route('/:id')
    .get(getFeaturedDealById)
    .delete(deleteFeaturedDeal)
    .put(updateFeaturedDeal)

router.route('/:id/add-product').put(addProductToFeaturedDeal)

router.route('/:id/status').patch(updateFeaturedDealStatus)

router
    .route('/:id/remove-product/:productId')
    .delete(deleteProductFromFeaturedDeal)

export default router
