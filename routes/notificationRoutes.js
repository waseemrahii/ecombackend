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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    },
})

const upload = multer({ storage })

const router = express.Router()

router
    .route('/')
    .get(getAllNotifications)
    .post(
        upload.single('image'),
        validateSchema(notificationValidationSchema),
        createNotification
    )

router.route('/search').get(searchNotifications)

router
    .route('/:id')
    .get(getNotificationById)
    .put(upload.single('image'), updateNotification)
    .delete(deleteNotification)

router.route('/:id/increment').put(incrementNotificationCount)

export default router
