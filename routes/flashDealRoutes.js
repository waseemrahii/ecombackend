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
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,
        restrictTo('admin'),
        validateSchema(flashDealValidationSchema),
        createFlashDeal
    )
    .get(getFlashDeals)

router
    .route('/:id')
    .get(getFlashDealById)
    .put(protect, restrictTo('admin'), updateFlashDeal)
    .delete(protect, restrictTo('admin'), deleteFlashDeal)

router
    .route('/:id/add-product')
    .put(protect, restrictTo('admin'), addProductToFlashDeal)

router
    .route('/:id/remove-product')
    .put(protect, restrictTo('admin'), removeProductFromFlashDeal)

router.route('/:id/status').put(updateFlashDealStatus)

router.route('/:id/publish').put(updatePublishStatus)

export default router
