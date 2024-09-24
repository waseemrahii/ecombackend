import FeaturedDeal from '../models/featuredDealModel.js'
import Product from '../models/productModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js'
import logger from '../utils/logger.js'
import catchAsync from '../utils/catchAsync.js'
import { createOne, deleteOne } from './handleFactory.js'

// Function to check expiration status
const checkExpiration = (featuredDeal) => {
    const currentDate = new Date()
    const endDate = new Date(featuredDeal.endDate)
    return currentDate > endDate
}

// Create Feature Deal
export const createFeaturedDeal = createOne(FeaturedDeal)

// Get Feature Deals
export const getFeaturedDeals = catchAsync(async (req, res) => {
    const cacheKey = 'featuredDeals'
    const { title, startDate, endDate, status } = req.query

    const cachedData = await getCache(cacheKey)
    if (cachedData) {
        const filteredData = cachedData.filter((deal) => {
            let matches = true

            if (title) {
                matches = deal.title.toLowerCase().includes(title.toLowerCase())
            }
            if (status && deal.status !== status) {
                matches = false
            }
            if (startDate || endDate) {
                const dealStartDate = new Date(deal.startDate)
                const dealEndDate = new Date(deal.endDate)
                const queryStartDate = startDate ? new Date(startDate) : null
                const queryEndDate = endDate ? new Date(endDate) : null

                if (queryStartDate && dealStartDate < queryStartDate) {
                    matches = false
                }
                if (queryEndDate && dealEndDate > queryEndDate) {
                    matches = false
                }
            }
            return matches
        })

        return res.status(200).json({
            success: true,
            message: 'Feature deals retrieved successfully (from cache)',
            doc: filteredData,
        })
    }

    const query = {}
    if (title) {
        query.title = { $regex: title, $options: 'i' }
    }
    if (status) {
        query.status = status
    }
    if (startDate || endDate) {
        query.startDate = {}
        if (startDate) {
            query.startDate.$gte = new Date(startDate)
        }
        if (endDate) {
            query.startDate.$lte = new Date(endDate)
        }
    }

    const featuredDeals = await FeaturedDeal.find(query).populate({
        path: 'products',
        select: 'name price description thumbnail',
    })

    for (let deal of featuredDeals) {
        if (checkExpiration(deal)) {
            deal.status = 'expired'
            await deal.save()
        }
    }

    await setCache(cacheKey, featuredDeals, 3600)
    res.status(200).json({
        success: true,
        message: 'Feature deals retrieved successfully',
        doc: featuredDeals,
    })
})

// Get Feature Deal by ID
export const getFeaturedDealById = catchAsync(async (req, res) => {
    const { id } = req.params
    const cacheKey = `featuredDeal_${id}`
    const cachedData = await getCache(cacheKey)

    if (cachedData) {
        logger.info(`Cache hit for key: ${cacheKey}`)
        return res.status(200).json({
            success: true,
            message: 'Feature deal retrieved successfully (from cache)',
            doc: cachedData,
        })
    }

    const featuredDeal = await FeaturedDeal.findById(id).populate({
        path: 'products',
        select: 'name price description thumbnail',
    })

    if (!featuredDeal) {
        logger.warn(`Feature deal with ID ${id} not found in database`)
        return res.status(404).json({ message: 'Feature deal not found' })
    }

    if (checkExpiration(featuredDeal)) {
        featuredDeal.status = 'expired'
        await featuredDeal.save()
    }

    await setCache(cacheKey, featuredDeal, 3600) // Cache for 1 hour
    logger.info(`Cache set for key: ${cacheKey}`)
    res.status(200).json({
        success: true,
        message: 'Feature deal retrieved successfully',
        doc: featuredDeal,
    })
})
// Update Feature Deal
export const updateFeaturedDeal = catchAsync(async (req, res) => {
    const { id } = req.params
    const { title, startDate, endDate, status } = req.body
    const updateData = { title, startDate, endDate, status }

    const updatedFeaturedDeal = await FeaturedDeal.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    )

    if (checkExpiration(updatedFeaturedDeal)) {
        updatedFeaturedDeal.status = 'expired'
        await updatedFeaturedDeal.save()
    }

    await deleteCache(`featuredDeal_${id}`)
    await deleteCache('featuredDeals')

    sendSuccessResponse(
        res,
        updatedFeaturedDeal,
        'Feature deal updated successfully'
    )
})

