import mongoose from 'mongoose'
import AppError from '../utils/appError.js'

const refundSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Please provide order Id.'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'refunded', 'rejected'],
            default: 'pending',
        },
        statusReason: {
            type: String,
        },
        reason: {
            type: String,
            required: [true, 'Please provide reason.'],
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: {
            type: Date,
        },
    },
    { timestamps: true }
)

refundSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'order',
        select: '-__v -createdAt -updatedAt',
    })
    next()
})

refundSchema.pre('save', async function (next) {
    try {
        const order = await mongoose.model('Order').findById(this.order)
        if (!order) {
            return next(new AppError('Referenced order ID does not exist', 400))
        }

        next()
    } catch (err) {
        next(err)
    }
})

const Refund = mongoose.model('Refund', refundSchema)

export default Refund
