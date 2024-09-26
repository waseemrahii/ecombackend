import express from 'express'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import globalErrorHandler from './controllers/errorController.js'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

// ROUTES
import userRoutes from './routes/userRoutes.js'
import vendorRoutes from './routes/vendorRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import brandsRoutes from './routes/brandRoutes.js'

import categoryRoutes from './routes/categoryRoutes.js'
import subCategoryRoutes from './routes/subCategoryRoutes.js'
import subSubCategoryRoutes from './routes/subSubCategoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import colorRoutes from './routes/colorRoutes.js'
import whishlist from './routes/wishlistRoutes.js'
import banner from './routes/bannerRoutes.js'
import flashDeal from './routes/flashDealRoutes.js'
import dealOfDay from './routes/dealOfTheDayRoutes.js'
import featureddeal from './routes/featuredDealRoutes.js'
import oderRoutes from './routes/orderRoutes.js'
import refundRoutes from './routes/refundRoutes.js'
import attributeRoutes from './routes/attributeRoutes.js'
import coupons from './routes/couponRoutes.js'
import subscriber from './routes/subscriberRoutes.js'
import notification from './routes/notificationRoutes.js'
import AppError from './utils/appError.js'
import { searchProducts } from './controllers/productController.js'
import { cleanCache } from './controllers/handleFactory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

// app.use(
//     cors({
//         origin: [
//             'http://localhost:5173',
//             'http://localhost:5174',
//             'http://localhost:5175',
//             'https://ebazaar-ten.vercel.app/',
//             'https://ecomuserpanel.lighthouseclouds.com/',
//             'https://ecocmadmin.vercel.app/',
//         ],
//         credentials: true,
//     })
// )

app.use(
    cors({
        origin: '*',
        credentials: true,
    })
)
// Global input sanitization middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

// Developing logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.get('/', (req, res, next) => {
    res.send('Ecommerce Bazaar API is Running')
    next()
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API ROUTES
app.post('/clean-cache', cleanCache)

app.get('/api/search', searchProducts)

app.use('/api/users', userRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/customers', customerRoutes)

app.use('/api/products', productRoutes)
app.use('/api/brands', brandsRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/sub-categories', subCategoryRoutes)
app.use('/api/sub-sub-categories', subSubCategoryRoutes)
app.use('/api/attributes', attributeRoutes)
app.use('/api/colors', colorRoutes)
app.use('/api/reviews', reviewRoutes)

app.use('/api/orders', oderRoutes)
app.use('/api/wishlists', whishlist)
app.use('/api/refunds', refundRoutes)

app.use('/api/banners', banner)
app.use('/api/notifications', notification)
app.use('/api/flash-deals', flashDeal)
app.use('/api/deal-of-day', dealOfDay)
app.use('/api/featured-deals', featureddeal)
app.use('/api/coupons', coupons)
app.use('/api/subscribers', subscriber)

// Unhandled Routes Handling Middleware
app.all('*', (req, res, next) => {
    next(
        new AppError(`Can't find this ${req.originalUrl} on this server.`, 404)
    )
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

export default app
