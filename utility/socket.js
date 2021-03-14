const getUser = require("../controller/api/utils/get/getUid");
const _socketConnection = new Map();
const _refToId = new Map();

function addConnection(id, socketId) {
  if (typeof id !== "string" || typeof socketId !== "string") {
    throw new Error("Invalid DataType");
  }
  _socketConnection.set(id, socketId);
  _refToId.set(socketId, id);
}

function getConnection(id) {
  if (typeof id !== "string") {
    throw new Error("Invalid DataType");
  }
  return _socketConnection.get(id);
}

function removeConnection(socketID) {
  const uid = _refToId.get(socketID);
  _socketConnection.delete(uid);
  _refToId.delete(socketID);
}

function initSocket(io) {
  try {
    io.on("connection", (socket) => {
      socket.on("auth", (data) => {
        let uid = data.uid;
        if (uid === undefined || uid === "") {
          socket.disconnect();
          return;
        }
        addConnection(uid, socket.id);
      });

      socket.on("disconnect", () => {
        removeConnection(socket.id);
        socket.disconnect();
      });
    });
  } catch (e) {
    console.error(e);
    //throw e;
  }
}

module.exports = {
  getSocket: getConnection,
  initSocket: initSocket,
};
