const sessionUser = require("./utils/get/user");
const Post = require("../../model/post");
const Project = require("../../model/project");
const UserProfile = require("../../model/user_profile");

const viewMyProfile = async (req, res, next) => {
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

        let myProjects = await Project.find({ project_leader: user._id, is_deleted: false })
            .lean(true)
            .sort({ createdAt: -1 });

        //if (myPosts.length == 0) {
        //	return res.json(myPosts);
        //}
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
            // if (i === myPosts.length - 1) return res.json(myPosts);
        }

        for (let i = 0; i < myProjects.length; i++) {
            myProjects[i] = {
                fname: user.fname,
                lname: user.lname,
                semester: user.semester,
                title: user.title,
                is_post: false,
                ...myProjects[i],
            };
            if (user.thumbnail_pic == "") myProjects[i].thumbnail_pic = "";
            else myProjects[i].thumbnail_pic = user.thumbnail_pic;
            //if (i === myProjects.length - 1) return res.json(myProjects);
        }

        res.json([ ...myPosts, ...myProjects ]);

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Something Went Wrong" });
    }
};



module.exports = viewMyProfile;