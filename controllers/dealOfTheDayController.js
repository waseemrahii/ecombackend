import DealOfTheDay from './../models/dealOfTheDayModel.js'
import {
    createOne,
    getAll,
    getOne,
    updateOne,
    deleteOne,
} from './handleFactory.js'

// Create a Deal of the Day
export const createDealOfTheDay = createOne(DealOfTheDay)

// Get all Deals of the Day
export const getAllDealsOfTheDay = getAll(DealOfTheDay)

// Get Deal of the Day by ID
export const getDealOfTheDayById = getOne(DealOfTheDay)

// Update Deal of the Day
export const updateDealOfTheDay = updateOne(DealOfTheDay)
// Delete Deal of the Day
export const deleteDealOfTheDay = deleteOne(DealOfTheDay)
