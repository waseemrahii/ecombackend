import express from 'express'
const router = express.Router()
import {
    createSubSubCategory,
    getAllSubSubCategories,
    getSubSubCategoryById,
    getSubSubCategoryBySlug,
    updateSubSubCategoryById,
    deleteSubSubCategoryById,
    getSubSubCategoriesBySubCategorySlug,
} from '../controllers/subSubCategoryController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import subSubCategoryValidationSchema from '../validations/subSubCategoryValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

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

// get sub sub cateogries by sub category slug
router.get('/subcategory/:slug', getSubSubCategoriesBySubCategorySlug)

export default router
