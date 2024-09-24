import Joi from 'joi'

const notificationValidationSchema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': 'Title is required',
        'string.base': 'Title must be a string',
        'string.empty': 'Title cannot be empty',
    }),
    description: Joi.string().required().messages({
        'any.required': 'Description is required',
        'string.base': 'Description must be a string',
        'string.empty': 'Description cannot be empty',
    }),
    image: Joi.string().optional().allow(''),
    status: Joi.string()
        .valid('active', 'inactive')
        .default('inactive')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Invalid status',
        }),
    count: Joi.number().default(0).messages({
        'number.base': 'Count must be a number',
    }),
})

export default notificationValidationSchema
