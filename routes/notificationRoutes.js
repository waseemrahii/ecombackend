import express from 'express'
import multer from 'multer'
import path from 'path'
import {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    searchNotifications,
    incrementNotificationCount,
} from '../controllers/notificationController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import notificationValidationSchema from './../validations/notificationValidator.js'


const router = express.Router()

router
    .route('/')
    .get(getAllNotifications)
    .post(
        validateSchema(notificationValidationSchema),
        createNotification
    )

router.route('/search').get(searchNotifications)

router
    .route('/:id')
    .get(getNotificationById)
    .put(updateNotification)
    .delete(deleteNotification)

router.route('/:id/increment').put(incrementNotificationCount)

export default router
