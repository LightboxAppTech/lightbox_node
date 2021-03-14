/**
 *  This code controlls password reset in application
 */
// const
const VERIFICATIONCODE = { code: null, validUpTo: null };
const ONEDAY = 24 * 60 * 60 * 1000;
const User = require("../../model/user");
const bcrypt = require("bcryptjs");
const emailRegEx = RegExp(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

const changePassword = async (req, res) => {
  try {
    let { email, code, password } = req.body;
    if (
      email === "" ||
      code === "" ||
      password === "" ||
      email === undefined ||
      code === undefined ||
      password === undefined ||
      emailRegEx.test(email) === false ||
      Number.isNaN(Number(code))
    ) {
      return res.status(400).json({ message: "Bad request" });
    }

    let user = await User.findOne({ email: email });

    if (user === null) return res.status(400).json({ message: "Bad request" });

    if (user.forgotPasswordVerification.code == null)
      return res.status(400).json({
        message:
          "You've entered Wrong verification code or code has been expired",
      });

    let validTime = Date.now() - user.forgotPasswordVerification.validUpTo;

    if (
      validTime > ONEDAY ||
      Number(code).valueOf() != user.forgotPasswordVerification.code
    )
      return res.status(400).json({
        message:
          "You've entered Wrong verification code or code has been expired",
      });

    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password.toString().trim(), salt);

    await User.updateOne(
      { email: email },
      {
        $set: {
          password: hashedPassword,
          forgotPasswordVerification: VERIFICATIONCODE,
        },
      }
    );

    res.json("password changed successfully");
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { changePassword };
