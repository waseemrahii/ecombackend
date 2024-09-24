import express from 'express'
import {
    createAttribute,
    getAttributes,
    getAttributeById,
    updateAttribute,
    deleteAttribute,
} from '../controllers/attributeController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import attributeValidationSchema from './../validations/attributeValidator.js'

const router = express.Router()

router
    .route('/')
    .post(validateSchema(attributeValidationSchema), createAttribute)
    .get(getAttributes)
router
    .route('/:id')
    .get(getAttributeById)
    .put(updateAttribute)
    .delete(deleteAttribute)

export default router
