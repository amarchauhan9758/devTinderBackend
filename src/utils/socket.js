const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};
const initalzaiedSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joined", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ userId, targetUserId, text, firstName }) => {
      const roomId = getSecretRoomId(userId, targetUserId);

      io.to(roomId).emit("messageRecived", { text, userId, firstName });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initalzaiedSocket;
