import express from 'express'
import {
    getBusinessAnalytics,
    calculateAdminWallet,
} from '../controllers/adminWalletController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

// Route to get business analytics data
router.get(
    '/analytics',
    protect,
    restrictTo('admin', 'vendor'),
    getBusinessAnalytics
)

// Route to calculate and retrieve admin wallet data
router.get('/', calculateAdminWallet)

export default router
