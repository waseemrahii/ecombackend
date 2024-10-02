import Wishlist from '../models/wishlistModel.js'
import Product from '../models/productModel.js'
import Customer from '../models/customerModel.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

export const getAllWishlists = getAll(Wishlist)

export const deleteWishlist = deleteOne(Wishlist)

export const getWishlist = catchAsync(async (req, res, next) => {
    const { customerId } = req.params

    const wishlist = await Wishlist.findOne({ customer: customerId })

    if (!wishlist) {
        return next(new AppError('Customer not found.', 400))
    }

    res.status(200).json({
        status: 'success',
        doc: wishlist,
    })
})

export const addProductToWishlist = catchAsync(async (req, res, next) => {
    const { customerId, productId } = req.body
    const customer = customerId;
    const productExists = await Product.findById(productId)
    if (!productExists) {
        return next(new AppError('Product not found.', 400))
    }

    let existingCustomer = await Customer.findById(customer)
    if (!existingCustomer) {
        return next(new AppError('Customer not found.', 400))
    }

    let wishlist = await Wishlist.findOne({ customer })

    if (!wishlist) {
        wishlist = new Wishlist({
            customer,
            products: [productId],
        })
    } else {
        if (wishlist.products.includes(productId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Product already added to wishlist.',
            })
        }

        wishlist.products.push(productId)
    }

    wishlist.totalProducts = wishlist.products.length

    await wishlist.save()

    console.log(wishlist)
    res.status(200).json({
        status: 'success',
        doc: wishlist,
    })
})

export const removeProductFromWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.params
    const { customer } = req.body

    const wishlist = await Wishlist.findOne({ customer })

    if (!wishlist) {
        return next(new AppError('No wishlist found for this customer', 404))
    }
    const productIndex = wishlist.products.findIndex(
        (product) => product._id.toString() === productId
    )

    if (productIndex === -1) {
        return next(new AppError('Product not found in wishlist', 404))
    }

    wishlist.products.splice(productIndex, 1)

    wishlist.totalProducts = wishlist.products.length

    await wishlist.save()

    res.status(200).json({
        status: 'success',
        totalProducts: wishlist.totalProducts,
        doc: wishlist,
    })
})
