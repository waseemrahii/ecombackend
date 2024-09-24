import mongoose from 'mongoose'
import slugify from 'slugify'
import AppError from '../utils/appError.js'

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide sub category name.'],
            unique: true,
            trim: true,
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide main category.'],
            ref: 'Category',
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

subCategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    console.log('thelk ', this.slug)
    next()
})

subCategorySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'mainCategory',
        select: 'name',
    })
    next()
})

subCategorySchema.pre('save', async function (next) {
    const category = await mongoose
        .model('Category')
        .findById(this.mainCategory)

    if (!category) {
        return next(new AppError('Referenced category ID does not exist', 400))
    }
    next()
})

subCategorySchema.post('findByIdAndDelete', async function (doc) {
    if (doc) {
        await mongoose.model('Product').deleteMany({ subCategory: doc._id })
    }

    if (doc) {
        await mongoose
            .model('SubSubCategory')
            .deleteMany({ subCategory: doc._id })
    }
})

const SubCategory = mongoose.model('SubCategory', subCategorySchema)

export default SubCategory
