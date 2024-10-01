import express from 'express'
import multer from 'multer'
import {
    createProduct,
    updateProductImages,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProductStatus,
    updateProductFeaturedStatus,
    getTopRatedProducts,
    sellProduct,
    getLimitedStockedProducts,
    updateProduct,
    getProductBySlug,
} from '../controllers/productController.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'

const router = express.Router()

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder =
            file.fieldname === 'thumbnail'
                ? 'uploads/thumbnails/'
                : 'uploads/images/'
        cb(null, folder)
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({ storage })

// Product routes
router
    .route('/')
    .post(
        upload.fields([
            { name: 'thumbnail' },
            { name: 'images', maxCount: 10 },
        ]),
        createProduct
    )
    .get(getAllProducts)

// Static routes
router.route('/top-rated').get(getTopRatedProducts)

router.route('/limited-product').get(getLimitedStockedProducts)

router.route('/:productId/sold').get(sellProduct)

router.put('/:productId/update-product-image', updateProductImages)

router
    .route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct)

router.put('/status/:id', protect, restrictTo('admin'), updateProductStatus)

router.get('/slug/:slug', getProductBySlug)

router.route('/:id/feature').put(updateProductFeaturedStatus)

// router.get('/top-rated', getTopRatedProducts);
// // router.get('/pending', getAllPendingProducts);
// // router.get('/approved', getAllApprovedProducts);
// router.get('/filtered', getFilteredProducts);
// // router.get('/newest', getNewestProducts);
// // Dynamic routes
// // router.get('/vendor/:vendorId/vendor-product', getProductsByVendor);
// // router.get('/vendor/:vendorId/pending', getPendingProductsByVendor);
// // router.get('/vendor/:vendorId/denied', getDeniedProductsByVendor);
// // router.get('/vendor/:vendorId/approved', getApprovedProductsByVendor);
// // router.get('/vendor/:vendorId/newest', getNewestProductByVendor);

export default router
