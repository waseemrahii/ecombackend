import config from './config/index.js'
import connectDB from './config/db.js'
import cron from 'node-cron'

import FeaturedDeal from './models/featuredDealModel.js'

import app from './app.js'

connectDB()

const port = config.port || 3000

// Schedule the task here
cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = new Date()
        await FeaturedDeal.updateMany(
            { endDate: { $lt: currentDate } },
            { $set: { status: 'expired' } }
        )
        console.log('Expired Feartured deals updated successfully')
    } catch (error) {
        console.error('Error updating expired deals:', error)
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
