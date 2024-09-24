import mongoose from 'mongoose'
import validator from 'validator'

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide your email address.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email address.'],
        trim: true,
    },
    subscriptionDate: {
        type: Date,
        default: Date.now,
    },
})

const Subscriber = mongoose.model('Subscriber', subscriberSchema)
export default Subscriber
