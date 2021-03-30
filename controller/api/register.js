const jwt = require("jsonwebtoken");
const User = require("../../model/user");
const UserProfile = require("../../model/user_profile");
const bcrypt = require("bcryptjs");
const loginValidation = require("./validation/login");
const emailRegEx = RegExp(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
const sevenDays = 7 * 24 * 60 * 60 * 1000;
const generator = require("../../utility/codegenerator");
const sendMail = require("../../utility/email");
const { welcomeEmailBody } = require("../../utility/emailBodies");

module.exports = async (req, res) => {
  try {
    // let { email } = req.body;
    if (
      req.body.email === "" ||
      req.body.email === undefined ||
      emailRegEx.test(req.body.email) === false
    ) {
      return res.status(400).json({ message: "Bad request" });
    }

    const { error } = loginValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userExist = await User.findOne({
      email: req.body.email.trim(),
    });

    if (userExist !== null && userExist.isVerified === true) {
      return res
        .status(400)
        .json({ message: "user already exists, please create new account" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password.trim(), salt);

    let code = generator.generateCode();

    if (userExist !== null) {
      // user exists but account is not verified
      await User.findByIdAndUpdate(
        userExist._id,
        {
          $set: { emailVerification: code, password: hashedPassword },
        },
        { upsert: false, timestamps: true, useFindAndModify: false }
      );
    } else {
      // user is new user so store details in db
      const user = new User({
        email: req.body.email.trim(),
        password: hashedPassword,
        emailVerification: code,
      });
      await user.save();
    }
    let mailBody = {
      // text: `use verification code ${code.code} to activate your account \n if you've not requested verification you may safely ignore this email.`,
      html: welcomeEmailBody(code.code),
      subject: "Email Verification for your Lightbox Acccount"
    };

    await sendMail(mailBody, req.body.email);
    res.json({
      message: "account verification code has been sent to your mailbox",
    });
    /**
     * TODO:
     *      1.  we need to add some detail regarding password
     *          in token so whenever password change occur in
     *          one place all other account logged out
     *      2.  Also before sign in verify account with email verification code
     *      3.  after sign up send verification mail to user with code
     *
     *      4. also if user's email is there in list but not verified than send mail and let
     *          user go ahead
     *      5. use ISO time string while comparing time
     */

    // TODO: this part goes only after verification
    // const token = jwt.sign({ _id: savedUser._id }, process.env.SECRET);

    // const { _id, email, createdAt, updatedAt } = savedUser;

    // const userProfile = await UserProfile.findById(_id);
    // const isProfileCompleted = userProfile ? true : false;
    // const userJson = { _id, email, isProfileCompleted, createdAt, updatedAt };

    // TODO : send verification code cookie after user verifies his/her account with code
    // res
    //   .cookie("access-token", token, {
    //     maxAge: sevenDays,
    //     httpOnly: true,
    //     secure: false,
    //     path: "/",
    //     sameSite: "none",
    //   })
    //   .json(userJson);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
