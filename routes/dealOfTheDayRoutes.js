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

const router = express.Router()
router
    .route('/')
    .post(validateSchema(dealOfTheDayValidationSchema), createDealOfTheDay)
    .get(getAllDealsOfTheDay)

router
    .route('/:id')
    .get(getDealOfTheDayById)
    .put(updateDealOfTheDay)
    .delete(deleteDealOfTheDay)

export default router
