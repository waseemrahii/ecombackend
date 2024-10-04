import express from 'express'
import {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    getSubCategoryBySlug,
    updateSubCategoryById,
    deleteSubCategoryById,
} from '../controllers/subCategoryController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import subCategoryValidationSchema from './../validations/subCateogoryValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(validateSchema(subCategoryValidationSchema), createSubCategory)
    .get(getAllSubCategories)

router
    .route('/:id')
    .get(getSubCategoryById)
    .put(protect, restrictTo('admin'), updateSubCategoryById)
    .delete(protect, restrictTo('admin'), deleteSubCategoryById)

router.route('/slug/:slug').get(getSubCategoryBySlug)

export default router
