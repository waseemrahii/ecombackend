import mongoose from 'mongoose'
import AppError from '../utils/appError.js'

const productReviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide product Id.'],
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Please provide customer Id.'],
        },
        review: {
            type: String,
            required: [true, 'Please provide review.'],
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide rating.'],
            min: 1,
            max: 5,
            set: (val) => (Math.round(val * 10) / 10).toFixed(1),
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
)

// productReviewSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'customer',
//         select: '-__v -createdAt -updatedAt -role -status -referCode',
//     }).populate({
//         path: 'product',
//         select: '-__v -createdAt -updatedAt',
//     })
// })

productReviewSchema.pre('save', async function (next) {
    const customer = await mongoose.model('Customer').findById(this.customer)

    if (!customer) {
        return next(new AppError('Referenced customer ID does not exist', 400))
    }

    const product = await mongoose.model('Product').findById(this.product)

    if (!product) {
        return next(new AppError('Referenced product ID does not exist', 400))
    }
    next()
})

const ProductReview = mongoose.model('ProductReview', productReviewSchema)

export default ProductReview
