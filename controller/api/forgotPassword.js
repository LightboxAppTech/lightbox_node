require("dotenv").config();
const User = require("../../model/user");
const bcrypt = require("bcryptjs");

const ONEDAY = 24 * 60 * 60 * 1000;
const emailRegEx = RegExp(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

const verifyForgotPasswordCode = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (
      email === "" ||
      code === "" ||
      email === undefined ||
      code === undefined ||
      password === undefined ||
      emailRegEx.test(email) === false ||
      Number.isNaN(Number(code).valueOf())
    ) {
      console.log("Error in Data");
      return res.status(400).json({ message: "Bad request" });
    }

    let savedUser = await User.findOne({ email: email });

    if (savedUser === null) {
      console.log("User not Exists ");
      return res.status(400).json({ message: "Bad request" });
    }

    let validTime =
      savedUser.forgotPasswordVerification.code != null
        ? Date.now() - savedUser.forgotPasswordVerification.validUpTo
        : ONEDAY + 10;

    if (
      validTime > ONEDAY ||
      Number(code).valueOf() != savedUser.forgotPasswordVerification.code
    ) {
      return res.status(400).json({
        message:
          "You've entered Wrong verification code or code has been expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    savedUser.password = hashedPassword;
    await savedUser.save();

    return res.status(200).json({ message: "Password Updated !" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { verifyForgotPasswordCode };
