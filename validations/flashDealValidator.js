import Joi from 'joi'

const flashDealValidationSchema = Joi.object({
    title: Joi.string().required().trim().messages({
        'string.base': 'Title must be a string.',
        'any.required': 'Please provide title.',
        'string.empty': 'Title cannot be empty.',
    }),
    image: Joi.string().required().messages({
        'string.base': 'Image must be a string.',
        'string.empty': 'Image cannot be empty.',
        'any.required': 'Please provide image.',
    }),
    products: Joi.array().items(
        Joi.string().required().messages({
            'any.required': 'Product ID is required',
            'string.base': 'Product ID must be a string',
        })
    ),
    startDate: Joi.date().required().messages({
        'any.required': 'Please provide start date.',
        'date.base': 'Start date must be a valid date.',
    }),
    endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
        'any.required': 'Please provide end date.',
        'date.base': 'End date must be a valid date.',
        'date.greater': 'End date must be later than start date.',
    }),
    status: Joi.string()
        .valid('active', 'expired', 'inactive')
        .default('inactive')
        .messages({
            'string.valid':
                'Status must be one of [active, expired, inactive].',
        }),
    publish: Joi.boolean().default(false),
})

export default flashDealValidationSchema
