import FeaturedDeal from '../models/featuredDealModel.js'
import Product from '../models/productModel.js'
import catchAsync from '../utils/catchAsync.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
    updateStatus,
} from './handleFactory.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import AppError from '../utils/appError.js'
import mongoose from 'mongoose'

// Create Feature Deal
export const createFeaturedDeal = createOne(FeaturedDeal)

// Get Feature Deals
export const getFeaturedDeals = getAll(FeaturedDeal)

// Get Feature Deal by ID
export const getFeaturedDealById = getOne(FeaturedDeal)
// Update Feature Deal
export const updateFeaturedDeal = updateOne(FeaturedDeal)
// Add Product to Feature Deal
export const addProductToFeaturedDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    console.log(productId)

    // Check if the product exists
    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    console.log(product)

    const featuredDeal = await FeaturedDeal.findById(id)
    console.log(featuredDeal)

    if (!featuredDeal) {
        return next(new AppError('Feature Deal not found', 404))
    }

    // Add the product to the feature deal if it isn't already included
    if (!featuredDeal.products.includes(productId)) {
        featuredDeal.products.push(productId)
        await featuredDeal.save()
    }

    const cacheKeyOne = getCacheKey('FeaturedDeal', featuredDeal?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(featuredDeal))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FeaturedDeal', '')
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: featuredDeal,
    })
})

// Remove Product from Feature Deal
export const removeProductFromFeaturedDeal = catchAsync(
    async (req, res, next) => {
        const { id } = req.params
        const { productId } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return next(new AppError('Product not found', 404))
        }

        const featuredDeal = await FeaturedDeal.findById(id)
        if (!featuredDeal) {
            return next(new AppError('Feature Deal not found', 404))
        }

        // Convert productId string to ObjectId
        const productObjectId = new mongoose.Types.ObjectId(productId)

        // Check if the product is part of the featured deal
        if (!featuredDeal.products.some((pid) => pid.equals(productObjectId))) {
            return next(new AppError('Product not found in Featured Deal', 404))
        }

        // Remove the product from the featured deal's product list
        featuredDeal.products = featuredDeal.products.filter(
            (pid) => !pid.equals(productObjectId)
        )

        await featuredDeal.save()

        const cacheKeyOne = getCacheKey('FeaturedDeal', id)
        await redisClient.del(cacheKeyOne)

        // delete all documents caches related to this model
        const cacheKey = getCacheKey('FeaturedDeal', '')
        await redisClient.del(cacheKey)

        res.status(204).json({
            status: 'success',
            doc: featuredDeal,
        })
    }
)

// Update Feature Deal Status
export const updateFeaturedDealStatus = updateStatus(FeaturedDeal)

// Delete Feature Deal
export const deleteFeaturedDeal = deleteOne(FeaturedDeal)
