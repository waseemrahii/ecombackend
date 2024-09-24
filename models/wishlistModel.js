import mongoose from 'mongoose'
import AppError from '../utils/appError.js'

const wishlistSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        totalProducts: {
            type: Number,
            required: [true, 'Total products required.'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

wishlistSchema.virtual('vendorBank', {
    ref: 'VendorBank',
    localField: '_id',
    foreignField: 'vendor',
})

// Calculate total products before saving the data
wishlistSchema.pre('save', function (next) {
    this.totalProducts = this.products.length
    next()
})

wishlistSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products',
        select: '-__v -createdAt -updatedAt',
    })
        .populate({
            path: 'user',
            select: '-__v -createdAt -updatedAt -role -status -referCode',
        })
        .lean()

    next()
})

wishlistSchema.pre('save', async function (next) {
    try {
        const customer = await mongoose
            .model('Customer')
            .findById(this.customer)

        if (!customer) {
            return next(
                new AppError('Referenced customer ID does not exist', 400)
            )
        }

        // Check if products are provided and validate them
        if (this.products && this.products.length > 0) {
            const productCheck = await mongoose
                .model('Product')
                .countDocuments({
                    _id: { $in: this.products },
                })

            if (productCheck !== this.products.length) {
                return next(
                    new AppError('One or more products do not exist.', 400)
                )
            }
        }

        next()
    } catch (err) {
        next(err)
    }
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

export default Wishlist
