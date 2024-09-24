import SubCategory from '../models/subCategoryModel.js'
import Category from '../models/categoryModel.js'
import slugify from 'slugify'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { client } from '../utils/redisClient.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateOne,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'

// Create a new subcategory
export const createSubCategory = createOne(SubCategory)

export const getAllSubCategories = getAll(SubCategory)

// Get a subcategory by ID
export const getSubCategoryById = getOne(SubCategory)
// Get a subcategory by slug
export const getSubCategoryBySlug = getOneBySlug(SubCategory)

export const updateSubCategoryById = updateOne(SubCategory)

// Delete a subcategory by ID
export const deleteSubCategoryById = deleteOne(SubCategory)

// Get subcategories by main category slug
export const getSubCategoriesByMainCategorySlug = async (req, res) => {
    try {
        const mainCategorySlug = req.params.slug

        const mainCategory = await Category.findOne({ slug: mainCategorySlug })

        if (!mainCategory) {
            return sendErrorResponse(res, 'Main category not found.', 404)
        }

        const cacheKey = `subcategories_main_${mainCategory._id}`
        const cachedSubCategories = await client.get(cacheKey)
        if (cachedSubCategories) {
            console.log('Serving subcategories by main category from cache')
            return sendSuccessResponse(
                res,
                JSON.parse(cachedSubCategories),
                'Subcategories fetched successfully'
            )
        }

        const subCategories = await SubCategory.find({
            mainCategory: mainCategory._id,
        })

        await client.set(cacheKey, JSON.stringify(subCategories))

        sendSuccessResponse(
            res,
            subCategories,
            'Subcategories fetched successfully'
        )
    } catch (error) {
        sendErrorResponse(res, error.message)
    }
}
