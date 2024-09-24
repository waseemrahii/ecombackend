import mongoose from 'mongoose'

const colorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide color name.'],
            unique: true,
            trim: true,
        },
        hexCode: {
            type: String,
            required: [true, 'Please provide color hexCode.'],
            unique: true,
        },
    },
    { timestamps: true }
)

const Color = mongoose.model('Color', colorSchema)

export default Color
