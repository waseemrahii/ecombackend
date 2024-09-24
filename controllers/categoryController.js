import Category from '../models/categoryModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import fs from 'fs'
import path from 'path'
import slugify from 'slugify'
import { client } from '../utils/redisClient.js'
import {
    deleteOne,
    deleteOneWithTransaction,
    getAll,
    getOne,
    getOneBySlug,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import SubCategory from '../models/subCategoryModel.js'
import SubSubCategory from '../models/subSubCategoryModel.js'
import Product from '../models/productModel.js'

// Create a new category
export const createCategory = catchAsync(async (req, res) => {
    const { name, priority } = req.body
    console.log(req.file)
    const logo = req.file ? req.file.filename : null
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
// Get all categories with optional search functionality
// export const getCategories = async (req, res) => {
//     try {
//         const { search } = req.query;

//         const cacheKey = search ? `categories_search_${search}` : 'categories';

//         const cachedCategories = await client.get(cacheKey);
//         if (cachedCategories) {
//             console.log('Serving categories from cache');
//             return sendSuccessResponse(res, JSON.parse(cachedCategories), "Categories fetched successfully");
//         }
//         const query = search ? { name: { $regex: search, $options: 'i' } } : {};

//         const categories = await Category.find(query);

//         await client.set(cacheKey, JSON.stringify(categories));

//         sendSuccessResponse(res, categories, "Categories fetched successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

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
export const updateCategory = catchAsync(async (req, res) => {
    const { name, priority } = req.body
    const logo = req.file ? req.file.filename : req.body.logo
    const slug = slugify(name, { lower: true })

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, logo, priority, slug },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!category) {
        return next(new AppError(`No category found with that Id.`, 404))
    }

    await client.del(`category_${req.params.id}`)
    await client.del('categories')

    res.status(200).json({
        status: 'success',
        doc: category,
    })
})
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
