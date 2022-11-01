const SessionUser = require('./utils/get/get-user')
const createThumbnail = require('../../utility/thumbnail')
const { upload } = require('../../utility/awsuploads')
const UserProfile = require('../../model/user_profile')
const profileValidation = require('./validation/profile')

module.exports = async (req, res) => {
  try {
    const incomingData = {
      name: `${req.body.fname} ${req.body.lname}`,
      college: req.body.college,
      semester: req.body.semester,
      branch: req.body.branch,
      skillset: req.body.skillset,
      title: req.body.title,
    }

    const { error } = profileValidation.validate(incomingData)

    if (error)
      return res.status(400).json({ message: error.details[0].message })

    const user = await SessionUser(req)
    const userData = await UserProfile.findById(user._id)

    let newUser = new UserProfile({
      fname: `${req.body.fname}`,
      lname: `${req.body.lname}`,
      branch: `${req.body.branch}`,
      college: req.body.college,
      semester: req.body.semester,
      skillset: req.body.skillset,
      title: req.body.title,
      uid: user._id,
      thumbnail_pic: req.body.thumbnail_pic,
      connections: userData ? userData.connections : [],
      teams: userData ? userData.teams : [],
      groups: userData ? userData.groups : [],
      requestsMade: userData ? userData.requestsMade : [],
      requestsReceived: userData ? userData.requestsReceived : [],
    })

    let tmpUser = {
      thumbnail_pic: newUser.thumbnail_pic,
      skillset: newUser.skillset,
      skill_rating: newUser.skill_rating,
      connections: newUser.connections,
      teams: newUser.teams,
      groups: newUser.groups,
      requestsMade: newUser.requestsMade,
      requestsReceived: newUser.requestsReceived,
      fname: newUser.fname,
      lname: newUser.lname,
      branch: newUser.branch,
      college: newUser.college,
      semester: newUser.semester,
      title: newUser.title,
      uid: newUser.uid,
    }

    if (req.body.dp_changed === true) {
      let image = await createThumbnail(req.body.profile_pic[0])
      let images = []
      images.push(image)
      let profilePicUrl = await upload(images, true, user._id)
      tmpUser.thumbnail_pic = profilePicUrl[0]
    }

    UserProfile.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { ...tmpUser },
      },
      { upsert: true, new: true, timestamps: true, useFindAndModify: false },
      (error, userProfile) => {
        if (error) return res.status(500).json({ message: error })

        const {
          uid,
          fname,
          lname,
          thumbnail_pic,
          college,
          semester,
          skillset,
          title,
          branch,
          skill_rating,
          connections,
          teams,
          groups,
          requestsMade,
          requestsReceived,
          createdAt,
          updatedAt,
        } = userProfile
        const userProfileJson = {
          uid,
          fname,
          lname,
          thumbnail_pic,
          college,
          semester,
          branch,
          skillset,
          title,
          skill_rating,
          connections,
          teams,
          groups,
          requestsMade,
          requestsReceived,
          createdAt,
          updatedAt,
        }
        res.json(userProfileJson)
      }
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
}
