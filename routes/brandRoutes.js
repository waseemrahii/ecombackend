import express from 'express'
import multer from 'multer'
import path from 'path'

import {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
    getBrandBySlug,
} from '../controllers/brandController.js'

import { validateSchema } from '../middleware/validationMiddleware.js'
import brandValidationSchema from './../validations/brandValidator.js'
import { protect } from './../middleware/authMiddleware.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    },
})

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}

const router = express.Router()

router.route('/').post(upload.single('logo'), createBrand).get(getBrands)

router
    .route('/:id')
    .get(getBrandById)
    .put(protect, upload.single('logo'), updateBrand)
    .delete(deleteBrand)

router.route('/:id/status').put(updateBrandStatus)

router.get('/slug/:slug', getBrandBySlug)

export default router
