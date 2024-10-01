import express from 'express'

import userRoutes from './userRoutes.js'
import vendorRoutes from './vendorRoutes.js'
import vendorBankRoutes from './vendorBankRotues.js'
import customerRoutes from './customerRoutes.js'
import brandsRoutes from './brandRoutes.js'

import categoryRoutes from './categoryRoutes.js'
import subCategoryRoutes from './subCategoryRoutes.js'
import subSubCategoryRoutes from './subSubCategoryRoutes.js'
import productRoutes from './productRoutes.js'
import reviewRoutes from './reviewRoutes.js'
import colorRoutes from './colorRoutes.js'
import whishlist from './wishlistRoutes.js'
import banner from './bannerRoutes.js'
import flashDeal from './flashDealRoutes.js'
import dealOfDay from './dealOfTheDayRoutes.js'
import featureddeal from './featuredDealRoutes.js'
import oderRoutes from './orderRoutes.js'
import refundRoutes from './refundRoutes.js'
import attributeRoutes from './attributeRoutes.js'
import coupons from './couponRoutes.js'
import subscriber from './subscriberRoutes.js'
import notification from './notificationRoutes.js'
import searchRoutes from './searchRoutes.js'

const router = express()

router.use('/users', userRoutes)
router.use('/vendors', vendorRoutes)
router.use('/vendor-banks', vendorBankRoutes)
router.use('/customers', customerRoutes)

router.use('/products', productRoutes)
router.use('/brands', brandsRoutes)
router.use('/categories', categoryRoutes)
router.use('/sub-categories', subCategoryRoutes)
router.use('/sub-sub-categories', subSubCategoryRoutes)
router.use('/attributes', attributeRoutes)
router.use('/colors', colorRoutes)
router.use('/reviews', reviewRoutes)

router.use('/orders', oderRoutes)
router.use('/wishlists', whishlist)
router.use('/refunds', refundRoutes)

router.use('/banners', banner)
router.use('/notifications', notification)
router.use('/flash-deals', flashDeal)
router.use('/deal-of-day', dealOfDay)
router.use('/featured-deals', featureddeal)
router.use('/coupons', coupons)
router.use('/subscribers', subscriber)
router.use('/search', searchRoutes)

export default router
