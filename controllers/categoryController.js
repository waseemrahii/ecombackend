import Category from '../models/categoryModel.js'
import slugify from 'slugify'
import {
    deleteOneWithTransaction,
    getAll,
    getOne,
    getOneBySlug,
    updateOne,
    updateStatus,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

import SubCategory from '../models/subCategoryModel.js'
import SubSubCategory from '../models/subSubCategoryModel.js'
import Product from '../models/productModel.js'

// Create a new category
export const createCategory = catchAsync(async (req, res) => {
    const { name, priority, logo } = req.body

    const slug = slugify(name, { lower: true })

    const category = new Category({ name, logo, priority, slug })
    await category.save()

    if (!category) {
        return res.status(400).json({
            status: 'fail',
            message: `Category could not be created`,
        })
    }

    const cacheKeyOne = getCacheKey('Category', category?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(category))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Category', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: category,
    })
})

export const getCategories = getAll(Category, {
    path: [
        'productCount',
        {
            path: 'subCategories',
            select: '_id name slug',
        },
        {
            path: 'subSubCategories',
            select: '_id name slug',
        },
    ],
})

// Get a single category by ID
export const getCategoryById = getOne(Category)

// Update a category by ID
export const updateCategory = updateOne(Category)
// Delete a category by ID
// Define related models and their foreign keys
const relatedModels = [
    { model: SubCategory, foreignKey: 'mainCategory' },
    { model: SubSubCategory, foreignKey: 'mainCategory' },
    { model: Product, foreignKey: 'category' },
]

// Delete a category by ID
export const deleteCategory = deleteOneWithTransaction(Category, relatedModels)

// Get category by slug
export const getCategoryBySlug = getOneBySlug(Category)

export const updateCategoryStatus = updateStatus(Category)
