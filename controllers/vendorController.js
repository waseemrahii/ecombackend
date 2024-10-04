import redisClient from '../config/redisConfig.js'

import Product from '../models/productModel.js'
import Vendor from '../models/vendorModel.js'
import {
    deleteOneWithTransaction,
    getAll,
    getOne,
    updateStatus,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'

// Vendor registration (similar to createVendor but may have different logic)
export const registerVendor = catchAsync(async (req, res) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        shopName,
        address,
    } = req.body
    const { vendorImage, logo, banner } = req.body

    // const vendorImage = req.files['vendorImage']
    //     ? req.files['vendorImage'][0].path
    //     : null
    // const logo = req.files['logo'] ? req.files['logo'][0].path : null
    // const banner = req.files['banner'] ? req.files['banner'][0].path : null

    const newVendor = new Vendor({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        shopName,
        address,
        vendorImage,
        logo,
        banner,
    })

    const doc = await newVendor.save()

    if (!doc) {
        return next(new AppError(`Vendor could not be created`, 400))
    }

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Vendor', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc,
    })
})

// Get all vendors
export const getAllVendors = getAll(Vendor, {
    path: 'totalProducts totalOrders',
})

// Get vendor by ID
export const getVendorById = getOne(Vendor, {
    path: 'totalProducts totalOrders',
})

// Define related models and their foreign keys
const relatedModels = [{ model: Product, foreignKey: 'userId' }]

// Delete vendor by ID
export const deleteVendor = deleteOneWithTransaction(Vendor, relatedModels)

// Update vendor status
export const updateVendorStatus = updateStatus(Vendor)
