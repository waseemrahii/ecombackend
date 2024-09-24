import Coupon from "../models/couponModel.js";
import Vendor from "../models/vendorModel.js";
import Customer from "../models/customerModel.js";
import Product from "../models/productModel.js";

export const populateCouponData = async (query) => {
	return await Coupon.find(query)
		.populate({
			path: "applicableProducts",
			select: "name price",
		})
		.populate({
			path: "applicableVendors",
			select: "shopName",
		})
		.populate({
			path: "applicableCustomers",
			select: "firstName lastName",
		});
};

const sendErrorResponse = (res, status, message) => {
	res.status(status).json({ message });
};

// Create a new coupon
export const createCoupon = async (req, res) => {
	try {
		const {
			title,
			code,
			type,
			userLimit,
			discountBearer,
			discountType,
			discountAmount,
			minPurchase,
			maxDiscount,
			startDate,
			expireDate,
			status,
			applicableProducts,
			allVendors = false,
			applicableVendors,
			allCustomers = false,
			applicableCustomers,
		} = req.body;

		// Handle selecting all vendors
		let vendorIds = [];
		if (allVendors) {
			vendorIds = await Vendor.find({}).distinct("_id");
		} else if (applicableVendors && applicableVendors.length > 0) {
			vendorIds = await Vendor.find({
				_id: { $in: applicableVendors },
			}).distinct("_id");
			if (vendorIds.length !== applicableVendors.length) {
				return sendErrorResponse(res, 400, "Some vendors do not exist.");
			}
		}

		// Handle selecting all customers
		let customerIds = [];
		if (allCustomers) {
			customerIds = await Customer.find({}).distinct("_id");
		} else if (applicableCustomers && applicableCustomers.length > 0) {
			customerIds = await Customer.find({
				_id: { $in: applicableCustomers },
			}).distinct("_id");
			if (customerIds.length !== applicableCustomers.length) {
				return sendErrorResponse(res, 400, "Some customers do not exist.");
			}
		}

		// Validate applicable products
		if (applicableProducts && applicableProducts.length > 0) {
			const productsExist = await Product.find({
				_id: { $in: applicableProducts },
			});
			if (productsExist.length !== applicableProducts.length) {
				return sendErrorResponse(res, 400, "Some products do not exist.");
			}
		}

		const newCoupon = new Coupon({
			title,
			code,
			type,

			userLimit,
			discountBearer,
			discountType,
			discountAmount,
			minPurchase,
			maxDiscount,
			startDate,
			expireDate,
			status,
			applicableProducts,
			applicableVendors: vendorIds,
			applicableCustomers: customerIds,
		});

		const savedCoupon = await newCoupon.save();
		res.status(201).json(savedCoupon);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Get all coupons with populated product names and prices and optional search
export const getAllCoupons = async (req, res) => {
	try {
		const { search = "" } = req.query;

		const coupons = await populateCouponData({
			$or: [
				{ title: new RegExp(search, "i") },
				{ code: new RegExp(search, "i") },
			],
		});

		res.status(200).json(coupons);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get a single coupon by ID with populated product names and prices
export const getCouponById = async (req, res) => {
	try {
		const coupon = await populateCouponData({ _id: req.params.id });

		if (!coupon.length)
			return res.status(404).json({ message: "Coupon not found" });
		res.status(200).json(coupon[0]);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update a coupon by ID
export const updateCoupon = async (req, res) => {
	try {
		const {
			title,
			code,
			type,

			userLimit,
			discountBearer,
			discountType,
			discountAmount,
			minPurchase,
			maxDiscount,
			startDate,
			expireDate,
			status,
			applicableProducts,
			allVendors = false,
			applicableVendors,
			allCustomers = false,
			applicableCustomers,
		} = req.body;

		// Handle selecting all vendors
		let vendorIds = [];
		if (allVendors) {
			vendorIds = await Vendor.find({}).distinct("_id");
		} else if (applicableVendors && applicableVendors.length > 0) {
			vendorIds = await Vendor.find({
				_id: { $in: applicableVendors },
			}).distinct("_id");
			if (vendorIds.length !== applicableVendors.length) {
				return sendErrorResponse(res, 400, "Some vendors do not exist.");
			}
		}

		// Handle selecting all customers
		let customerIds = [];
		if (allCustomers) {
			customerIds = await Customer.find({}).distinct("_id");
		} else if (applicableCustomers && applicableCustomers.length > 0) {
			customerIds = await Customer.find({
				_id: { $in: applicableCustomers },
			}).distinct("_id");
			if (customerIds.length !== applicableCustomers.length) {
				return sendErrorResponse(res, 400, "Some customers do not exist.");
			}
		}

		// Validate applicable products
		if (applicableProducts && applicableProducts.length > 0) {
			const productsExist = await Product.find({
				_id: { $in: applicableProducts },
			});
			if (productsExist.length !== applicableProducts.length) {
				return sendErrorResponse(res, 400, "Some products do not exist.");
			}
		}

		const updatedCoupon = await Coupon.findByIdAndUpdate(
			req.params.id,
			{
				title,
				code,
				type,

				userLimit,
				discountBearer,
				discountType,
				discountAmount,
				minPurchase,
				maxDiscount,
				startDate,
				expireDate,
				status,
				applicableProducts,
				applicableVendors: vendorIds,
				applicableCustomers: customerIds,
			},
			{ new: true, runValidators: true }
		);

		if (!updatedCoupon)
			return res.status(404).json({ message: "Coupon not found" });
		res.status(200).json(updatedCoupon);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Update coupon status by ID
export const updateCouponStatus = async (req, res) => {
	try {
		const { status } = req.body;

		// Ensure valid status
		const validStatuses = ["pending", "active", "rejected"];
		if (!validStatuses.includes(status)) {
			return sendErrorResponse(res, 400, "Invalid status.");
		}

		const updatedCoupon = await Coupon.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!updatedCoupon)
			return res.status(404).json({ message: "Coupon not found" });
		res.status(200).json(updatedCoupon);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Delete a coupon by ID
export const deleteCoupon = async (req, res) => {
	try {
		const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
		if (!deletedCoupon)
			return res.status(404).json({ message: "Coupon not found" });
		res.status(200).json({ message: "Coupon deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
