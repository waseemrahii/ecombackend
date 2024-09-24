import FlashDeal from '../models/flashDealModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js'
import logger from '../utils/logger.js'
import { deleteOne, getAll } from './handleFactory.js'
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
    const { title, startDate, endDate } = req.body
    const image = req.file ? req.file.path : ''

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
export const getFlashDealById = catchAsync(async (req, res) => {
    const { id } = req.params

    const cacheKey = `flashDeal_${id}`
    const cachedData = await getCache(cacheKey)

    if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`)
        return res.status(200).json({
            success: 'success',
            cached: true,
            doc: cachedData,
        })
    }

    const flashDeal = await FlashDeal.findById(id).populate({
        path: 'productId',
        select: 'name price description thumbnail',
    })

    if (!flashDeal) {
        logger.warn(`Flash deal with ID ${id} not found in database`)
        return res.status(404).json({ message: 'Flash deal not found' })
    }

    if (checkExpiration(flashDeal)) {
        flashDeal.status = 'expired'
        await flashDeal.save()
    }

    await setCache(cacheKey, flashDeal, 3600)
    logger.info(`Cache set for key: ${cacheKey}`)

    res.status(200).json({
        status: 'success',
        cached: false,
        doc: FlashDeal,
    })
})

export const updateFlashDeal = catchAsync(async (req, res) => {
    const { id } = req.params

    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(id, req.body, {
        new: true,
    }).exec()

    if (!updatedFlashDeal) {
        return res.status(404).json({ message: 'Flash deal not found' })
    }

    if (checkExpiration(updatedFlashDeal)) {
        updatedFlashDeal.status = 'expired'
        await updatedFlashDeal.save()
    }

    await deleteCache(`flashDeal_${id}`)
    await deleteCache('flashDeals')

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
    const { products } = req.body

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('No document found with that ID', 404))
    }

    let dealProducts = []

    products?.filter((product) => {
        if (!dealProducts.includes(product)) {
            return dealProducts.push(product)
        }
    })

    // Add products to the flash deal if they don't already exist
    const newProducts = dealProducts.filter(
        (product) => !flashDeal.products.includes(product)
    )

    if (newProducts.length > 0) {
        flashDeal.products.push(...newProducts)
        await flashDeal.save()
    }

    // Update cache
    const cacheKey = getCacheKey(FlashDeal, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: flashDeal,
    })
})
// Remove Product from Flash Deal
export const removeProductFromFlashDeal = catchAsync(async (req, res, next) => {
    const { id, productId } = req.params

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('No flash deal found with that ID', 404))
    }

    const productIndex = flashDeal.products.findIndex(
        (item) => item._id == productId
    )

    if (productIndex === -1) {
        return next(new AppError('No product found with that ID', 404))
    }

    console.log(flashDeal.products.length)

    const filteredProducts = flashDeal.products.filter((item) => {
        console.log(item._id + ' -- ' + productId)
        return item._id === productId
    })

    console.log(filteredProducts)

    // if (!flashDeal.productId.includes(productId)) {
    //     return res
    //         .status(400)
    //         .json({ message: 'Product not found in Flash Deal' })
    // }

    // // Remove product from the Flash Deal
    // flashDeal.productId = flashDeal.productId.filter(
    //     (pid) => pid.toString() !== productId
    // )

    // // Save updated Flash Deal
    // await flashDeal.save()

    // Invalidate cache
    await deleteCache(`flashDeal_${id}`)
    await deleteCache('flashDeals')

    sendSuccessResponse(
        res,
        flashDeal,
        'Product removed from Flash Deal successfully'
    )
})

// Update Flash Deal Status
export const updateFlashDealStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    // Validate status
    if (!['active', 'inactive', 'expired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' })
    }

    // Update flash deal status
    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    )

    if (!updatedFlashDeal) {
        return res.status(404).json({ message: 'Flash deal not found' })
    }

    // Invalidate cache
    await deleteCache(`flashDeal_${id}`)
    await deleteCache('flashDeals')

    res.status(200).json({
        status: 'success',
        doc: updatedFlashDeal,
    })
})

// Update Publish Status of Flash Deal
export const updatePublishStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const { publish } = req.body

    // Validate publish status (true/false)
    if (typeof publish !== 'boolean') {
        return res.status(400).json({ message: 'Invalid publish status' })
    }

    // Update the publish status
    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
        id,
        { publish },
        { new: true }
    ).exec()
    if (!updatedFlashDeal) {
        return res.status(404).json({ message: 'Flash deal not found' })
    }

    // Invalidate cache
    await deleteCache(`flashDeal_${id}`)
    await deleteCache('flashDeals')

    res.status(200).json({
        status: 'success',
        doc: updatedFlashDeal,
    })
})
