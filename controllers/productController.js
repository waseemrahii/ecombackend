import Product from '../models/productModel.js'
import catchAsync from '../utils/catchAsync.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import Customer from '../models/customerModel.js'
import {
    deleteOneWithTransaction,
    getAll,
    getOne,
    getOneBySlug,
    updateStatus,
} from './handleFactory.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import slugify from 'slugify'
import mongoose from 'mongoose'
import AppError from '../utils/appError.js'
import Wishlist from '../models/wishlistModel.js'

// Create a new product
export const createProduct = catchAsync(async (req, res, next) => {
    const {
        name,
        description,
        category,
        subCategory,
        subSubCategory,
        brand,
        productType,
        digitalProductType,
        sku,
        unit,
        tags,
        price,
        discount,
        discountType,
        discountAmount,
        taxAmount,
        taxIncluded,
        minimumOrderQty,
        shippingCost,
        stock,
        isFeatured,
        colors,
        attributes,
        size,
        videoLink,
        userId,
        userType,
    } = req.body

    if (userType === 'vendor') {
        const vendor = await mongoose.model('Vendor').findById(this.userId)
        if (!vendor) {
            return next(new AppError('Referenced vendor does not exist', 400))
        }
    } else if (userType === 'admin') {
        const user = await mongoose.model('User').findById(this.userId)
        if (!user) {
            return next(new AppError('Referenced user does not exist', 400))
        }
    }

    let updatedDiscountAmount = discountAmount

    if (discountType === 'flat') {
        // If the discount type is flat, use the given discountAmount
        updatedDiscountAmount = discountAmount
    } else if (discountType === 'percent') {
        // If the discount type is percent, calculate the discount percentage
        updatedDiscountAmount = (price * discount) / 100
    }

    const newProduct = new Product({
        name,
        description,
        category,
        subCategory,
        subSubCategory,
        brand,
        productType,
        digitalProductType,
        sku,
        unit,
        tags,
        price,
        discount,
        discountType,
        discountAmount: updatedDiscountAmount,
        taxAmount,
        taxIncluded,
        minimumOrderQty,
        shippingCost,
        stock,
        isFeatured: isFeatured || false,
        colors: [colors],
        attributes: [attributes],
        size,
        videoLink,
        userId,
        userType,
        thumbnail: req.files['thumbnail']
            ? req.files['thumbnail'][0].path
            : undefined,
        images: req.files['images']
            ? req.files['images'].map((file) => file.path)
            : [],
        slug: slugify(name, { lower: true }),
    })
    await newProduct.save()

    const cacheKeyOne = getCacheKey('Product', newProduct?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(newProduct))

    // Update cache
    const cacheKey = getCacheKey('Product', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: newProduct,
    })
})

export const updateProductImages = catchAsync(async (req, res) => {
    const productId = req.params.id
    const product = await Product.findById(productId)

    // Handle case where the document was not found
    if (!product) {
        return next(new AppError(`No product found with that ID`, 404))
    }

    product.images = req.files ? req.files.map((file) => file.path) : []
    await product.save()

    const cacheKeyOne = getCacheKey(Product, req.params.id)

    // delete pervious document data
    await redisClient.del(cacheKeyOne)
    // updated the cache with new data
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(doc))

    // Update cache
    const cacheKey = getCacheKey(Product, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: product,
    })
})

export const getAllProducts = getAll(Product, {
    path: 'reviews totalOrders',
})

export const getProductById = getOne(Product, {
    path: 'reviews totalOrders',
})

export const getProductBySlug = getOneBySlug(Product, {
    path: 'reviews  totalOrders',
})

const relatedModels = [{ model: Wishlist, foreignKey: 'products' }]

// Delete a Product
export const deleteProduct = deleteOneWithTransaction(Product, relatedModels)

// Update product status
export const updateProductStatus = updateStatus(Product)

