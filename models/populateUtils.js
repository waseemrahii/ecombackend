import Coupon from './couponModel.js';

// Utility function for populating coupon data
export const populateCouponData = async (query) => {
    return await Coupon.find(query)
        .populate({
            path: 'applicableProducts',
            select: 'name price',
        })
        .populate({
            path: 'applicableVendors',
            select: 'shopName',
        })
        .populate({
            path: 'applicableCustomers',
            select: 'firstName lastName',
        });
};
