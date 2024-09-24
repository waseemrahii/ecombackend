import Subscriber from '../models/subscriberModel.js'
import { createOne, deleteOne, getAll } from './handleFactory.js'

// Add a new subscriber
export const addSubscriber = createOne(Subscriber)
// Get all subscribers or search subscribers by email
export const getSubscribers = getAll(Subscriber)
// Delete a subscriber by ID
export const deleteSubscriber = deleteOne(Subscriber)
