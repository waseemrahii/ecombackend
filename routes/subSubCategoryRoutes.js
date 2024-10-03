import express from 'express'

import {
    createSubSubCategory,
    getAllSubSubCategories,
    getSubSubCategoryById,
    getSubSubCategoryBySlug,
    updateSubSubCategoryById,
    deleteSubSubCategoryById,
} from '../controllers/subSubCategoryController.js'

import { validateSchema } from '../middleware/validationMiddleware.js'
import subSubCategoryValidationSchema from '../validations/subSubCategoryValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,
        restrictTo('admin'),
        validateSchema(subSubCategoryValidationSchema),
        createSubSubCategory
    )
    .get(getAllSubSubCategories)

router
    .route('/:id')
    .get(getSubSubCategoryById)
    .put(protect, restrictTo('admin'), updateSubSubCategoryById)
    .delete(protect, restrictTo('admin'), deleteSubSubCategoryById)

router.route('/slug/:slug').get(getSubSubCategoryBySlug)

export default router
