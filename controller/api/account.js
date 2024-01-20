require('dotenv').config()
const User = require('../../models/user')
const UserProfile = require('../../models/userProfile')
const jwt = require('jsonwebtoken')

const VERIFICATIOCODE = { code: null, validUpTo: null }
const sevenDays = 7 * 24 * 60 * 60 * 1000
const ONEDAY = 24 * 60 * 60 * 1000
const emailRegEx = RegExp(/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)

const verifyAccount = async (req, res) => {
  try {
    const { code } = req.body
    const emailId = req.body.email
    if (
      emailId === '' ||
      code === '' ||
      emailId === undefined ||
      code === undefined ||
      emailRegEx.test(emailId) === false ||
      Number.isNaN(Number(code).valueOf())
    ) {
      return res.status(400).json({ message: 'Bad request' })
    }
    let savedUser = await User.findOne({ email: emailId })

    if (savedUser === null || savedUser.isVerified == true) {
      return res.status(400).json({ message: 'Bad request' })
    }

    let validTime =
      savedUser.emailVerification.code != null
        ? Date.now() - savedUser.emailVerification.validUpTo
        : ONEDAY + 10

    if (
      validTime > ONEDAY ||
      Number(code).valueOf() != savedUser.emailVerification.code
    ) {
      return res.status(400).json({
        message:
          "You've entered Wrong verification code or code has been expired",
      })
    }

    await User.findByIdAndUpdate(
      savedUser._id,
      {
        $set: { emailVerification: VERIFICATIOCODE, isVerified: true },
      },
      { upsert: false, timestamps: true, useFindAndModify: false }
    )

    const token = jwt.sign({ _id: savedUser._id }, process.env.SECRET)
    const { _id, email, createdAt, updatedAt } = savedUser
    const userProfile = await UserProfile.findById(_id)
    const isProfileCompleted = userProfile ? true : false
    const userJson = { _id, email, isProfileCompleted, createdAt, updatedAt }
    // TODO : send verification code cookie after user verifies his/her account with code
    res
      .cookie('access-token', token, {
        maxAge: sevenDays,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'none',
      })
      .json(userJson)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

module.exports = { verifyAccount }
