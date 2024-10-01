import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import globalErrorHandler from './controllers/errorController.js'
import AppError from './utils/appError.js'

import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

// ROUTES
import routes from './routes/index.js'

import { cleanCache } from './controllers/handleFactory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'https://ecomuserpanel.lighthouseclouds.com/',
            'https://ecommercebaazaar.com/',
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

// Clear all caches
app.post('/clean-cache', cleanCache)

// Unhandled Routes Handling Middleware
app.all('*', (req, res, next) => {
    next(
        new AppError(`Can't find this ${req.originalUrl} on this server.`, 404)
    )
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

export default app
