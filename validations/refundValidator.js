import Joi from 'joi'

const refundValidationSchema = Joi.object({
    order: Joi.string().required().messages({
        'string.base': 'Order ID must be a string.',
        'string.empty': 'Please provide an order ID.',
        'any.required': 'Order ID is required.',
    }),
    status: Joi.string()
        .valid('pending', 'approved', 'refunded', 'rejected')
        .default('pending')
        .messages({
            'string.base': 'Status must be a string.',
            'any.only':
                'Status must be one of the following values: pending, approved, refunded, rejected.',
        }),
    statusReason: Joi.string().optional().allow(''),
    reason: Joi.string().min(1).required().messages({
        'string.base': 'Reason must be a string.',
        'string.empty': 'Please provide a reason.',
        'any.required': 'Reason is required.',
    }),
    requestedAt: Joi.date().messages({
        'date.base': 'Requested At must be a valid date.',
    }),
    processedAt: Joi.date().optional().allow(null).messages({
        'date.base': 'Processed At must be a valid date.',
    }),
})

export default refundValidationSchema
