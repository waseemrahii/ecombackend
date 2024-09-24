import express from 'express'
import {
    createColor,
    getColors,
    getColorById,
    updateColor,
    deleteColor,
} from '../controllers/colorController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import colorValidationSchema from './../validations/colorValidator.js'

const router = express.Router()

router
    .route('/')
    .post(validateSchema(colorValidationSchema), createColor)
    .get(getColors)

router.route('/:id').get(getColorById).put(updateColor).delete(deleteColor)

export default router
