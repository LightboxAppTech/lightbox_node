const mongoose = require('mongoose')
require('dotenv').config()

const logger = require('./logger')

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION, {
      useNewUrlParser: true,
    })
    logger.info('Connected to database')
  } catch (error) {
    logger.error('Error connecting to database =>', error)
    throw new Error(error)
  }
}
