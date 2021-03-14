const User = require("../../../../model/user");
const jwt = require("jsonwebtoken");
module.exports = async (req) => {
  try {
    if (req.cookies["access-token"] === undefined)
      throw new Error("Unauthenticated");
    let uid = jwt.verify(req.cookies["access-token"], process.env.SECRET);
    return await User.findById(uid._id);
  } catch (e) {
    throw e;
  }
};