// Add Product to Feature Deal
export const addProductToFeaturedDeal = catchAsync(async (req, res) => {
    const { id } = req.params
    const { productId } = req.body

    // Check if the product exists
    const product = await Product.findById(productId)
    if (!product) {
        return res.status(404).json({ message: 'Product not found' })
    }

    const featuredDeal = await FeaturedDeal.findById(id)
    if (!featuredDeal) {
        return res.status(404).json({ message: 'Feature Deal not found' })
    }

    // Add the product to the feature deal if it isn't already included
    if (!featuredDeal.productIds.includes(productId)) {
        featuredDeal.productIds.push(productId)
        featuredDeal.activeProducts = featuredDeal.productIds.length
        await featuredDeal.save()

        await deleteCache(`featuredDeal_${id}`)
        await deleteCache('featuredDeals')
    }

    res.status(200).json({
        message: 'Product added to Feature Deal successfully',
        featuredDeal,
    })
})

// Remove Product from Feature Deal
export const removeProductFromFeaturedDeal = catchAsync(async (req, res) => {
    const { id } = req.params
    const { productId } = req.body

    const featuredDeal = await FeaturedDeal.findById(id)
    if (!featuredDeal) {
        return res.status(404).json({ message: 'Feature Deal not found' })
    }

    if (!featuredDeal.productIds.includes(productId)) {
        return res
            .status(400)
            .json({ message: 'Product not found in Feature Deal' })
    }

    featuredDeal.productIds = featuredDeal.productIds.filter(
        (pid) => pid.toString() !== productId
    )
    featuredDeal.activeProducts = featuredDeal.productIds.length

    await featuredDeal.save()
    await deleteCache(`featuredDeal_${id}`)
    await deleteCache('featuredDeals')

    res.status(200).json({
        message: 'Product removed from Feature Deal successfully',
        featuredDeal,
    })
})

// Update Feature Deal Status
export const updateFeaturedDealStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = ['active', 'inactive', 'expired']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const updatedFeaturedDeal = await FeaturedDeal.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updatedFeaturedDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' })
        }

        await deleteCache(`featuredDeal_${id}`)
        await deleteCache('featuredDeals')

        sendSuccessResponse(
            res,
            updatedFeaturedDeal,
            'Feature Deal status updated successfully'
        )
    } catch (error) {
        logger.error(`Error updating feature deal status: ${error.message}`)
        sendErrorResponse(res, error)
    }
}

// Update Publish Status
export const updatePublishStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const { publish } = req.body

    if (publish !== true && publish !== false) {
        return res.status(400).json({ message: 'Invalid publish status' })
    }

    const featuredDeal = await FeaturedDeal.findById(id)
    if (!featuredDeal) {
        return res.status(404).json({ message: 'Feature Deal not found' })
    }

    featuredDeal.isPublished = publish
    await featuredDeal.save()

    await deleteCache(`featuredDeal_${id}`)
    await deleteCache('featuredDeals')

    res.status(200).json({
        message: 'Feature Deal publish status updated successfully',
        featuredDeal,
    })
})

// Delete Feature Deal
export const deleteFeaturedDeal = deleteOne(FeaturedDeal)

export const deleteProductFromFeaturedDeal = catchAsync(async (req, res) => {
    const { id, productId } = req.params

    const featuredDeal = await FeaturedDeal.findById(id)
    if (!featuredDeal) {
        return res.status(404).json({ message: 'Feature Deal not found' })
    }

    // Remove the product from the feature deal
    if (!featuredDeal.productIds.includes(productId)) {
        return res
            .status(400)
            .json({ message: 'Product not found in Feature Deal' })
    }

    featuredDeal.productIds = featuredDeal.productIds.filter(
        (pid) => pid.toString() !== productId
    )
    featuredDeal.activeProducts = featuredDeal.productIds.length

    await featuredDeal.save()

    await deleteCache(`featuredDeal_${id}`)
    await deleteCache('featuredDeals')

    res.status(200).json({
        message: 'Product removed from Feature Deal successfully',
        featuredDeal,
    })
})
