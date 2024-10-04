import express from 'express'
import dealOfTheDayValidationSchema from './../validations/dealOfTheDayValidator.js'
import { validateSchema } from './../middleware/validationMiddleware.js'
import {
    createDealOfTheDay,
    getAllDealsOfTheDay,
    getDealOfTheDayById,
    updateDealOfTheDay,
    deleteDealOfTheDay,
} from '../controllers/dealOfTheDayController.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()
router
    .route('/')
    .post(
        protect,
        restrictTo('admin', 'vendor'),
        validateSchema(dealOfTheDayValidationSchema),
        createDealOfTheDay
    )
    .get(protect, getAllDealsOfTheDay)

router
    .route('/:id')
    .get(getDealOfTheDayById)
    .put(protect, restrictTo('admin', 'vendor'), updateDealOfTheDay)
    .delete(protect, restrictTo('admin', 'vendor'), deleteDealOfTheDay)

export default router
