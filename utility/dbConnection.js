const mongoose = require('mongoose')
require('dotenv').config()

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION, {
      useNewUrlParser: true,
    })
    console.log('Connected to database')
  } catch (error) {
    console.error('Error connecting to database =>', error.message)
    process.exit(1)
  }
}
