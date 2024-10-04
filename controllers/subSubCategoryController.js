import SubSubCategory from '../models/subSubCategoryModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateOne,
} from './handleFactory.js'

// Create a new sub-subcategory

export const createSubSubCategory = createOne(SubSubCategory)

export const getAllSubSubCategories = getAll(SubSubCategory)

// Get a sub-subcategory by ID
export const getSubSubCategoryById = getOne(SubSubCategory)

// Get a sub-subcategory by slug
export const getSubSubCategoryBySlug = getOneBySlug(SubSubCategory)

// Update a sub-subcategory by ID
export const updateSubSubCategoryById = updateOne(SubSubCategory)
// Delete a sub-subcategory by ID
export const deleteSubSubCategoryById = deleteOne(SubSubCategory)
