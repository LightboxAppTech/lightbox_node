const mongoose = require("mongoose");
const types = mongoose.Schema.Types;

// const commentBody = {
//     comment_text: req.body.comment_text,
//     commentor_name: `${user.fname} ${user.lname}`,
//     commentor_pic: user.thumbnail_pic == undefined ? "" : user.thumbnail_pic,
//     comment_date: new Date().toISOString(),
//     commentor: user._id.toString(),
//   };

const comment = new mongoose.Schema({
  comment_text: {
    type: types.String,
    required: true,
  },
  commentor_name: {
    type: types.String,
    required: true,
  },
  commentor: {
    type: types.ObjectId,
    required: true,
  },
  comment_date: {
    type: types.String,
    required: true,
  },
  thumbnail_pic: {
    type: types.String,
  },
});

module.exports = mongoose.model("comments", comment);
