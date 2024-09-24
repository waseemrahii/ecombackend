import express from 'express'
import {
    getSubscribers,
    addSubscriber,
    deleteSubscriber,
} from '../controllers/subscriberController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import subscriberValidationSchema from './../validations/subscriberValidator.js'
import { protect, restrictTo } from './../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .get(protect, restrictTo('admin'), getSubscribers)
    .post(validateSchema(subscriberValidationSchema), addSubscriber)

router.route('/:id').delete(protect, deleteSubscriber)

export default router
