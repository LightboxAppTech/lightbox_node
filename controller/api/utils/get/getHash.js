const jwt = require('jsonwebtoken')

module.exports = (plainText) => {
  return jwt.sign({ plainText }, process.env.SECRET)
}
