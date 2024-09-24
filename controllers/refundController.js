import Refund from '../models/refundModel.js'
import Order from '../models/orderModel.js'
import mongoose from 'mongoose'
import {
    sendSuccessResponse,
    sendErrorResponse,
} from '../utils/responseHandler.js'
import { createOne, deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import AppError from '../utils/appError.js'

// Create a new refund request
export const createRefund = catchAsync(async (req, res, next) => {
    const { reasonByCustomer, order } = req.body

    const refund = await Refund.create({ order, reasonByCustomer })

    if (!refund) {
        return next(new AppError(`Refund could not be created`, 400))
    }

    const cacheKeyOne = getCacheKey('Refund', refund?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(refund))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Refund', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: refund,
    })
})

export const getAllRefunds = getAll(Refund)

// Get refund by ID
export const getRefundById = getOne(Refund)

// Update a refund status
export const updateRefundStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const refund = await Refund.findById(id)

    if (!refund) {
        return next(new AppError('No refund found with that ID', 404))
    }

    const updatedRefund = {
        status: req.body.status || refund.status,
        approveReason: req.body.approveReason || refund.status,
        rejectReason: req.body.rejectReason || refund.rejectReason,
    }

    const doc = await Refund.findByIdAndUpdate(id, updatedRefund, {
        new: true,
        runValidators: true,
    })

    // Update cache
    const cacheKey = getCacheKey(Refund, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})

// Delete a refund
export const deleteRefund = deleteOne(Refund)
