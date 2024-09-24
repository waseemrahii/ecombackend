import mongoose from 'mongoose'

const dealOfTheDaySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide product'],
        },
        title: {
            type: String,
            required: [true, 'Please provide title'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'inactive'],
            default: 'inactive',
        },
    },
    {
        timestamps: true,
    }
)

dealOfTheDaySchema.pre('save', async function (next) {
    const product = await mongoose.model('Product').findById(this.product)

    if (!product) {
        return next(new AppError('Referenced product ID does not exist', 400))
    }
    next()
})

dealOfTheDaySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'product',
        select: '-__v -createdAt -updatedAt',
    })
    next()
})

const DealOfTheDay = mongoose.model('DealOfTheDay', dealOfTheDaySchema)

export default DealOfTheDay
