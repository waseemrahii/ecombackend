import express from 'express'
import multer from 'multer'

import {
    createVendor,
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

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({ storage })

router
    .route('/signup')
    .post(
        upload.fields([
            { name: 'vendorImage' },
            { name: 'logo' },
            { name: 'banner' },
        ]),
        validateSchema(vendorValidationSchema),
        registerVendor
    )

router.route('/').get(getAllVendors)

// .post(
//     upload.fields([
//         { name: 'vendorImage' },
//         { name: 'logo' },
//         { name: 'banner' },
//     ]),
//     validateSchema(vendorValidationSchema),
//     createVendor
// )

router
    .route('/:id')
    .get(getVendorById)
    .delete(protect, restrictTo('admin', 'vendor'), deleteVendor)

router.route('/:vendorId/status').put(protect, updateVendorStatus)

router.put('/update-password', protect, selectModelByRole, updatePassword)

router.post('/login', loginLimiter, loginVendor)
router.post('/logout', protect, logout)

router.put('/status/:id', protect, restrictTo('admin'), updateVendorStatus)

export default router
