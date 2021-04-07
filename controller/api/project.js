const projectValidation = require("../../controller/api/validation/project");
const sessionUser = require("../api/utils/get/user");
const Project = require("../../model/project");
const { getSocket } = require("../../utility/socket");
const { Notification } = require("../../model/notification");
const User = require("../../model/user");
const UserProfile = require("../../model/user_profile");
const project = require("../../model/project");
const Room = require("./../../model/room");
const Comment = require("../../model/comment");
// const storeNotification = require("../../utility/notification");

module.exports = {
  addOrupdateProject: async (req, res) => {
    try {
      const { error } = projectValidation.validate(req.body);
      if (error) return res.status(400).json(error.details[0].message);

      const user = await sessionUser(req, res);
      var pid = req.body._id;

      if (pid !== undefined) {
        const updatedProject = await Project.findOneAndUpdate(
          {
            $and: [
              { _id: { $eq: pid } },
              { project_leader: { $eq: user._id } },
            ],
            is_deleted: false,
            is_completed: false,
          },
          {
            $set: {
              project_leader: user._id,
              project_title: req.body.project_title,
              project_domain: req.body.project_domain,
              project_requirement: req.body.project_requirement,
              project_description: req.body.project_description,
              requirement_description: req.body.requirement_description,
              project_members:
                req.body.project_members === undefined
                  ? []
                  : req.body.project_members,
              teamExists: req.body.project_members > 0 ? true : false,
            },
          },
          {
            upsert: false,
            new: true,
            useFindAndModify: false,
            timestamps: true,
          }
        ).lean(true);
        if (updatedProject) {
          const plead = await UserProfile.findById(
            updatedProject.project_leader
          ).lean(true);
          return res.json({
            ...updatedProject,
            ...plead,
            _id: updatedProject._id,
          });
        } else {
          return res.status(500).json({ message: "Error updating Project" });
        }
      } else {
        const project = new Project({
          project_leader: user._id,
          project_title: req.body.project_title,
          project_domain: req.body.project_domain,
          project_requirement: req.body.project_requirement,
          project_description: req.body.project_description,
          requirement_description: req.body.requirement_description,
          project_members:
            req.body.project_members === undefined
              ? []
              : req.body.project_members,
          project_requests:
            req.body.project_requests === undefined
              ? []
              : req.body.project_requests,
          teamExists: req.body.project_members.length !== 0,
          is_deleted: false,
          is_completed: false,
        });
        project
          .save({ timestamps: true })
          .then(async (data) => {
            const plead = await UserProfile.findById(
              project.project_leader
            ).lean(true);
            data = data.toObject();
            const newRoom = new Room({
              room_name: project.project_title,
              project_id: project._id,
              messages: [],
            });
            await newRoom.save({ timestamps: true });
            // console.log(data.toJSON);
            return res.json({ ...plead, ...data });
          })
          .catch((e) => {
            console.error(e);
            return res.status(500).json({ message: "Something went wrong" });
          });

        // SAMPLE SOCKET IO CHAT --- START
        const roomId = project._id;
        // SAMPLE SOCKET IO CHAT --- END
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something went wrong" });
    }
  },
  requestToJoin: async (req, res) => {
    try {
      const pid = req.body.pid; //id of the project which is being requested
      const user = await sessionUser(req, res); // id of the requester
      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
        is_completed: false,
      });
      const flag = req.body.flag;

      if (!pid || project === null)
        return res.status(400).json({ message: "Bad request" });
      // console.log(project.project_leader);
      // console.log(user._id);
      // console.log(project.project_leader == user._id);
      // console.log(project.project_leader.toString() === user._id.toString());
      if (project.project_leader.toString() == user._id.toString())
        return res.json({ requested: false });
      if (project.is_completed)
        return res.json({ message: "Project is completed" });

      // console.log(project.project_requests);
      // const requestExists = project.project_requests.filter((requestId) => {
      //   return requestId === user._id;
      // });
      // console.log(requestExists);

      if (flag === true) {
        await Project.updateOne(
          { _id: pid, is_deleted: false, is_completed: false },
          { $pull: { project_requests: user._id } }
          // (err, data) => {
          //   return res.end();
          // }
        );
        return res.json({ requested: false });
      }

      let alreadyInList = project.project_requests.indexOf(user._id);
      let alreadyMember = project.project_members.indexOf(user._id);
      if (alreadyInList >= 0 || alreadyMember >= 0)
        return res.status(400).end();

      Project.updateOne(
        { _id: pid, is_deleted: false, is_completed: false },
        {
          $push: { project_requests: user._id },
        },
        // { _id: pid },
        async (err, data) => {
          let targetSocket = getSocket(project.project_leader.toString());
          let io = req.app.get("io");

          let notificationObject = new Notification({
            thumbnail_pic: user.thumbnail_pic,
            message: `${user.fname} ${user.lname} requested to join Project : ${project.project_title}`,
            url: `/projects/${pid}`,
            is_unread: true,
            receiver: project.project_leader,
          });
          await notificationObject.save({ timestamps: true });
          // await storeNotification(project.project_leader, notificationObject);

          if (targetSocket !== undefined) {
            // put notification in database recent notification array
            io.to(targetSocket).emit("projectJoinRequestNotification", {
              notificationObject,
              data: {
                fname: user.fname,
                lname: user.lname,
                thumbnail_pic:
                  user.thumbnail_pic === undefined ? "" : user.thumbnail_pic,
                uid: user.uid,
                title: user.title,
                branch: user.branch,
                semester: user.semester,
                count: project.project_members.length,
                project_title: project.project_title,
              },
            });
          }
          if (err) throw err;
          return res.json({ message: "Request Sent", requested: true });
        }
      );
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something went wrong" });
    }
  },
  projectRequests: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      if (!user) return res.status(400).end();
      const projects = await Project.find({
        project_leader: user._id,
        is_deleted: false,
        is_completed: false,
      });
      const requesters = [];

      if (projects.length == 0) return res.json(requesters);

      for (let i = 0; i < projects.length; i++) {
        for (let j = 0; j < projects[i].project_requests.length; j++) {
          let {
            fname,
            lname,
            _id,
            semester,
            title,
            thumbnail_pic,
          } = await UserProfile.findById(projects[i].project_requests[j]).lean(
            true
          );

          requesters.push({
            title,
            fname,
            lname,
            _id,
            rid: _id + projects[i]._id,
            semester,
            thumbnail_pic: thumbnail_pic == undefined ? "" : thumbnail_pic,
            project_id: projects[i]._id,
            project_title: projects[i].project_title,
            count: projects[i].project_members.length,
          });
        }
        if (i == projects.length - 1) return res.json(requesters);
      }
      /**
       * user
       *
       */
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    }
  },
  acceptUser: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      const pid = req.body._id; // id of the project
      const uid = req.body.uid; // id of the requester
      const requester = await User.findById(uid);
      if (!uid || !requester)
        return res.status(400).json({ message: "bad request" });

      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
        is_completed: false,
      });
      if (!project)
        return res
          .status(400)
          .json({ message: "bad request. no such project exists" });
      if (project.project_leader.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "bad request...forbidden" });
      }

      Project.updateOne(
        { _id: pid, is_deleted: false, is_completed: false },
        {
          $pull: { project_requests: requester._id },
          $push: { project_members: requester._id },
          $set: { teamExists: true },
        },
        async (err, data) => {
          let targetSocket = getSocket(requester._id.toString());
          let io = req.app.get("io");

          let notificationObject = new Notification({
            message: `You're now part of the Project: ${project.project_title}`,
            is_unread: true,
            url: `/projects/${pid}`,
            receiver: requester,
          });

          await notificationObject.save({ timestamps: true });
          // await storeNotification(requester, notificationObject);

          if (targetSocket !== undefined) {
            // put notification in database recent notification array
            io.to(targetSocket).emit("projectRequestAcceptedNotification", {
              notificationObject,
              data: {
                comments: project.comments,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                fname: user.fname,
                lname: user.lname,
                _id: project._id,
                semester: user.semester,
                teamExists: project.teamExists,
                thumbnail_pic: user.thumbnail_pic,
                project_title: project.project_title,
                project_leader: project.project_leader,
                project_domain: project.project_domain,
                project_requirement: project.project_requirement,
                project_description: project.project_description,
                requirement_description: project.requirement_description,
                project_members: project.project_members,
                project_requests: project.project_requests,
                is_completed: project.is_completed,
                is_deleted: project.is_deleted,
                is_post: false,
              },
            });
          }

          if (err) throw new Error(err);
          return res.json({ message: "New Member Added" });
        }
      );
    } catch (e) {
      console.error(e);
      return res.status(500).status({ message: "Something went wrong" });
    }
  },
  rejectUser: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      const pid = req.body._id; // id of the project
      const uid = req.body.uid; // id of the requester
      const requester = await User.findById(uid);
      if (!uid || !requester)
        return res.status(400).json({ message: "bad request" });

      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
        is_completed: false,
      });
      if (!project)
        return res
          .status(400)
          .json({ message: "bad request. no such project exists" });
      if (project.project_leader.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "bad request...forbidden" });
      }
      Project.updateOne(
        {
          _id: pid,
          is_deleted: false,
          is_completed: false,
        },
        {
          $pull: { project_requests: uid },
        },
        (err, data) => {
          if (err) throw new Error(err);
          return res.json({ message: "Request Rejected" });
        }
      );
    } catch (e) {
      console.error(e);
      return res.status(500).status({ message: "Something went wrong" });
    }
  },
  cancelProjectRequest: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      const pid = req.body._id;
      if (pid === undefined)
        return res.status(400).json({ message: "Project ID undefined" });
      const project = await Project.findOne({ _id: pid, is_deleted: false });
      if (!project)
        return res.status(400).json({ message: "No such project exists" });

      Project.updateOne(
        { _id: pid, is_deleted: false, is_completed: false },
        {
          $pull: { project_requests: user._id },
        },
        (err, data) => {
          if (err) throw new Error(err);
          return res.json({ message: "Request Cancelled" });
        }
      );
    } catch (e) {
      console.error(e);
      return res.status(500).status({ message: "Something went wrong" });
    }
  },
  // this route will provide all details about single project
  getProjectDetail: async (req, res) => {
    try {
      const pid = req.query.pid;
      if (!pid) {
        return res.status(404).json({ message: "Project Id Required" });
      }
      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
      }).lean(true);
      if (!project) return res.json({ is_deleted: true });
      const plead = await UserProfile.findById(project.project_leader).lean(
        true
      );
      return res.json({ ...project, ...plead, _id: project._id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  },

  fetchAllMyProject: async (req, res) => {
    try {
      const { _id } = await sessionUser(req, res);
      // let myId = _id;
      const projects = await Project.find({
        $or: [
          { project_leader: { $eq: _id } },
          { project_members: { $elemMatch: { $eq: _id } } },
        ],
        is_completed: false,
        is_deleted: false,
      })
        .sort({ createdAt: -1 })
        .lean(true);

      if (projects.length == 0) return res.json(projects);

      for (let i = 0; i < projects.length; i++) {
        let lead = await UserProfile.findById(projects[i].project_leader);
        // console.log(lead);
        projects[i].fname = lead.fname;
        projects[i].lname = lead.lname;
        projects[i].title = lead.title;
        projects[i].semester = lead.semester;

        projects[i].thumbnail_pic =
          lead.thumbnail_pic == undefined ? "" : lead.thumbnail_pic;

        if (i == projects.length - 1) return res.json(projects);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  deleteProject: async (req, res) => {
    // notify all user currently working on team
    try {
      const pid = req.body._id;
      if (!pid) {
        return res.status(400).json({ message: "Project Id Required" });
      }
      const user = await sessionUser(req, res);
      const project = await Project.findOne({ _id: pid, is_deleted: false });
      if (user._id.toString() !== project.project_leader.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      project.is_deleted = true;

      project
        .save({ timestamps: true })
        .then(async (data) => {
          const deletedRoom = await Room.findOneAndUpdate(
            { project_id: project._id },
            { $set: { is_active: false } }
          );
          return res.json({ message: "Project Deleted Successfully" });
        })
        .catch((e) => {
          console.error(e);
          return res.status(500).json({ message: "Something Went Wrong" });
        });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  completeProject: async (req, res) => {
    try {
      const pid = req.body._id;
      if (!pid) {
        return res.status(400).json({ message: "Project Id Required" });
      }
      const user = await sessionUser(req, res);
      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
        is_completed: false,
      });
      if (project.is_deleted)
        return res.status(400).json({ message: "No Such Project Exist" });
      if (user._id.toString() !== project.project_leader.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }

      project.is_completed = true;

      project
        .save({ timestamps: true })
        .then((data) => {
          return res.status(200).json({ message: "Project Completed Successfully" });
        })
        .catch((e) => {
          console.error(e);
          return res.status(500).json({ message: "Something Went Wrong" });
        });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  getAllProjects: async (req, res) => {
    try {
      let projectData = [];
      let page = req.query.page;
      let resultsPerPage = 8;

      const user = await sessionUser(req, res);
      const connectionList = user.connections;
      // console.log("connected users: ", connectionList);
      const sameBranchUserWithoutConnections = await UserProfile.find(
        {
          $and: [
            { _id: { $nin: connectionList } },
            { _id: { $ne: user._id } },
            { branch: { $eq: user.branch } },
          ],
        },
        { _id: 1 }
      );
      // console.log(
      //   "Same Branch user without connection : ",
      //   sameBranchUserWithoutConnections
      // );

      const crossBranchUserWithoutConnections = await UserProfile.find(
        {
          $and: [
            { _id: { $nin: connectionList } },
            { _id: { $ne: user._id } },
            { branch: { $ne: user.branch } },
          ],
        },
        { _id: 1 }
      );

      let data = await Project.find({
        project_leader: { $in: connectionList },
        is_deleted: false,
        is_completed: false,
      })
        .lean(true)
        .sort({ createdAt: -1 })
        .skip((resultsPerPage * page - resultsPerPage) / 4)
        .limit(resultsPerPage / 4)
        .lean(true);

      // console.log("projects of connections : ", data);

      data.forEach((project) => projectData.push(project));

      data = await Project.find({
        project_leader: { $in: sameBranchUserWithoutConnections },
        is_deleted: false,
        is_completed: false
      })
        .sort({ createdAt: -1 })
        .skip((resultsPerPage * page - resultsPerPage) / 4)
        .limit(resultsPerPage / 4)
        .lean(true);

      // console.log("projects of same branch without connection : ", data);

      data.forEach((project) => projectData.push(project));

      data = await Project.find({
        project_leader: { $eq: user._id },
        is_deleted: false,
        is_completed: false
      })
        .sort({ createdAt: -1 })
        .skip((resultsPerPage * page - resultsPerPage) / 4)
        .limit(resultsPerPage / 4)
        .lean(true);

      data.forEach((project) => projectData.push(project));

      data = await Project.find({
        project_leader: { $in: crossBranchUserWithoutConnections },
        is_deleted: false,
        is_completed: false
      })
        .sort({ createdAt: -1 })
        .skip((resultsPerPage * page - resultsPerPage) / 4)
        .limit(resultsPerPage / 4)
        .lean(true);

      // console.log("projects of same branch without connection : ", data);

      data.forEach((project) => projectData.push(project));


      if (projectData.length < 1) {
        return res.json(projectData);
      }

      for (let i = 0; i < projectData.length; i++) {
        let userData = await UserProfile.findById(
          projectData[i].project_leader
        ).lean(true);
        projectData[i] = {
          fname: userData.fname,
          lname: userData.lname,
          semester: userData.semester,
          title: userData.title,
          ...projectData[i],
        };

        if (userData.thumbnail_pic == undefined)
          projectData[i].thumbnail_pic = "";
        else projectData[i].thumbnail_pic = userData.thumbnail_pic;

        if (i === projectData.length - 1) res.json(projectData);
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  comment: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      const pid = req.body._id;
      if (!pid) return res.status(400).end();
      const project = await Project.findOne({ _id: pid, is_deleted: false });
      if (!project) return res.status(400).end();

      let commentObject = new Comment({
        comment_text: req.body.comment_text,
        commentor_name: `${user.fname} ${user.lname}`,
        commentor: user._id,
        comment_date: new Date().toISOString(),
        thumbnail_pic: user.thumbnail_pic,
      });

      Project.updateOne(
        { _id: pid, is_deleted: false },
        { $push: { comments: commentObject } },
        async (err, data) => {
          if (err) throw err;

          let targetSocket = getSocket(project.project_leader.toString());

          let notificationObject = new Notification({
            thumbnail_pic: user.thumbnail_pic == "" ? "" : user.thumbnail_pic,
            message: `${user.fname} ${user.lname} commented on your Project: ${project.project_title}`,
            is_unread: true,
            url: `/projects/${project._id}`,
            receiver: project.project_leader,
          });

          if (project.project_leader.toString() != user._id.toString()) {
            await notificationObject.save();
          }

          if (
            targetSocket !== undefined &&
            project.project_leader.toString() != user._id.toString()
          ) {
            // notificationObject.uid = user._id;
            let io = req.app.get("io");
            io.to(targetSocket).emit("projectCommentNotification", {
              notificationObject,
              data: {
                fname: user.fname,
                lname: user.lname,
                project_title: project.project_title,
              },
            });
          }
          return res.json({ message: "comment made", _id: commentObject._id });
        }
      );
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  },
  fetchComments: async (req, res) => {
    try {
      const pid = req.query.pid;
      if (!pid) return res.status(400).end();
      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
      }).lean(true);
      if (!project) return res.status(400).end();
      return res.json({ comments: project.comments.reverse() });
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  },
  getProjectMembers: async (req, res) => {
    try {
      const pid = req.query.pid;
      if (!pid) return res.status(400).end();
      const project = await Project.findOne({
        _id: pid,
        is_deleted: false,
      }).lean(true);
      if (!project) return res.status(400).end();
      const members = [];
      if (project.project_members.length == 0) return res.json([]);
      for (let i = 0; i < project.project_members.length; i++) {
        let userData = await UserProfile.findById(
          project.project_members[i]
        ).lean(true);
        let userEmailData = await User.findById(
          project.project_members[i]
        ).lean(true);
        members.push({
          _id: userData._id,
          fname: userData.fname,
          lname: userData.lname,
          email: userEmailData.email,
          semester: userData.semester,
          title: userData.title,
          thumbnail_pic:
            userData.thumbnail_pic == undefined ? "" : userData.thumbnail_pic,
        });
        if (i == project.project_members.length - 1) return res.json(members);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  },
  getMessages: async (req, res) => {
    try {
      const { pid } = req.body;
      if (pid === "" || pid === undefined) {
        res.status(400);
        return res.json("Bad Request");
      } else {
        const currentRoom = await Room.findOne({
          project_id: pid,
        }).lean(true);
        if (currentRoom.messages.length === 0) {
          res.status(200);
          return res.json([]);
        } else {
          res.status(200);
          return res.json({ msgs: currentRoom.messages });
        }
      }
    } catch (error) {
      console.log("Error: ", error);
      return res.status(400).json("Error getting messages");
    }
  },
  getAllChatMessages: async (req, res) => {
    try {
      const user = await sessionUser(req, res);
      if (!user) {
        res.status(400);
        return res.json("Unauthorized");
      } else {

        const projects = await project.find({
          $or: [
            { project_leader: { $eq: user._id } },
            { project_members: { $elemMatch: { $eq: user._id } } },
          ],
          is_deleted: false,
          is_completed: false
        })
          // .sort({ createdAt: -1 })
          .lean(true);

        let rooms = [];
        var allMessages = {};

        for (let i = 0; i < projects.length; i++) {
          const roomData = await Room.findOne({ project_id: projects[i]._id }).lean(true);
          rooms.push(roomData);
        }

        for (let i = 0; i < rooms.length; i++) {
          allMessages[rooms[i].project_id] = rooms[i].messages;
        }
        res.json(allMessages);
      }
    } catch (error) {
      console.log("Error: ", error);
      return res.status(400).json("Error getting messages");
    }
  },
};