// Update product featured status
export const updateProductFeaturedStatus = catchAsync(
    async (req, res, next) => {
        const productId = req.params.id
        const { isFeatured } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return next(new AppError(`No product found`, 404))
        }

        product.isFeatured = isFeatured
        await product.save()

        // Update cache
        const cacheKey = getCacheKey('Product', '', req.query)
        await redisClient.del(cacheKey)

        res.status(200).json({
            status: 'success',
            doc: product,
        })
    }
)
// Get top-rated products
export const getTopRatedProducts = async (req, res) => {
    try {
        const topRatedProducts = await Product.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    averageRating: { $avg: '$reviews.rating' },
                },
            },
            { $sort: { averageRating: -1 } },
            { $limit: 10 },
        ])

        sendSuccessResponse(res, 200, topRatedProducts)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Get products with limited stock
export const getLimitedStockedProducts = async (req, res) => {
    try {
        const limitThreshold = 10
        const cacheKey = 'limited_stocked_products'
        const cachedProducts = await client.get(cacheKey)

        if (cachedProducts) {
            return sendSuccessResponse(res, 200, JSON.parse(cachedProducts))
        }

        const limitedStockedProducts = await Product.find({
            stock: { $lte: limitThreshold },
            status: 'active',
        })
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('brand', 'name')

        await client.set(
            cacheKey,
            JSON.stringify(limitedStockedProducts),
            'EX',
            3600
        ) // Cache for 1 hour
        sendSuccessResponse(res, limitedStockedProducts, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Mark product as sold
export const sellProduct = catchAsync(async (req, res) => {
    const productId = req.params.id

    const product = await Product.findById(productId)

    if (!product) {
        return next(new AppError(`No product found`, 404))
    }

    product.status = 'sold'

    res.status(200).json({
        status: 'success',
        doc: product,
    })
})

// Update product details
export const updateProduct = catchAsync(async (req, res) => {
    const productId = req.params.id

    const {
        name,
        description,
        category,
        subCategory,
        subSubCategory,
        brand,
        productType,
        digitalProductType,
        sku,
        unit,
        tags,
        price,
        discount,
        discountType,
        discountAmount,
        taxAmount,
        taxIncluded,
        minimumOrderQty,
        shippingCost,
        stock,
        isFeatured,
        colors,
        attributes,
        size,
        videoLink,
        userId,
        userType,
    } = req.body

    let updatedDiscountAmount = discountAmount

    if (discountType === 'flat') {
        // If the discount type is flat, use the given discountAmount
        updatedDiscountAmount = discountAmount
    } else if (discountType === 'percent') {
        // If the discount type is percent, calculate the discount percentage
        updatedDiscountAmount = (price * discount) / 100
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            name,
            description,
            category,
            subCategory,
            subSubCategory,
            brand,
            productType,
            digitalProductType,
            sku,
            unit,
            tags,
            price,
            discount,
            discountType,
            discountAmount: updatedDiscountAmount,
            taxAmount,
            taxIncluded,
            minimumOrderQty,
            shippingCost,
            stock,
            isFeatured,
            colors: [colors],
            attributes: [attributes],
            size,
            videoLink,
            userId,
            userType,
            status: 'pending',
            slug: slugify(name, { lower: true }),
        },
        { new: true }
    )

    const cacheKeyOne = getCacheKey('Product', updatedProduct?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(updatedProduct))

    // Update cache
    const cacheKey = getCacheKey('Product', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedProduct,
    })
})

export const searchProducts = catchAsync(async (req, res, next) => {
    const { query, page = 1, limit = 10 } = req.query

    // Construct regex for case-insensitive partial matching
    const searchQuery = {
        $or: [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive search in 'name'
            { description: { $regex: query, $options: 'i' } }, // Case-insensitive search in 'description'
        ],
    }

    // Fetch products with pagination
    const products = await Product.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))

    // Check if products were found
    if (products.length === 0) {
        return next(new AppError(`No product found`, 404))
    }

    // Get total product count
    const total = await Product.countDocuments(searchQuery)

    res.status(200).json({
        status: 'success',
        results: products.length,
        doc: products,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
    })
})
