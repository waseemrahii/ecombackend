import Joi from 'joi'

const addressSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'any.required': 'Name is required.',
        'string.base': 'Name must be a string.',
        'string.empty': 'Name cannot be empty.',
        'string.min': 'Name must be at least 3 characters long.',
        'string.max': 'Name must be at most 50 characters long.',
    }),
    address: Joi.string().min(5).max(100).required().messages({
        'any.required': 'Address is required.',
        'string.base': 'Address must be a string.',
        'string.empty': 'Address cannot be empty.',
        'string.min': 'Address must be at least 5 characters long.',
        'string.max': 'Address must be at most 100 characters long.',
    }),
    city: Joi.string().min(2).max(50).required().messages({
        'any.required': 'City is required.',
        'string.base': 'City must be a string.',
        'string.empty': 'City cannot be empty.',
        'string.min': 'City must be at least 2 characters long.',
        'string.max': 'City must be at most 50 characters long.',
    }),
    state: Joi.string().min(2).max(50).required().messages({
        'any.required': 'State is required.',
        'string.base': 'State must be a string.',
        'string.empty': 'State cannot be empty.',
        'string.min': 'State must be at least 2 characters long.',
        'string.max': 'State must be at most 50 characters long.',
    }),
    zipCode: Joi.string()
        .pattern(/^[0-9]{5,10}$/)
        .required()
        .messages({
            'any.required': 'Zip code is required.',
            'string.base': 'Zip code must be a string.',
            'string.empty': 'Zip code cannot be empty.',
            'string.pattern.base': 'Zip code must be between 5 and 10 digits.',
        }),
    country: Joi.string().min(2).max(50).required().messages({
        'any.required': 'Country is required.',
        'string.base': 'Country must be a string.',
        'string.empty': 'Country cannot be empty.',
        'string.min': 'Country must be at least 2 characters long.',
        'string.max': 'Country must be at most 50 characters long.',
    }),
    phoneNumber: Joi.string().required().messages({
        'any.required': 'Phone number is required.',
        'string.base': 'Phone number must be a string.',
        'string.empty': 'Phone number cannot be empty.',
    }),
})

const orderValidationSchema = Joi.object({
    customerId: Joi.string().required().messages({
        'any.required': 'Customer ID is required',
        'string.base': 'Customer ID must be a string',
    }),
    vendors: Joi.array()
        .items(
            Joi.string().required().messages({
                'any.required': 'Vendor ID is required',
                'string.base': 'Vendor ID must be a string',
            })
        )
        .required()
        .messages({
            'any.required': 'Vendors are required',
        }),
    products: Joi.array()
        .items(
            Joi.string().required().messages({
                'any.required': 'Product ID is required',
                'string.base': 'Product ID must be a string',
            })
        )
        .required()
        .messages({
            'any.required': 'Products are required',
        }),

    totalAmount: Joi.number().required().messages({
        'any.required': 'Total amount is required',
        'number.base': 'Total amount must be a number',
    }),
    paymentMethod: Joi.string()
        .valid('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery')
        .required()
        .messages({
            'any.required': 'Payment method is required',
            'string.base': 'Payment method must be a string',
            'any.only': 'Invalid payment method',
        }),
    shippingAddress: addressSchema.required().messages({
        'any.required': 'Shipping address is required.',
    }),
    billingAddress: addressSchema.required().messages({
        'any.required': 'Billing address is required.',
    }),
})

export default orderValidationSchema
