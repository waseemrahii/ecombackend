import FlashDeal from '../models/flashDealModel.js'
import { deleteOne, getAll, getOne, updateStatus } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

const checkExpiration = (flashDeal) => {
    const currentDate = new Date()
    const endDate = new Date(flashDeal.endDate)
    return currentDate > endDate
}

// Create Flash Deal
export const createFlashDeal = catchAsync(async (req, res) => {
    const { title, startDate, endDate, image } = req.body

    const doc = new FlashDeal({
        title,
        startDate,
        endDate,
        image,
    })

    await doc.save()

    if (!doc) {
        return res.status(400).json({
            status: 'fail',
            message: `Flash deal could not be created`,
        })
    }

    // delete pervious cache
    const cacheKey = getCacheKey('FlashDeal', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc,
    })
})

// Get Flash Deals with Caching
export const getFlashDeals = getAll(FlashDeal)
// Get Flash Deal by ID
export const getFlashDealById = getOne(FlashDeal)

export const updateFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(id, req.body, {
        new: true,
    }).exec()

    if (!updatedFlashDeal) {
        return next(new AppError('Flash deal not found', 404))
    }

    if (checkExpiration(updatedFlashDeal)) {
        updatedFlashDeal.status = 'expired'
        await updatedFlashDeal.save()
    }

    const cacheKey = getCacheKey('FlashDeal', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedFlashDeal,
    })
})

// Delete Flash Deal
export const deleteFlashDeal = deleteOne(FlashDeal)
// Add Product to Flash Deal
export const addProductToFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    // Check if the product exists
    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('Flash Deal not found', 404))
    }

    // Add the product to the feature deal if it isn't already included
    if (!flashDeal.products.includes(productId)) {
        flashDeal.products.push(productId)
        await flashDeal.save()
    }

    const cacheKeyOne = getCacheKey('FlashDeal', id)
    await redisClient.del(cacheKeyOne)

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FlashDeal', '')
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: flashDeal,
    })
})

export const removeProductFromFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('Flash Deal not found', 404))
    }

    // Convert productId string to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId)

    // Check if the product is part of the flash deal
    if (!flashDeal.products.some((pid) => pid.equals(productObjectId))) {
        return next(new AppError('Product not found in FlashDeal', 404))
    }

    // Remove the product from the flash deal's product list
    flashDeal.products = flashDeal.products.filter(
        (pid) => !pid.equals(productObjectId)
    )

    await flashDeal.save()

    const cacheKeyOne = getCacheKey('FlashDeal', id)
    await redisClient.del(cacheKeyOne)

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FlashDeal', '')
    await redisClient.del(cacheKey)

    res.status(204).json({
        status: 'success',
        doc: flashDeal,
    })
})

// Update Flash Deal Status
export const updateFlashDealStatus = updateStatus(FlashDeal)

// Update Publish Status of Flash Deal
export const updatePublishStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { publish } = req.body

    // Validate publish status (true/false)
    if (typeof publish !== 'boolean') {
        return next(new AppError('Invalid publish status', 400))
    }

    // Update the publish status
    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
        id,
        { publish },
        { new: true }
    ).exec()

    if (!updatedFlashDeal) {
        return next(new AppError('Flash deal not found', 404))
    }

    const cacheKeyOne = getCacheKey('FlashDeal', id)
    await redisClient.del(cacheKeyOne)

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FlashDeal', '')
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedFlashDeal,
    })
})
