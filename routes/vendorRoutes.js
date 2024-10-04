import express from 'express'
import {
    registerVendor,
    updateVendorStatus,
    getAllVendors,
    getVendorById,
    deleteVendor,
} from '../controllers/vendorController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import vendorValidationSchema from './../validations/vendorValidator.js'
import { loginLimiter } from '../utils/helpers.js'
import {
    protect,
    restrictTo,
    selectModelByRole,
} from '../middleware/authMiddleware.js'
import {
    loginVendor,
    logout,
    updatePassword,
} from './../controllers/authController.js'

const router = express.Router()

router
    .route('/signup')
    .post(validateSchema(vendorValidationSchema), registerVendor)

router.post('/login', loginLimiter, loginVendor)
router.post('/logout', protect, logout)

router.route('/').get(getAllVendors)

router
    .route('/:id')
    .get(getVendorById)
    .delete(protect, restrictTo('admin', 'vendor'), deleteVendor)

router.put('/update-password', protect, selectModelByRole, updatePassword)

router.put('/status/:id', protect, restrictTo('admin'), updateVendorStatus)

export default router
