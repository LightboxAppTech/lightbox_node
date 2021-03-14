const jwt = require("jsonwebtoken");
const User = require("../../../../model/user_profile");

module.exports = async (req, res) => {
  try {
    const token = req.cookies["access-token"];
    const verifiedUser = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(verifiedUser._id);
    if (user == null) throw new Error("incomplete user profile");
    return user;
  } catch (e) {
    throw e;
  }
};
