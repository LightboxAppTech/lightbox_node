const User = require("../../model/user");
const sendMail = require("../../utility/email");
const codeGenerator = require("../../utility/codegenerator");
const { forgotPasswordEmailBody } = require("../../utility/emailBodies");

const emailRegEx = RegExp(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);

const veriyfyEmail = async (req, res) => {
  try {
    const emailId = req.body.email
      ? req.body.email.toString().trim()
      : undefined;
    // const emailId = req.query.email
    //   ? req.query.email.toString().trim()
    //   : undefined;
    if (
      emailId === undefined ||
      emailId === "" ||
      emailRegEx.test(emailId) === false
    ) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const targetUser = await User.findOne({ email: emailId });

    if (targetUser === null) {
      return res
        .status(400)
        .json({ message: "No user found with this email!" });
    }

    /**
     * WORKFLOW :   if user found with claimed email address then send
     *              random verification code to claimed email address.
     *              also store that code in db with some time window to
     *              compare afterwards
     *
     *               if (verification code expires that time window ignore that code completely)
     *                  else if (match code and match succeeds let user enter the new password)
     *                      else (ask user for correct verification code)
     *
     */
    const code = codeGenerator.generateCode();

    await User.updateOne(
      { _id: targetUser._id },
      { $set: { forgotPasswordVerification: code } }
    );



    const mailBody = {
      subject: "Password Reset Request for your Lightbox Acccount",
      html: forgotPasswordEmailBody(code.code)
    };

    await sendMail(mailBody, targetUser.email);

    res.json({
      message: "verification code sent in your mailbox",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = veriyfyEmail;
