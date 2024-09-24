import Product from "../models/productModel.js";

// Populate product details with related fields
export const populateProductDetails = (query) => {
	return (
		query
			.populate("category", "name")
			.populate("subCategory", "name")
			// .populate('subSubCategory', 'name')
			.populate("brand", "name")
			.populate("colors", "name")
			.populate("attributes", "name")
	);
};

// Format the product response
export const formatProductResponse = (product) => {
	const formattedProduct = {
		id: product._id,
		name: product.name,
		description: product.description,
		category: product.category ? product.category.name : null,
		subCategory: product.subCategory ? product.subCategory.name : null,
		subSubCategory: product.subSubCategory ? product.subSubCategory.name : null,
		brand: product.brand ? product.brand.name : null,
		productType: product.productType,
		digitalProductType: product.digitalProductType,
		sku: product.sku,
		unit: product.unit,
		tags: product.tags,
		price: product.price,
		discount: product.discount,
		discountType: product.discountType,
		discountAmount: product.discountAmount,
		taxAmount: product.taxAmount,
		taxIncluded: product.taxIncluded,
		minimumOrderQty: product.minimumOrderQty,
		shippingCost: product.shippingCost,
		stock: product.stock,
		isFeatured: product.isFeatured,
		colors: product.colors ? product.colors.map((color) => color.name) : [],
		attributes: product.attributes
			? product.attributes.map((attr) => attr.name)
			: [],
		size: product.size,
		videoLink: product.videoLink,
		userId: product.vendor ? product.vendor : product.createdBy,
		userType: product.vendor ? "vendor" : "admin",
		thumbnail: product.thumbnail,
		images: product.images,
		status: product.status,
		createdAt: product.createdAt,
		updatedAt: product.updatedAt,
		reviews: product.reviews.map((review) => ({
			id: review._id,
			customer: review.customer,
			reviewText: review.reviewText,
			rating: review.rating,
			status: review.status,
			createdAt: review.createdAt,
			updatedAt: review.updatedAt,
		})),
		averageRating: product.averageRating,
	};

	return formattedProduct;
};
