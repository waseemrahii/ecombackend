import mongoose from 'mongoose'
import AppError from '../utils/appError.js'

const vendorBankSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Please provide vendor ID.'],
            unique: true,
        },
        holderName: {
            type: String,
            required: [true, 'Please provide holder name.'],
            trim: true,
        },
        bankName: {
            type: String,
            required: [true, 'Please provide bank name.'],
            trim: true,
        },
        branch: {
            type: String,
            required: [true, 'Please provide branch name.'],
            trim: true,
        },
        accountNumber: {
            type: String,
            required: [true, 'Please provide account number.'],
            unique: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

vendorBankSchema.post('save', async function (next) {
    try {
        const vendor = await mongoose.model('Vendor').findById(this.vendor)
        if (!vendor) {
            return next(
                new AppError('Referenced vendor ID does not exist', 400)
            )
        }

        next()
    } catch (err) {
        next(err)
    }
})

export default mongoose.model('VendorBank', vendorBankSchema)
