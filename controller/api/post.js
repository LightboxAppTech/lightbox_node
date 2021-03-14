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
        .then((data) => res.json(data))
        .catch((e) => {
          console.error(e);
          return res.status(500).json({ message: "Something went wrong" });
        });
    } else {
      /**
       * TODO : ask for description and tags both during post update
       *
       */
      let p = await Post.findById(postId).lean(true);
      if (p.owner_id.toString() != user._id.toString())
        return res.status(403).end();

      const updatedPost = await Post.findOneAndUpdate(
        { $and: [{ _id: { $eq: postId } }, { owner_id: { $eq: user._id } }] },
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
      return res.json({ message: "updated" });
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
    const postData = await Post.findById(pid);

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
          message: `${user.fname} ${user.lname} commented on your post`,
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
          io.to(targetSocketId).emit("commentNotification", notificationObject);
        }

        if (err) {
          throw err;
        }
        return res.json({ message: "comment made", _id: commentObject._id });
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
    const postData = await Post.findById(pid);
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
            io.to(targetSocketId).emit(
              "upvoteNotification",
              notificationObject
            );
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

    Post.findById(pid)
      .lean(true)
      .then(async (data) => {
        let user = data ? await UserProfile.findById(data.owner_id) : {};
        data = {
          ...data,
          fname: user.fname,
          lname: user.lname,
          semester: user.semester,
          title: user.title,
        };
        data.thumbnail_pic = user.thumbnail_pic == "" ? "" : user.thumbnail_pic;
        return res.json(data);
      })
      .catch((e) => {
        console.error(e);
        res.status(500).json({ message: "Something Went Wrong" });
      });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
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

    let myPosts = await Post.find({ owner_id: user._id })
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

    let postComments = await Post.findById(pid, { comments: 1, _id: 1 });
    if (postComments != null) {
      postComments.comments = postComments.comments.reverse();
    }
    res.json(postComments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something Went Wrong" });
  }
};

module.exports = {
  addOrUpdatePost: addOrUpdatePost,
  addComment: comment,
  voteThePost: voteThePost,
  getSinglePost: getPostDetail,
  getMyAllPost: getMyAllPost,
  getComments: getComments,
};
