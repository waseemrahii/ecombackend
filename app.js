import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import globalErrorHandler from './controllers/errorController.js'
import AppError from './utils/appError.js'
import mongoSanitize from 'express-mongo-sanitize'

import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

// ROUTES
import routes from './routes/index.js'

import { cleanCache } from './controllers/handleFactory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(mongoSanitize())

app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'https://ecomuserpanel.lighthouseclouds.com/',
            'https://ecommercebaazaar.com/',
            'https://ebazaar-ten.vercel.app/',
        ],
        credentials: true,
    })
)

// app.use(
//     cors({
//         origin: '*',
//         credentials: true,
//     })
// )
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
app.use('/api', routes)
// app.use('/api/users', userRoutes)
// app.use('/api/vendors', vendorRoutes)
// app.use('/api/vendor-banks', vendorBankRoutes)
// app.use('/api/customers', customerRoutes)

// app.use('/api/products', productRoutes)
// app.use('/api/brands', brandsRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/sub-categories', subCategoryRoutes)
// app.use('/api/sub-sub-categories', subSubCategoryRoutes)
// app.use('/api/attributes', attributeRoutes)
// app.use('/api/colors', colorRoutes)
// app.use('/api/reviews', reviewRoutes)

// app.use('/api/orders', oderRoutes)
// app.use('/api/wishlists', whishlist)
// app.use('/api/refunds', refundRoutes)

// app.use('/api/banners', banner)
// app.use('/api/notifications', notification)
// app.use('/api/flash-deals', flashDeal)
// app.use('/api/deal-of-day', dealOfDay)
// app.use('/api/featured-deals', featureddeal)
// app.use('/api/coupons', coupons)
// app.use('/api/subscribers', subscriber)
// app.use('/api/search', searchRoutes)

// Clear all caches
app.post('/api/clean-cache', cleanCache)

// Unhandled Routes Handling Middleware
app.all('*', (req, res, next) => {
    next(
        new AppError(`Can't find this ${req.originalUrl} on this server.`, 404)
    )
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

export default app
