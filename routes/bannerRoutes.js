import express from 'express'
import multer from 'multer'
import path from 'path'
import {
    createBanner,
    getBanners,
    updateBanner,
    deleteBanner,
    getBannerById,
} from '../controllers/bannerController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import bannerValidationSchema from '../validations/bannerValidator.js'
import checkObjectId from '../middleware/checkObjectId.js'

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = fileTypes.test(file.mimetype)

    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter,
})

router
    .route('/')
    .post(
        upload.single('bannerImage'),
        // validateSchema(bannerValidationSchema),
        createBanner
    )
    .get(getBanners)

router
    .route('/:id', checkObjectId)
    .get(getBannerById)
    .put(upload.single('bannerImage'), updateBanner)
    .delete(deleteBanner)

export default router
