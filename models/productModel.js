import mongoose from 'mongoose'
import AppError from './../utils/appError.js'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide Product name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide Product description'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please provide Category'],
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
        },
        subSubCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubSubCategory',
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: [true, 'Please provide Brand'],
        },
        productType: {
            type: String,
            required: [true, 'Please provide Product type'],
        },
        digitalProductType: {
            type: String,
            enum: ['physical', 'digital'],
            default: 'physical',
        },
        sku: {
            type: String,
            required: [true, 'Please provide SKU'],
        },
        unit: {
            type: String,
            required: [true, 'Please provide Unit'],
        },
        tags: [String],
        price: {
            type: Number,
            required: [true, 'Please provide Price'],
        },
        discount: {
            type: Number,
            discount: 0,
        },
        discountType: {
            type: String,
            enum: ['percent', 'flat'],
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        taxIncluded: {
            type: Boolean,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        minimumOrderQty: {
            type: Number,
            required: [true, 'Please provide Minimum order quantity'],
        },
        stock: {
            type: Number,
            required: [true, 'Please provide Stock'],
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        colors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Color',
            },
        ],
        attributes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Attribute',
            },
        ],
        thumbnail: String,
        images: [String],
        videoLink: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide user.'],
        },
        userType: {
            type: String,
            enum: ['vendor', 'admin'],
            required: true,
        },
        slug: String,
        rating: {
            type: Number,
            required: [true, 'Please provide rating.'],
            default: 0,
            set: (val) => (Math.round(val * 10) / 10).toFixed(1),
        },
        numOfReviews: {
            type: Number,
            required: [true, 'Number of reviews are required.'],
            default: 0,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

productSchema.pre('save', async function (next) {
    if (this.category) {
        const category = await mongoose
            .model('Category')
            .findById(this.category)
        if (!category) {
            return next(
                new AppError('Referenced category ID does not exist', 400)
            )
        }
    }

    if (this.subCategory) {
        const subCategory = await mongoose
            .model('SubCategory')
            .findById(this.subCategory)

        if (!subCategory) {
            return next(
                new AppError('Referenced subCategory ID does not exist', 400)
            )
        }
    }

    if (this.subSubCategory) {
        const subSubCategory = await mongoose
            .model('SubSubCategory')
            .findById(this.subSubCategory)

        if (!subSubCategory) {
            return next(
                new AppError('Referenced subSubCategory ID does not exist', 400)
            )
        }
    }

    const brand = await mongoose.model('Brand').findById(this.brand)
    if (!brand) {
        return next(new AppError('Referenced brand ID does not exist', 400))
    }
    next()
})

// Virtual middleware fetch all the reviews associated with this product
productSchema.virtual('reviews', {
    ref: 'ProductReview',
    localField: '_id',
    foreignField: 'product',
})

productSchema.virtual('totalOrders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'products',
    count: true,
})

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name',
    })
        .populate({
            path: 'brand',
            select: 'name',
        })
        .populate({
            path: 'subCategory',
            select: 'name',
        })
        .populate({
            path: 'subSubCategory',
            select: 'name',
        })
    next()
})

productSchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('Review').deleteMany({ product: doc._id })
    }
})

const Product = mongoose.model('Product', productSchema)

export default Product
