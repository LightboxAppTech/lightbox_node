const sessionUser = require("./utils/get/user");
const Post = require("../../model/post");
const UserProfile = require("../../model/user_profile");
const User = require("../../model/user_profile");

async function dashboard(req, res) {
  try {
    let page = req.query.page;
    let resultsPerPage = 6;
    let homeData = [];
    const user = await sessionUser(req, res);
    const connectionList = user.connections;
    const sameBranchUserWithoutConnections = await User.find(
      {
        $and: [
          { _id: { $nin: connectionList } },
          { _id: { $ne: user._id } },
          { branch: { $eq: user.branch } },
        ],
      },
      { _id: 1 }
    );

    let data = await Post.find({
      owner_id: { $in: connectionList },
    })
      .lean(true)
      .sort({ createdAt: -1 })
      .skip((resultsPerPage * page - resultsPerPage) / 3)
      .limit(resultsPerPage / 3);
    // .limit(3);

    data.forEach((post) => homeData.push(post));

    data = await Post.find({
      owner_id: { $in: sameBranchUserWithoutConnections },
    })
      .sort({ createdAt: -1 })
      // .limit(3)
      .skip((resultsPerPage * page - resultsPerPage) / 3)
      .limit(resultsPerPage / 3)
      .lean(true);
    data.forEach((post) => homeData.push(post));

    data = await Post.find({ owner_id: { $eq: user._id } })
      .sort({ createdAt: -1 })
      // .limit(3)
      .skip((resultsPerPage * page - resultsPerPage) / 3)
      .limit(resultsPerPage / 3)
      .lean(true);
    data.forEach((post) => homeData.push(post));

    if (homeData.length < 1) {
      return res.json(homeData);
    }

    for (let i = 0; i < homeData.length; i++) {
      let userData = await UserProfile.findById(homeData[i].owner_id).lean(
        true
      );
      homeData[i] = {
        fname: userData.fname,
        lname: userData.lname,
        semester: userData.semester,
        title: userData.title,
        ...homeData[i],
      };
      if (userData.thumbnail_pic == undefined) homeData[i].thumbnail_pic = "";
      else homeData[i].thumbnail_pic = userData.thumbnail_pic;

      if (i === homeData.length - 1) res.json(homeData);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
}

module.exports = { getDashboardData: dashboard };
