import express from 'express'
import multer from 'multer'
import {
    createFlashDeal,
    getFlashDeals,
    updateFlashDeal,
    addProductToFlashDeal,
    updateFlashDealStatus,
    updatePublishStatus,
    deleteFlashDeal,
    getFlashDealById,
    removeProductFromFlashDeal,
} from '../controllers/flashDealController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import flashDealValidationSchema from './../validations/flashDealValidator.js'

const router = express.Router()


router
    .route('/')
    .post(
        // validateSchema(flashDealValidationSchema),
        createFlashDeal
    )
    .get(getFlashDeals)

router
    .route('/:id')
    .get(getFlashDealById)
    .put( updateFlashDeal)
    .delete(deleteFlashDeal)

router.route('/add-product/:flashDealId').put(addProductToFlashDeal)

router
    .route('/:flashDealId/remove-product/:productId')
    .put(removeProductFromFlashDeal)

router.route('/:id/status').patch(updateFlashDealStatus)

router.route('/:id/update-publish').patch(updatePublishStatus)

export default router
