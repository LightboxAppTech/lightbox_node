const project = require('../models/project')
const getUser = require('../controller/api/utils/get/getUid')
const Room = require('../models/room')

const _socketConnection = new Map()
const _refToId = new Map()
let projectRooms = {}

const addConnection = (id, socketId) => {
  if (typeof id !== 'string' || typeof socketId !== 'string') {
    throw new Error('Invalid DataType')
  }
  _socketConnection.set(id, socketId)
  _refToId.set(socketId, id)
}

const getConnection = (id) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid DataType')
  }
  return _socketConnection.get(id)
}

const removeConnection = (socketID) => {
  const uid = _refToId.get(socketID)
  _socketConnection.delete(uid)
  _refToId.delete(socketID)
}

const initSocket = (io) => {
  try {
    io.on('connection', (socket) => {
      socket.on('auth', (data) => {
        let uid = data.uid
        if (uid === undefined || uid === '') {
          socket.disconnect()
          return
        }
        addConnection(uid, socket.id)
      })

      socket.on('joinRoom', (data) => {
        const uid = data.uid
        const roomIds = data.projectRooms
        roomIds.forEach((id) => {
          if (!projectRooms.hasOwnProperty(id)) {
            projectRooms[id] = new Set()
          }
          projectRooms[id].add(socket.id)
        })
      })

      socket.on('sendMessage', async (data) => {
        try {
          const { pid, msg, uid, user_name } = data
          const room = projectRooms[pid]

          for (const member of room.values()) {
            if (member === _socketConnection.get(uid)) continue

            io.to(member).emit('recieveMessage', {
              room: pid,
              message: msg,
              user_id: uid,
              name: user_name,
              timestamps: new Date().toISOString(),
            })
          }
          const updateRoom = await Room.updateOne(
            { project_id: pid },
            {
              $push: {
                messages: {
                  // _id: new ObjectId(),
                  name: user_name,
                  user_id: uid,
                  message: msg,
                  timestamps: new Date().toISOString(),
                },
              },
            }
          )
        } catch (error) {
          console.log(error)
        }
      })

      socket.on('disconnect', async () => {
        const projectIds = []
        const uid = _refToId.get(socket.id)
        const projects = await project
          .find({
            $or: [
              { project_leader: { $eq: uid } },
              { project_members: { $elemMatch: { $eq: uid } } },
            ],
            is_deleted: false,
            is_completed: false,
          })
          .sort({ createdAt: -1 })
          .lean(true)

        projects.forEach((p) => {
          projectIds.push(p._id)
        })

        projectIds.forEach((id) => {
          if (projectRooms.hasOwnProperty(id)) {
            projectRooms[id].delete(socket.id)
          }
        })

        removeConnection(socket.id)
        socket.disconnect()
      })
    })
  } catch (e) {
    console.error(e)
    //throw e;
  }
}

module.exports = {
  getSocket: getConnection,
  initSocket: initSocket,
}
