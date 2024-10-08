import slugify from 'slugify'
import redisClient from '../config/redisConfig.js'
import Brand from '../models/brandModel.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateStatus,
} from './handleFactory.js'

// Create a new brand
export const createBrand = createOne(Brand)

export const getBrands = getAll(Brand, { path: 'productCount' })

// Get a brand by ID
export const getBrandById = getOne(Brand)

export const getBrandBySlug = getOneBySlug(Brand)
// Update a brand by ID
export const updateBrand = catchAsync(async (req, res) => {
    const { name, imageAltText, logo } = req.body

    const doc = await Brand.findByIdAndUpdate(
        req.params.id,
        { name, logo, imageAltText },
        { new: true }
    )

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey('Brand', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})
// Delete a brand by ID
export const deleteBrand = deleteOne(Brand)
// Update a brand's status by ID
export const updateBrandStatus = updateStatus(Brand)
