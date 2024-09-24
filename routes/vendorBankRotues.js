import express from 'express'
import { validateSchema } from '../middleware/validationMiddleware.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import vendorBankValidationSchema from './../validations/vendorBankValidator.js'
import {
    createVendorBank,
    deleteVendorBank,
    getAllVendorBanks,
    getVendorBankById,
} from '../controllers/vendorBankController.js'

const router = express.Router()

router
    .route('/')
    .post(protect, validateSchema(vendorBankValidationSchema), createVendorBank)
    .get(protect, restrictTo('admin'), getAllVendorBanks)

router
    .route('/:id')
    .get(protect, getVendorBankById)
    .delete(protect, restrictTo('admin'), deleteVendorBank)

export default router
