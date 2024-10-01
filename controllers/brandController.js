import slugify from 'slugify'
import redisClient from '../config/redisConfig.js'
import Brand from '../models/brandModel.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import { client } from '../utils/redisClient.js'
import { sendSuccessResponse } from '../utils/responseHandler.js'
import { deleteOne, getAll, getOne, getOneBySlug } from './handleFactory.js'
  
// Create a new brand
export const createBrand = catchAsync(async (req, res) => {
    const { name, imageAltText } = req.body
    const logo = req.file ? req.file.filename : ''

    const brand = new Brand({
        name,
        logo,
        imageAltText,
        slug: slugify(name, { lower: true }),
    })

    console.log(brand)

    await brand.save()

    if (!brand) {
        return res.status(400).json({
            status: 'fail',
            message: `Brand could not be created`,
        })
    }

    const cacheKeyOne = getCacheKey('Brand', brand?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(brand))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Brand', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: brand,
    })
})

// Get all brands with optional search and status filter
// export const getBrands = async (req, res) => {
// 	try {
// 		const { name, status } = req.query;
// 		const cacheKey = `all_brands${name ? `:name:${name}` : ""}${
// 			status ? `:status:${status}` : ""
// 		}`;

// 		// Check cache first
// 		let cacheData = await client.get(cacheKey);
// 		if (cacheData) {
// 			try {
// 				cacheData = JSON.parse(cacheData);
// 				if (Array.isArray(cacheData)) {
// 					console.log(
// 						`[CACHE] Retrieved brands from cache with key: ${cacheKey}`
// 					);
// 					return sendSuccessResponse(
// 						res,
// 						cacheData,
// 						"Brands fetched successfully"
// 					);
// 				}
// 			} catch (error) {
// 				console.error(`[CACHE] Error parsing cached data: ${error.message}`);
// 			}
// 		}

// 		// Fetch from the database
// 		const searchCriteria = {};
// 		if (name) {
// 			searchCriteria.name = new RegExp(name, "i");
// 		}
// 		if (status) {
// 			searchCriteria.status = status;
// 		}

// 		const brands = await Brand.find(searchCriteria);

// 		// Cache the result
// 		if (brands && brands.length > 0) {
// 			await client.set(cacheKey, JSON.stringify(brands));
// 			console.log(`[CACHE] Cached brands with key: ${cacheKey}`);
// 		} else {
// 			console.log(`[DB] No brands found for search criteria.`);
// 		}

// 		sendSuccessResponse(res, brands, "Brands fetched successfully");
// 	} catch (error) {
// 		console.error(`[ERROR] Error fetching brands: ${error.message}`);
// 		sendErrorResponse(res, error);
// 	}
// };

export const getBrands = getAll(Brand, { path: 'productCount' })

// Get a brand by ID
export const getBrandById = getOne(Brand)

export const getBrandBySlug = getOneBySlug(Brand)
// Update a brand by ID
export const updateBrand = catchAsync(async (req, res) => {
    const { name, imageAltText } = req.body
    const logo = req.file ? req.file.path : undefined

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
export const updateBrandStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    // // Ensure the status is valid
    // if (!['active', 'inactive'].includes(status)) {
    //     return res.status(400).json({ message: 'Invalid status value' })
    // }

    // Update the brand's status
    const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    )

    if (!updatedBrand) {
        return res.status(404).json({ message: 'Brand not found' })
    }

    // Update the cache
    const cacheKey = `brand:${updatedBrand._id}`
    await client.set(cacheKey, JSON.stringify(updatedBrand))
    console.log(`[CACHE] Updated cache for brand with key: ${cacheKey}`)

    // Invalidate the all brands cache
    await client.del('all_brands')
    console.log(`[CACHE] Invalidated cache for all brands`)

    sendSuccessResponse(res, updatedBrand, 'Brand status updated successfully')
})
