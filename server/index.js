const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  socket.on("meeting:join", (data) => {
    if (!data || !data.email || !data.meetingId) {
      console.error("Invalid data received on meeting:join event:", data);
      return; // Early exit if data is invalid
    }
    const { email, meetingId } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    io.to(meetingId).emit(`user:joined`, { email, id: socket.id });
    socket.join(meetingId);
    io.to(socket.id).emit("meeting:join", { email, meetingId });
    console.log(`${email} joined meeting ${meetingId}`);
  });
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });
  socket.on("peer:nego:done", ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, answer });
  });
});
