import express from 'express'
import {
    createProduct,
    updateProductImages,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProductStatus,
    updateProductFeaturedStatus,
    sellProduct,
    updateProduct,
    getProductBySlug,
} from '../controllers/productController.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import productValidationSchema from './../validations/productValidator.js'

const router = express.Router()

// Product routes
router
    .route('/')
    .post(
        protect,
        restrictTo('admin', 'vendor'),
        // validateSchema(productValidationSchema),
        createProduct
    )
    .get(getAllProducts)

// Static routes
router.route('/:productId/sold').get(sellProduct)

router.put(
    '/:productId/update-product-image',
    protect,
    restrictTo('admin', 'vendor'),
    updateProductImages
)

router
    .route('/:id')
    .get(getProductById)
    .put(protect, restrictTo('admin', 'vendor'), updateProduct)
    .delete(protect, restrictTo('admin', 'vendor'), deleteProduct)

router.put('/status/:id', protect, restrictTo('admin'), updateProductStatus)

router.get('/slug/:slug', getProductBySlug)

router
    .route('/:id/feature')
    .put(protect, restrictTo('admin', 'vendor'), updateProductFeaturedStatus)

export default router
