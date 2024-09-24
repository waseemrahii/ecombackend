import Joi from 'joi'

const featuredDealValidationSchema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': 'Title is required',
        'string.base': 'Title must be a string',
        'string.empty': 'Title cannot be empty',
    }),
    startDate: Joi.date().required().messages({
        'any.required': 'Start date is required',
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().required().messages({
        'any.required': 'End date is required',
        'date.base': 'End date must be a valid date',
    }),
    status: Joi.string()
        .valid('active', 'inactive', 'expired')
        .default('inactive')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Invalid status',
        }),
    products: Joi.array().items(Joi.string().required()).required().messages({
        'any.required': 'Products are required',
        'array.base': 'Products must be an array',
        'string.base': 'Product ID must be a string',
        'any.required': 'Product ID is required',
    }),
})

export default featuredDealValidationSchema
