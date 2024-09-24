import Joi from 'joi'

const productValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Please provide Product name',
        'string.base': 'Product name must be a string',
        'string.empty': 'Product name cannot be empty',
    }),
    description: Joi.string().required().messages({
        'any.required': 'Please provide Product description',
        'string.base': 'Product description must be a string',
        'string.empty': 'Product description cannot be empty',
    }),
    category: Joi.string().required().messages({
        'any.required': 'Please provide Category',
        'string.base': 'Category must be a string',
    }),
    subCategory: Joi.string().optional().messages({
        'string.base': 'SubCategory must be a string',
    }),
    subSubCategory: Joi.string().optional().messages({
        'string.base': 'SubSubCategory must be a string',
    }),
    brand: Joi.string().required().messages({
        'any.required': 'Please provide Brand',
        'string.base': 'Brand must be a string',
    }),
    productType: Joi.string().required().messages({
        'any.required': 'Please provide Product type',
        'string.base': 'Product type must be a string',
        'string.empty': 'Product type cannot be empty',
    }),
    digitalProductType: Joi.string().optional().allow('').messages({
        'string.base': 'DigitalProductType must be a string',
    }),
    sku: Joi.string().required().messages({
        'any.required': 'Please provide SKU',
        'string.base': 'SKU must be a string',
        'string.empty': 'SKU cannot be empty',
    }),
    unit: Joi.string().required().messages({
        'any.required': 'Please provide Unit',
        'string.base': 'Unit must be a string',
        'string.empty': 'Unit cannot be empty',
    }),
    tags: Joi.array().items(Joi.string()).optional().allow('').messages({
        'array.base': 'Tags must be an array of strings',
        'string.base': 'Tag must be a string',
    }),
    price: Joi.number().required().messages({
        'any.required': 'Please provide Price',
        'number.base': 'Price must be a number',
    }),
    discount: Joi.number().default(0).messages({
        'number.base': 'Discount must be a number',
    }),
    discountType: Joi.string()
        .valid('percent', 'flat')
        .optional()
        .allow('')
        .messages({
            'string.base': 'DiscountType must be a string',
            'any.only': 'DiscountType must be either percent or flat',
        }),
    discountAmount: Joi.number().default(0).messages({
        'number.base': 'DiscountAmount must be a number',
    }),
    taxAmount: Joi.number().default(0).messages({
        'number.base': 'TaxAmount must be a number',
    }),
    taxIncluded: Joi.boolean().messages({
        'boolean.base': 'TaxIncluded must be a boolean',
    }),
    shippingCost: Joi.number().default(0).messages({
        'number.base': 'ShippingCost must be a number',
    }),
    minimumOrderQty: Joi.number().required().messages({
        'any.required': 'Please provide Minimum order quantity',
        'number.base': 'MinimumOrderQty must be a number',
    }),
    stock: Joi.number().required().messages({
        'any.required': 'Please provide Stock',
        'number.base': 'Stock must be a number',
    }),
    colors: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'Colors must be an array of strings',
        'string.base': 'Color must be a string',
    }),
    attributes: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'Attributes must be an array of strings',
        'string.base': 'Attribute must be a string',
    }),
    thumbnail: Joi.string().optional().allow('').messages({
        'string.base': 'Thumbnail must be a string',
    }),
    images: Joi.array().items(Joi.string()).optional().allow('').messages({
        'array.base': 'Images must be an array of strings',
        'string.base': 'Image must be a string',
    }),
    videoLink: Joi.string().optional().allow('').messages({
        'string.base': 'VideoLink must be a string',
    }),

    userId: Joi.string().required().messages({
        'any.required': 'Please provide user.',
        'string.base': 'UserId must be a string',
    }),
    userType: Joi.string().valid('vendor', 'admin').required().messages({
        'any.required': 'UserType is required',
        'string.base': 'UserType must be a string',
        'any.only': 'UserType must be either vendor or admin',
    }),
})

export default productValidationSchema
