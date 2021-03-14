const SessionUser = require("./utils/get/user");
const UserProfile = require("../../model/user_profile");

module.exports = async (req, res) => {
  try {
    let userId = req.query.uid;

    if (userId === undefined) {
      let user = await SessionUser(req, res);
      userId = user != null ? user._id : "";
    }
    const userProfile =
      userId != "" ? await UserProfile.findById(userId) : null;
    if (!userProfile)
      return res
        .status(404)
        .json({ message: "profile does not exists please complete profile" });

    const {
      uid,
      fname,
      lname,
      college,
      semester,
      skillset,
      title,
      branch,
      skill_rating,
      createdAt,
      updatedAt,
      thumbnail_pic,
      connections,
      requestsReceived,
      requestsMade,
      teams,
      groups,
    } = userProfile;

    const userProfileJson = {
      uid,
      thumbnail_pic,
      fname,
      lname,
      college,
      semester,
      skillset,
      title,
      skill_rating,
      branch,
      createdAt,
      updatedAt,
      connections,
      teams,
      groups,
      requestsMade,
      requestsReceived,
    };

    res.json(userProfileJson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};
