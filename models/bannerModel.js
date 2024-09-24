import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
    {
        bannerType: {
            type: String,
            required: [true, 'Please provide banner type.'],
        },
        resourceType: {
            type: String,
            enum: ['product', 'category', 'brand', 'shop'],
            required: [true, 'Please provide resource type.'],
        },
        resourceId: {
            type: String,
            required: [true, 'Pleaese provide resource id.'],
        },
        url: {
            type: String,
            required: [true, 'Please provide banner url.'],
            unique: true,
        },
        bannerImage: {
            type: String,
            required: [true, 'Please provide banner image'],
        },
        publish: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner
