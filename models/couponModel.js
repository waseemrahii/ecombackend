import mongoose from 'mongoose'
import AppError from './../utils/appError.js'

const couponSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide Title.'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Please provide Coupon Code.'],
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            enum: [
                'discount-on-purchase',
                'free-delivery',
                'buy-one-get-one',
                'others',
            ],
            required: [true, 'Please provide type.'],
        },
        userLimit: {
            limit: {
                type: Number,
                required: [true, 'Limit is required.'],
                min: [0, 'Limit cannot be negative.'],
            },
            used: {
                type: Number,
                default: 0,
                min: [0, 'Used count cannot be negative.'],
            },
        },
        couponBearer: {
            type: String,
            enum: ['vendor', 'admin'],
            required: [true, 'Please provide Coupon Bearer.'],
        },
        discountType: {
            type: String,
            enum: ['amount', 'percentage'],
            required: [true, 'Please provide Discount Type.'],
        },
        discountAmount: {
            type: Number,
            required: [true, 'Please provide Discount Amount.'],
            min: [0, 'Discount Amount cannot be negative.'],
        },
        minPurchase: {
            type: Number,
            required: [true, 'Minimum Purchase is required.'],
            min: [0, 'Minimum Purchase cannot be negative.'],
        },
        maxDiscount: {
            type: Number,
            min: [0, 'Maximum Discount cannot be negative.'],
        },
        startDate: {
            type: Date,
            required: [true, 'Please provide Start Date.'],
        },
        expiredDate: {
            type: Date,
            required: [true, 'Please provide Expired Date.'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        vendors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor',
            },
        ],
        customers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Customer',
            },
        ],
    },
    {
        timestamps: true,
    }
)

couponSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'vendors',
        select: 'shopName',
    }).populate({
        path: 'customers',
        select: 'firstName lastName',
    })

    next()
})

couponSchema.pre('save', async function (next) {
    try {
        // Check if vendors are provided and validate them
        if (this.vendors && this.vendors.length > 0) {
            const vendorCheck = await mongoose.model('Vendor').countDocuments({
                _id: { $in: this.vendors },
            })

            if (vendorCheck !== this.vendors.length) {
                return next(
                    new AppError('One or more vendors do not exist.', 400)
                )
            }
        }
        // Check if customers are provided and validate them
        if (this.customers && this.customers.length > 0) {
            const customerCheck = await mongoose
                .model('Customer')
                .countDocuments({
                    _id: { $in: this.customers },
                })

            if (customerCheck !== this.customers.length) {
                return next(
                    new AppError('One or more customers do not exist.', 400)
                )
            }
        }

        next()
    } catch (err) {
        next(err)
    }
})

const Coupon = mongoose.model('Coupon', couponSchema)

export default Coupon
