const Post = require("../../model/post");
const UserProfile = require("../../model/user_profile");
const { getSocket } = require("../../utility/socket");
const postValidation = require("./validation/post");
const sessionUser = require("./utils/get/user");
const { upload } = require("../../utility/awsuploads");
const { Notification } = require("../../model/notification");
const Comment = require("../../model/comment");

const addOrUpdatePost = async (req, res) => {
  try {
    const { error } = postValidation.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await sessionUser(req, res);

    // send post's id while you request for post edit
    // also send whole document and not the edited part

    const postId = req.body._id;

    if (postId === undefined && req.body.images !== undefined) {
      try {
        const urls = await upload(req.body.images);
        req.body.post_image = urls;
      } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Something went wrong" });
      }
    }

    if (postId === undefined) {
      const post = new Post({
        description: req.body.description,
        tags: req.body.tags,
        owner_id: user._id,
        post_image: req.body.post_image,
        upvotes: [],
        comments: [],
      });
      post
        .save({ timestamps: true })
        .then(async (data) => {
          const plead = await UserProfile.findById(post.owner_id).lean(true);
          res.status(201);
          const dataObj = data.toObject();
          return res.json({ ...plead, ...dataObj, is_post: true });
        }
        )
        .catch((e) => {
          console.error(e);
          return res.status(500).json({ message: "Something went wrong" });
        });
    } else {
      /**
       * TODO : ask for description and tags both during post update
       *
       */
      let p = await Post.findOne({ _id: postId, is_deleted: false }).lean(true);
      if (p.owner_id.toString() != user._id.toString())
        return res.status(403).end();

      // const updatedUrls = await upload(req.body.images);
      // req.body.post_image = updatedUrls;

      var updatedPost = await Post.findOneAndUpdate(
        {
          $and: [
            { _id: { $eq: postId } },
            { owner_id: { $eq: user._id } },
            { is_deleted: false },
          ],
        },
        {
          $set: {
            description: req.body.description,
            // owner_id: user._id,
            // post_image: req.body.post_image,
            tags: req.body.tags,
          },
        },
        { useFindAndModify: false, upsert: false, new: true, timestamps: true }
      );
      if (updatedPost) {
        const plead = await UserProfile.findById(updatedPost.owner_id).lean(
          true
        );
        updatedPost = updatedPost.toObject();
        return res.json({
          ...updatedPost,
          ...plead,
          _id: updatedPost._id,
          is_post: true
        });
      }
      return res.status(500).json({ message: "Error updating Post" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

const comment = async (req, res) => {
  try {
    const pid = req.body._id;
    const user = await sessionUser(req, res);
    const postData = await Post.findOne({ _id: pid, is_deleted: false });

    if (user == null || pid == undefined || postData == null) {
      return res.status(400).json({ message: "Bad Request" });
    }

    let commentObject = new Comment({
      comment_text: req.body.comment_text,
      commentor_name: `${user.fname} ${user.lname}`,
      commentor: user._id,
      comment_date: new Date().toISOString(),
      thumbnail_pic: user.thumbnail_pic,
    });

    // commentObject.thumbnail_pic = user.thumbnail_pic;
    // commentObject.commentor_pic =
    // user.thumbnail_pic == undefined ? "" : user.thumbnail_pic;

    Post.updateOne(
      { _id: pid },
      {
        $push: {
          comments: commentObject,
        },
      },
      async (err, data) => {
        // notify post owner
        let targetSocketId = getSocket(postData.owner_id.toString());

        let notificationObject = new Notification({
          thumbnail_pic: user.thumbnail_pic == "" ? "" : user.thumbnail_pic,
          message: `${user.fname} ${user.lname} commented on your Post`,
          is_unread: true,
          url: `/posts/${pid}`,
          receiver: postData.owner_id,
        });

        if (postData.owner_id.toString() != user._id.toString())
          await notificationObject.save({ timestamps: true });
        // await storeNotification(postData.owner_id, notificationObject);

        if (
          targetSocketId !== undefined &&
          postData.owner_id.toString() !== user._id.toString()
        ) {
          notificationObject.uid = user._id;
          let io = req.app.get("io");
          io.to(targetSocketId).emit("commentNotification", {
            notificationObject,
            data: {
              fname: user.fname,
              lname: user.lname,
            },
          });
        }

        if (err) {
          throw err;
        }
        return res.json({ message: "comment made", _id: commentObject._id, is_post: true });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

const voteThePost = async (req, res) => {
  try {
    const flag = req.body.flag;
    const user = await sessionUser(req, res);
    const pid = req.body.pid;
    const postData = await Post.findOne({ _id: pid, is_deleted: false });
    if (
      flag === undefined ||
      pid === undefined ||
      postData === null ||
      (flag != true && flag != false && flag != "true" && flag != "false")
    ) {
      return res.status(400).end();
    }

    if (!flag) {
      Post.updateOne(
        { _id: pid },
        {
          $push: { upvotes: user._id },
        },
        async (err, data) => {
          let targetSocketId = getSocket(postData.owner_id.toString());

          let notificationObject =
            postData.owner_id.toString() != user._id.toString()
              ? new Notification({
                thumbnail_pic:
                  user.thumbnail_pic == "" ? "" : user.thumbnail_pic,
                message: `${user.fname} ${user.lname} upvoted your post`,
                is_unread: true,
                url: `/posts/${pid}`,
                receiver: postData.owner_id,
              })
              : undefined;

          if (postData.owner_id.toString() != user._id.toString())
            await notificationObject.save({ timestamps: true });
          // await storeNotification(postData.owner_id, notificationObject);

          if (
            targetSocketId !== undefined &&
            postData.owner_id.toString() !== user._id.toString()
          ) {
            // put notification in database's recent notification array

            notificationObject.uid = user._id;
            let io = req.app.get("io");
            io.to(targetSocketId).emit("upvoteNotification", {
              notificationObject,
              data: {
                fname: user.fname,
                lname: user.lname,
              },
            });
          }

          if (err) {
            throw err;
          }
          return res.json({ message: "Upvoted" });
        }
      );
    } else {
      Post.updateOne(
        { _id: pid },
        {
          $pull: { upvotes: user._id },
        },
        (err, data) => {
          if (err) {
            throw err;
          }
          return res.json({ message: "Downvoted" });
        }
      );
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

const getPostDetail = async (req, res) => {
  try {
    const pid = req.query.pid;
    if (!pid) return res.status(400).json({ message: "Post id Required" });

    Post.findOne({ _id: pid, is_deleted: false })
      .lean(true)
      .then(async (data) => {
        let user = data ? await UserProfile.findById(data.owner_id) : {};
        data = {
          ...data,
          fname: user.fname,
          lname: user.lname,
          semester: user.semester,
          title: user.title,
          is_post: true
        };
        data.thumbnail_pic = user.thumbnail_pic == "" ? "" : user.thumbnail_pic;
        if (data.is_deleted !== undefined) return res.json(data);
        else return res.json({ is_deleted: true });
      })
      .catch((e) => {
        console.error(e);
        return res.status(500).json({ message: "Something Went Wrong" });
      });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

const getMyAllPost = async (req, res) => {
  try {
    let user;
    if (req.query.uid != undefined) {
      user = await UserProfile.findById(req.query.uid);
    } else {
      user = await sessionUser(req, res);
    }

    let myPosts = await Post.find({ owner_id: user._id, is_deleted: false })
      .lean(true)
      .sort({ createdAt: -1 });
    if (myPosts.length == 0) {
      return res.json(myPosts);
    }
    for (let i = 0; i < myPosts.length; i++) {
      myPosts[i] = {
        fname: user.fname,
        lname: user.lname,
        semester: user.semester,
        title: user.title,
        is_post: true,
        ...myPosts[i],
      };
      if (user.thumbnail_pic == "") myPosts[i].thumbnail_pic = "";
      else myPosts[i].thumbnail_pic = user.thumbnail_pic;
      if (i === myPosts.length - 1) return res.json(myPosts);
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

const getComments = async (req, res) => {
  try {
    // const user = await sessionUser(req, res);
    const pid = req.query.pid;
    if (pid == undefined)
      return res.status(400).json({ message: "Bad Request" });

    let postComments = await Post.findOne(
      { _id: pid, is_deleted: false },
      { comments: 1, _id: 1 }
    );
    if (postComments != null) {
      postComments.comments = postComments.comments.reverse();
    }
    res.json(postComments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

const deletePost = async (req, res) => {
  // notify all user currently working on team
  try {
    const pid = req.body._id;
    if (!pid) {
      return res.status(400).json({ message: "Post Id Required" });
    }
    const user = await sessionUser(req, res);
    const post = await Post.findOne({ _id: pid, is_deleted: false });
    if (user._id.toString() !== post.owner_id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    post.is_deleted = true;

    post
      .save({ timestamps: true })
      .then((data) => {
        return res.json({ message: "Post Deleted Successfully" });
      })
      .catch((e) => {
        console.error(e);
        return res.status(500).json({ message: "Something Went Wrong" });
      });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = {
  addOrUpdatePost: addOrUpdatePost,
  addComment: comment,
  voteThePost: voteThePost,
  getSinglePost: getPostDetail,
  getMyAllPost: getMyAllPost,
  getComments: getComments,
  deletePost: deletePost,
};
