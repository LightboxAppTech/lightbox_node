const jwt = require('jsonwebtoken')
const User = require('../../model/user')

module.exports = async (req, res, next) => {
  // const token = req.cookies["access-token"];
  const token = req.headers.authorization.substring(7)

  // console.log(token);

  if (!token) return res.status(400).json({ message: 'Unauthenticated' })
  try {
    const verifiedUser = jwt.verify(token, process.env.SECRET)
    const user = await User.findById(verifiedUser._id)

    if (user === null)
      return res.status(400).json({ message: 'Unauthenticated' })
  } catch (err) {
    // console.error(err);
    // return res.status(500).json({ message: "Something went wrong" });
    return res.status(401).json({ message: 'Unauthorized User' })
  }
  next()
}
