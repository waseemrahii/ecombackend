import Vendor from '../models/vendorModel.js'
import { client } from '../utils/redisClient.js'
import {
    sendSuccessResponse,
    sendErrorResponse,
} from '../utils/responseHandler.js'

import jwt from 'jsonwebtoken'
import {
    deleteOne,
    deleteOneWithTransaction,
    getAll,
    getOne,
    updateStatus,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import Product from '../models/productModel.js'

// Create a new vendor
export const createVendor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            shopName,
            address,
        } = req.body

        const vendorImage = req.files['vendorImage']
            ? req.files['vendorImage'][0].path
            : null
        const logo = req.files['logo'] ? req.files['logo'][0].path : null
        const banner = req.files['banner'] ? req.files['banner'][0].path : null

        const vendor = new Vendor({
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
            status: 'pending', // Set default status to pending
        })

        const savedVendor = await vendor.save()
        if (savedVendor) {
            const cacheKey = `vendor:${savedVendor._id}`
            await client.set(cacheKey, JSON.stringify(savedVendor))
            await client.del('all_vendors')

            sendSuccessResponse(res, savedVendor, 'Vendor added successfully')
        } else {
            throw new Error('Vendor could not be created')
        }
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

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

    const vendorImage = req.files['vendorImage']
        ? req.files['vendorImage'][0].path
        : null
    const logo = req.files['logo'] ? req.files['logo'][0].path : null
    const banner = req.files['banner'] ? req.files['banner'][0].path : null

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
