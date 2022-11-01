const User = require('../../../../model/user')
const jwt = require('jsonwebtoken')
module.exports = async (req) => {
  try {
    const token = req.headers.authorization.substring(7)

    // console.log(token);

    // if (req.cookies["access-token"] === undefined)
    //   throw new Error("Unauthenticated");
    // let uid = jwt.verify(req.cookies["access-token"], process.env.SECRET);
    let uid = jwt.verify(token, process.env.SECRET)
    return await User.findById(uid._id)
  } catch (e) {
    // throw e;
    return res.status(401).json({ message: 'Unauthorized User' })
  }
}
