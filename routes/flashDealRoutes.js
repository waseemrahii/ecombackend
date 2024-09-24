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

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
})

// Middleware to log file uploads
router.use((req, res, next) => {
    if (req.file) {
        console.log('Uploaded file:', req.file)
    }
    next()
})

router
    .route('/')
    .post(
        upload.single('image'),
        // validateSchema(flashDealValidationSchema),
        createFlashDeal
    )
    .get(getFlashDeals)

router
    .route('/:id')
    .get(getFlashDealById)
    .put(upload.single('image'), updateFlashDeal)
    .delete(deleteFlashDeal)

router.route('/add-product/:flashDealId').put(addProductToFlashDeal)

router
    .route('/:flashDealId/remove-product/:productId')
    .put(removeProductFromFlashDeal)

router.route('/:id/status').patch(updateFlashDealStatus)

router.route('/:id/update-publish').patch(updatePublishStatus)

export default router
