import catchAsync from '../utils/catchAsync.js'
import Order from '../models/orderModel.js'
import Wallet from '../models/adminWalletModel.js'
import Product from '../models/productModel.js'
import Customer from '../models/customerModel.js'
import Vendor from '../models/vendorModel.js'
import AppError from '../utils/appError.js'
import mongoose from 'mongoose'

export const getBusinessAnalytics = catchAsync(async (req, res, next) => {
    //Get total orders count
    const totalOrders = await Order.countDocuments()

    // Get total products count
    const totalProducts = await Product.countDocuments()

    // Get total customers count
    const totalCustomers = await Customer.countDocuments()

    // Get total stores (vendors) count
    const totalStores = await Vendor.countDocuments()

    //Get Order Status count
    const pendingOrder = await Order.countDocuments({})

    // Get order statuses count
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' })
    const confirmedOrders = await Order.countDocuments({
        orderStatus: 'confirmed',
    })
    const packagingOrders = await Order.countDocuments({
        orderStatus: 'packaging',
    })
    const outForDeliveryOrders = await Order.countDocuments({
        orderStatus: 'out_for_delivery',
    })
    const deliveredOrders = await Order.countDocuments({
        orderStatus: 'delivered',
    })
    const failedToDeliverOrders = await Order.countDocuments({
        orderStatus: 'failed_to_deliver',
    })
    const returnedOrders = await Order.countDocuments({
        orderStatus: 'returned',
    })
    const canceledOrders = await Order.countDocuments({
        orderStatus: 'canceled',
    })

    // Send the response
    res.status(200).json({
        status: 'success',
        doc: {
            totalOrders,
            totalProducts,
            totalCustomers,
            totalStores,
            ordersByStatus: {
                pending: pendingOrders,
                confirmed: confirmedOrders,
                packaging: packagingOrders,
                out_for_delivery: outForDeliveryOrders,
                delivered: deliveredOrders,
                failed_to_deliver: failedToDeliverOrders,
                returned: returnedOrders,
                canceled: canceledOrders,
            },
        },
    })
})

export const calculateAdminWallet = catchAsync(async (req, res, next) => {
    const { ownerId, userType } = req.body

    if (userType === 'vendor') {
        const vendor = await mongoose.model('Vendor').findById(ownerId)

        if (!vendor) {
            return next(new AppError('Referenced vendor does not exist', 400))
        }
    } else if (userType === 'admin') {
        const user = await mongoose.model('User').findById(ownerId)

        if (!user) {
            return next(new AppError('Referenced user does not exist', 400))
        }
    }

    // Initialize variables to store calculated values
    let inhouseEarnings = 0
    let commissionEarned = 0
    let deliveryChargeEarned = 0
    let totalTaxCollected = 0
    let pendingAmount = 0

    // Calculate In-house Earnings
    // Assuming in-house earnings come from orders where a certain product is sold by the platform (not by vendors)
    const inhouseOrders = await Order.find({ vendorId: null }) // Assuming vendorId is null for in-house sales
    inhouseOrders.forEach((order) => {
        inhouseEarnings += order.totalAmount // Assuming 'totalAmount' is the field for order total
    })

    // Calculate Commission Earned
    // Assuming commission is earned from vendors based on their sales
    const vendorOrders = await Order.find({ vendorId: { $ne: null } }) // Orders with vendor sales
    vendorOrders.forEach((order) => {
        commissionEarned += order.commission // Assuming 'commission' is a field in the Order schema
    })

    // Calculate Delivery Charge Earned
    const ordersWithDeliveryCharges = await Order.find({
        deliveryCharge: { $gt: 0 },
    }) // Orders with delivery charges
    ordersWithDeliveryCharges.forEach((order) => {
        deliveryChargeEarned += order.deliveryCharge // Assuming 'deliveryCharge' is a field in Order schema
    })

    // Calculate Total Tax Collected
    const allOrders = await Order.find()
    allOrders.forEach((order) => {
        totalTaxCollected += order.taxAmount // Assuming 'taxAmount' is a field in the Order schema
    })

    // Calculate Pending Amount
    // Assuming pendingAmount refers to orders that are pending payment
    const pendingOrders = await Order.find({ orderStatus: 'pending' })
    pendingOrders.forEach((order) => {
        pendingAmount += order.totalAmount // Assuming 'totalAmount' for pending orders
    })

    // Update or Create Admin Wallet
    let adminWallet = await Wallet.findOne() // Assuming only one Admin Wallet exists
    if (!adminWallet) {
        adminWallet = await Wallet.create({
            InhouseEarning: inhouseEarnings.toFixed(2),
            commissionEarned: commissionEarned.toFixed(2),
            deliveryChargeEarned: deliveryChargeEarned.toFixed(2),
            totalTaxCollected: totalTaxCollected.toFixed(2),
            pendingAmount: pendingAmount.toFixed(2),
        })
    } else {
        adminWallet.InhouseEarning = inhouseEarnings.toFixed(2)
        adminWallet.commissionEarned = commissionEarned.toFixed(2)
        adminWallet.deliveryChargeEarned = deliveryChargeEarned.toFixed(2)
        adminWallet.totalTaxCollected = totalTaxCollected.toFixed(2)
        adminWallet.pendingAmount = pendingAmount.toFixed(2)
        await adminWallet.save()
    }

    // Respond with the updated admin wallet
    res.status(200).json({
        status: 'success',
        doc: adminWallet,
    })
})
