// routes/orderRoutes.js
import express from 'express'
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} from '../controllers/orderControllers.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import orderValidationSchema from './../validations/orderValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(protect, validateSchema(orderValidationSchema), createOrder)
    .get(protect, restrictTo('admin', 'vendor'), getAllOrders)

router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder)

router.route('/:id/status').put(protect, restrictTo('admin', 'vendor'), updateOrderStatus)

export default router
