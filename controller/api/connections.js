const UserProfile = require('../../models/userProfile')
const User = require('../../models/user')
const { getSocket } = require('../../helper/socket')
const sessionUser = require('./utils/get/user')
const { Notification } = require('../../models/notification')
// const storeNotification = require("../../utility/notification");

const suggestion = async (req, res) => {
  try {
    const suggestedConnections = []
    const user = await sessionUser(req, res)
    const userProfile = await UserProfile.findById(user._id)
    let data = await UserProfile.find({
      $and: [
        {
          uid: {
            $nin: userProfile.connections,
          },
        },
        {
          uid: {
            $nin: userProfile.requestsMade,
          },
        },
        {
          uid: {
            $nin: userProfile.requestsReceived,
          },
        },
        {
          uid: { $ne: user._id },
        },
        // { branch: { $eq: userProfile.branch } },
      ],
    })

    let flags = {}
    let uniqueData = data.filter(function (d) {
      if (flags[d.uid]) {
        return false
      }
      flags[d.uid] = true
      return true
    })

    uniqueData.forEach((profile) => {
      let { thumbnail_pic, uid, title, branch, semester, fname, lname } =
        profile
      suggestedConnections.push({
        thumbnail_pic,
        uid,
        title,
        branch,
        semester,
        fname,
        lname,
      })
    })

    data = await UserProfile.find({
      $and: [
        { branch: { $ne: userProfile.branch } },
        {
          uid: {
            $nin: userProfile.connections,
          },
        },
        {
          uid: {
            $nin: userProfile.requestsMade,
          },
        },
        {
          uid: {
            $nin: userProfile.requestsReceived,
          },
        },
        { skillset: { $in: userProfile.skillset } },
      ],
    })

    data.forEach((profile) => {
      let { thumbnail_pic, uid, title, branch, semester, fname, lname } =
        profile
      suggestedConnections.push({
        thumbnail_pic,
        uid,
        title,
        branch,
        semester,
        fname,
        lname,
      })
    })
    flags = {}
    uniqueData = suggestedConnections.filter(function (d) {
      if (flags[d.uid]) {
        return false
      }
      flags[d.uid] = true
      return true
    })
    res.json(uniqueData)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const acceptRequest = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const uidOfRequester = req.body.uid // it is the user id, whose requeste you're accepting

    if (uidOfRequester == user._id || uidOfRequester === undefined) {
      return res.status(400).json({ message: 'Bad Request' })
    }

    const targetUser = await UserProfile.findById(uidOfRequester)
    if (targetUser === null)
      return res.status(400).json({ message: 'Bad Request' })

    if (
      user.connections.indexOf(uidOfRequester) > -1 ||
      user.requestsReceived.indexOf(uidOfRequester) < 0 ||
      user.requestsMade.indexOf(uidOfRequester) > -1
    ) {
      return res.status(400).json({ message: 'Bad Request' })
    }
    // two things to be done
    //first.... remove uidOfRequester from user and add that guy in connections
    //second.... from user who has requested remove

    UserProfile.updateOne(
      { _id: user._id },
      {
        $push: { connections: uidOfRequester },
        $pull: { requestsReceived: uidOfRequester },
      },
      (err, data) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Something went Wrong' })
        }
        UserProfile.updateOne(
          { _id: uidOfRequester },
          {
            $push: { connections: user._id },
            $pull: { requestsMade: user._id },
          },
          async (err, data) => {
            let targetSocket = getSocket(uidOfRequester)
            let io = req.app.get('io')

            let notificationObject = new Notification({
              thumbnail_pic: user.thumbnail_pic,
              message: `${user.fname} ${user.lname} is added to your connections`,
              url: `/connections/${user._id}`,
              is_unread: true,
              receiver: uidOfRequester,
            })
            await notificationObject.save({ timestamps: true })

            if (targetSocket !== undefined) {
              io.to(targetSocket).emit('connectionAcceptedNotification', {
                notificationObject,
                data: {
                  fname: user.fname,
                  lname: user.lname,
                  thumbnail_pic:
                    user.thumbnail_pic === undefined ? '' : user.thumbnail_pic,
                  uid: user.uid,
                  title: user.title,
                  branch: user.branch,
                  semester: user.semester,
                },
              })
            }

            if (err) {
              console.error(err)
              return res.status(500).json({ message: 'Something went Wrong' })
            }
            res.json({ message: 'connection added' })
          }
        )
      }
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went Wrong' })
  }
}

const rejectRequest = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const uidOfRequester = req.body.uid
    if (uidOfRequester == user._id || uidOfRequester === undefined) {
      return res.status(400).json({ message: 'Bad Request' })
    }
    const targetUser = await UserProfile.findById(uidOfRequester)
    // if (uidOfRequester === undefined) throw new Error("User's Id missing");
    if (targetUser === null)
      return res.status(400).json({ message: 'Bad Request' })

    UserProfile.updateOne(
      { _id: user._id },
      {
        $pull: { requestsReceived: uidOfRequester },
      },
      (err, data) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Something went Wrong' })
        }
        UserProfile.updateOne(
          { _id: uidOfRequester },
          {
            $pull: { requestsMade: user._id },
          },
          (err, data) => {
            if (err) {
              console.error(err)
              return res.status(500).json({ message: 'Something went Wrong' })
            }
            res.json({ message: 'Rejected Connection' })
          }
        )
      }
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went Wrong' })
  }
}

