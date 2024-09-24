import Banner from '../models/bannerModel.js'
import catchAsync from '../utils/catchAsync.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'

// Create a new banner
export const createBanner = catchAsync(async (req, res) => {
    const { bannerType, resourceType, resourceId, url, publish } = req.body
    const bannerImage = req.file ? req.file.path : null

    const banner = new Banner({
        bannerType,
        resourceType,
        resourceId,
        url,
        bannerImage,
        publish,
    })
    await banner.save()
    res.status(201).json(banner)
    res.status(400).json({ message: error.message })
})

// Get all banners
export const getBanners = getAll(Banner)
// Update a banner (including publish field and banner image)
export const updateBanner = catchAsync(async (req, res) => {
    const { id } = req.params
    const { bannerType, resourceType, resourceId, url, publish } = req.body
    const bannerImage = req.file ? req.file.path : null

    const updatedFields = {
        bannerType,
        resourceType,
        resourceId,
        url,
        publish,
    }

    if (bannerImage) {
        updatedFields.bannerImage = bannerImage
    }

    const doc = await Banner.findByIdAndUpdate(id, updatedFields, {
        new: true,
    })

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Banner, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})
// Delete a banner
export const deleteBanner = deleteOne(Banner)

// Get a banner by ID
export const getBannerById = getOne(Banner)
