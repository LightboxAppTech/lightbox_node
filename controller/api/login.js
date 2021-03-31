const jwt = require("jsonwebtoken");
const User = require("../../model/user");
const UserProfile = require("../../model/user_profile");
const bcrypt = require("bcryptjs");
const loginValidation = require("./validation/login");

const sevenDays = 7 * 24 * 60 * 60 * 1000;

/**
 * TODO : only let user login if his/her account in verified
 *
 *      with correct password and email, check "isVerified" flag is true or not
 */

module.exports = async (req, res) => {
  try {
    const { error } = loginValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const user = await User.findOne({
      email: req.body.email.trim(),
      isVerified: true,
    });

    if (!user)
      return res.status(400).json({ message: "Incorrect email or password" });

    const validPassword = await bcrypt.compare(
      req.body.password.trim(),
      user.password
    );
    if (!validPassword)
      return res.status(400).json({ message: "Incorrect email or password" });

    // TODO : Before sending cookie check for isVerified code
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    const { _id, email, createdAt, updatedAt } = user;

    const userProfile = await UserProfile.findById(_id);
    const isProfileCompleted = userProfile ? true : false;

    const userJson = { _id, email, isProfileCompleted, createdAt, updatedAt };

    res.cookie("access-token", token, {
      maxAge: sevenDays,
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "none",
    });
    res.json(userJson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};