const cancelRequestMade = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const targetId = req.body.uid //  this is the id of guy to whom you will make a request
    if (targetId === undefined) throw new Error('Missing UID Value')
    const targetUser = await UserProfile.findById(targetId)
    if (targetUser === null || targetUser._id == user._id)
      return res.status(400).json({ message: 'Bad Request' })

    UserProfile.updateOne(
      {
        _id: user._id,
      },
      {
        $pull: { requestsMade: targetId },
      },
      (err, data) => {
        if (err) throw err
        UserProfile.updateOne(
          { _id: targetId },
          {
            $pull: { requestsReceived: user._id },
          },
          (err, data) => {
            if (err) throw err
            res.json({ message: 'request cancelled' })
          }
        )
      }
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

const makeRequest = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const targetId = req.body.uid //  this is the id of guy to whom you will make a request
    if (targetId === undefined) throw new Error('Missing UID Value')
    if (targetId == user._id) {
      return res.status(400).json({ message: 'Bad Request' })
    }
    const targetUser = await UserProfile.findById(targetId)
    if (targetUser === null)
      return res.status(400).json({ message: 'Bad Request' })

    // const userProfile = await UserProfile.findById(user._id);

    if (
      user.connections.indexOf(targetId) > -1 ||
      user.requestsReceived.indexOf(targetId) > -1 ||
      user.requestsMade.indexOf(targetId) > -1
    ) {
      return res.json({ message: "You've Already Made or Received Request" })
    }

    UserProfile.updateOne(
      { _id: user._id },
      {
        $push: { requestsMade: targetId },
      },
      (err, data) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Something Went Wrong' })
        }
        UserProfile.updateOne(
          { _id: targetId },
          {
            $push: { requestsReceived: user._id },
          },
          async (err, data) => {
            let targetSocket = getSocket(targetId)
            let io = req.app.get('io')

            let notificationObject = new Notification({
              thumbnail_pic: user.thumbnail_pic,
              message: `${user.fname} ${user.lname} made connection request`,
              url: `/connections/${user._id}`,
              is_unread: true,
              receiver: targetId,
            })

            await notificationObject.save({ timestamps: true })
            // await storeNotification(targetId, notificationObject);

            if (targetSocket !== undefined) {
              io.to(targetSocket).emit('connectionRequestNotification', {
                notificationObject,
                data: {
                  fname: user.fname,
                  lname: user.lname,
                  thumbnail_pic:
                    user.thumbnail_pic === undefined ? '' : user.thumbnail_pic,
                  uid: user.uid,
                  title: user.title,
                  branch: user.branch,
                  semester: user.semester,
                },
              })
            }

            if (err) {
              console.error(err)
              return res.status(500).json({ message: 'Something Went Wrong' })
            }
            return res.json({ message: 'Request made successfully' })
          }
        )
      }
    )
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

const removeConnection = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const targetUserId = req.body.uid
    if (targetUserId == user._id) {
      return res.status(400).json({ message: 'Bad Request' })
    }
    const targetUser = await UserProfile.findById(targetUserId)

    if (targetUserId === undefined || targetUser === null) {
      return res.status(400).json({ message: 'Bad Request' })
    }

    UserProfile.updateOne(
      { _id: user._id },
      {
        $pull: { connections: targetUserId },
      },
      (err, data) => {
        if (err) throw new Error(err)
        UserProfile.updateOne(
          { _id: targetUserId },
          { $pull: { connections: user._id } },
          (err, data) => {
            if (err) throw new Error(err)
            res.json({ message: 'Connection Removed' })
          }
        )
      }
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something Went Wrong' })
  }
}

const pendingRequest = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    if (user === null) return res.status(400).json({ message: 'Bad Request' })

    const { requestsReceived } = await UserProfile.findById(user._id)
    // console.log("Total requests: ", requestsReceived);
    const pendingRequestData = []
    if (requestsReceived.length === 0) return res.json(pendingRequestData)

    requestsReceived.forEach(async (id) => {
      try {
        let user = await UserProfile.findById(id)
        if (!user) {
          console.log('User already deleted man !')
          return res.send([])
        }
        let { thumbnail_pic, uid, title, branch, semester, fname, lname } = user

        pendingRequestData.push({
          thumbnail_pic,
          uid,
          title,
          branch,
          semester,
          fname,
          lname,
        })
        if (pendingRequestData.length === requestsReceived.length) {
          res.json(pendingRequestData)
        }
      } catch (e) {
        console.log('Error Occured : ', e)
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something Went Wrong' })
  }
}

const myRequests = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const { requestsMade } = await UserProfile.findById(user._id)
    const requestData = []
    if (requestsMade.length === 0) return res.json(requestData)
    requestsMade.forEach(async (id) => {
      let { thumbnail_pic, uid, title, branch, semester, fname, lname } =
        id != user._id ? await UserProfile.findById(id) : user

      requestData.push({
        thumbnail_pic,
        uid,
        title,
        branch,
        semester,
        fname,
        lname,
      })
      if (requestData.length === requestsMade.length) {
        res.json(requestData)
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something Went Wrong' })
  }
}

const myConnections = async (req, res) => {
  try {
    const user = await sessionUser(req, res)
    const { connections } = await UserProfile.findById(user._id)
    const connectionData = []
    if (connections.length === 0) return res.json(connectionData)
    connections.forEach(async (id) => {
      let { thumbnail_pic, uid, title, branch, semester, fname, lname } =
        await UserProfile.findById(id)

      var user = await User.findById(id).lean(true)

      connectionData.push({
        thumbnail_pic,
        uid,
        title,
        email: user.email,
        branch,
        semester,
        fname,
        lname,
      })
      if (connectionData.length === connections.length) {
        res.json(connectionData)
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Something Went Wrong' })
  }
}

module.exports = {
  suggestion: suggestion,
  makeRequest: makeRequest,
  acceptRequest: acceptRequest,
  rejectRequest: rejectRequest,
  removeConnection: removeConnection,
  cancelConnectionRequest: cancelRequestMade,
  pendingRequest: pendingRequest,
  myRequests: myRequests,
  myConnections: myConnections,
}
