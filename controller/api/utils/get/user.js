const jwt = require('jsonwebtoken')
const User = require('../../../../models/userProfile')

module.exports = async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7)
    // console.log(token);

    // const token = req.cookies["access-token"];
    const verifiedUser = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(verifiedUser._id)
    if (user == null) throw new Error('incomplete user profile')
    return user
  } catch (e) {
    // throw e;
    return res.status(401).json({ message: 'Unauthorized User' })
  }
}
