import Product from '../models/productModel.js'
import { client } from '../utils/redisClient.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { validateProductDependencies } from '../utils/validation.js'
import { populateProductDetails } from '../utils/productHelper.js'
import { buildFilterQuery, buildSortOptions } from '../utils/filterHelper.js'
import Customer from '../models/customerModel.js'
import {
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateStatus,
} from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import slugify from 'slugify'

// Create a new product
export const createProduct = catchAsync(async (req, res) => {
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
        discountAmount,
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

// Update product images
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
/// export const getAllProducts = async (req, res) => {
// 	try {
// 		const { priceRange, sort, order = "asc", page = 1, limit = 10 } = req.query;

// 		let query = buildFilterQuery(req.query);

// 		if (priceRange) {
// 			const [minPrice, maxPrice] = priceRange.split("-").map(Number);
// 			query.price = { $gte: minPrice, $lte: maxPrice };
// 		}

// 		let sortOptions = buildSortOptions(sort, order);
// 		const cacheKey = `products_${JSON.stringify(req.query)}`;
// 		const cachedProducts = await client.get(cacheKey);
// 		if (cachedProducts) {
// 			console.log("Returning cached products");
// 			return sendSuccessResponse(res, JSON.parse(cachedProducts), 200);
// 		}

// 		const skip = (page - 1) * limit;
// 		const products = await Product.find(query)
// 			.populate("category", "name")
// 			.populate("subCategory", "name")
// 			.populate("brand", "name")
// 			.populate("colors", "name")
// 			.populate("attributes", "name")
// 			.sort(sortOptions)
// 			.skip(skip)
// 			.limit(parseInt(limit));

// 		const totalDocs = await Product.countDocuments(query);
// 		const response = {
// 			products,
// 			totalDocs,
// 			limit: parseInt(limit),
// 			totalPages: Math.ceil(totalDocs / limit),
// 			page: parseInt(page),
// 			pagingCounter: skip + 1,
// 			hasPrevPage: page > 1,
// 			hasNextPage: page * limit < totalDocs,
// 			prevPage: page > 1 ? page - 1 : null,
// 			nextPage: page * limit < totalDocs ? page + 1 : null,
// 		};

// 		await client.set(cacheKey, JSON.stringify(response), "EX", 3600); // Cache for 1 hour

// 		// console.log('Returning products from database');
// 		sendSuccessResponse(res, response, 200);
// 	} catch (error) {
// 		// console.error('Error fetching products:', error);
// 		sendErrorResponse(res, error);
// 	}
// };
export const getAllProducts = getAll(Product, { path: 'reviews' })

export const getProductById = getOne(Product, { path: 'reviews' })
// Delete a Product
export const deleteProduct = deleteOne(Product)

// update product
// export const updateProduct = updateOne(Product)
// Add a new review to a product
export const addReview = async (req, res) => {
    try {
        console.log('review ')
        const productId = req.params.productId
        const { customer: customerId, review, rating } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findById(customerId)

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        product.reviews.push({
            customer: customerId,
            review,
            rating,
        })

        console.log(product)

        await product.save()
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, product, 'Product Created Successfully')
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update product status
export const updateProductStatus = updateStatus(Product)

// Update product featured status
export const updateProductFeaturedStatus = async (req, res) => {
    try {
        const productId = req.params.id
        const { isFeatured } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.isFeatured = isFeatured
        await product.save()
        await client.del('all_products:*')
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, product, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

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
    re
    product.status = 'sold'

    res.status(200).json({
        status: 'success',
        doc: product,
    })
})

// Update product details
export const updateProduct = catchAsync(async (req, res) => {
    const productId = req.params.id

    const { error } = productValidationSchema.validate(req.body, {
        abortEarly: false,
    })
    if (error) {
        return res.status(400).json({
            message: error.details.map((err) => err.message).join(', '),
        })
    }

    const {
        name,
        description,
        category,
        subCategorySlug,
        subSubCategorySlug,
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

    const {
        categoryObj,
        subCategoryObj,
        subSubCategoryObj,
        brandObj,
        colorObjs,
        attributeObjs,
    } = await validateProductDependencies({
        category,
        subCategorySlug,
        subSubCategorySlug,
        brand,
        colors,
        attributes,
    })

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            name,
            description,
            category: categoryObj ? categoryObj._id : undefined,
            subCategory: subCategoryObj ? subCategoryObj._id : undefined,
            subSubCategory: subSubCategoryObj
                ? subSubCategoryObj._id
                : undefined,
            brand: brandObj ? brandObj._id : undefined,
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
            isFeatured: isFeatured || false,
            colors: colorObjs ? colorObjs.map((color) => color._id) : undefined,
            attributes: attributeObjs
                ? attributeObjs.map((attribute) => attribute._id)
                : undefined,
            size,
            videoLink,
            userId,
            userType,
            status: 'pending',
        },
        { new: true }
    )

    await client.del('all_products:*')
    await client.del(`product_${productId}`)
    sendSuccessResponse(res, updatedProduct, 200)
})

export const getProductBySlug = getOneBySlug(Product, { path: 'reviews' })

export const searchProducts = catchAsync(async (req, res, next) => {
    const { query, page = 1, limit = 10 } = req.query

    console.log('search', query)

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
