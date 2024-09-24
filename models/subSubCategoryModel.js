import mongoose from 'mongoose'
import slugify from 'slugify'

const subSubCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide sub sub category name.'],
            unique: true,
            trim: true,
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide main category.'],
            ref: 'Category',
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide sub category.'],
            ref: 'SubCategory',
        },
        priority: Number,
        slug: {
            type: String,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

subSubCategorySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'mainCategory subCategory',
        select: 'name',
    })
    next()
})

subSubCategorySchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('Product').deleteMany({ subSubCategory: doc._id })
    }
})

subSubCategorySchema.pre('save', async function (next) {
    const category = await mongoose
        .model('Category')
        .findById(this.mainCategory)

    if (!category) {
        return next(new AppError('Referenced category ID does not exist', 400))
    }
    const subCategory = await mongoose
        .model('SubCategory')
        .findById(this.subCategory)

    if (!subCategory) {
        return next(
            new AppError('Referenced sub category ID does not exist', 400)
        )
    }
    next()
})

const SubSubCategory = mongoose.model('SubSubCategory', subSubCategorySchema)

export default SubSubCategory
