const { Server } = require("socket.io");

const allowedOrigins = [
  "http://localhost:3000",           // Local development
  "https://video-call-nine-delta.vercel.app" // Production
];

const io = new Server(8000, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  // Handle room joining
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  // Handle user calling another user
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  // Handle call acceptance
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  // Handle peer negotiation needed
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("Peer negotiation needed:", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  // Handle peer negotiation completion
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("Peer negotiation done:", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Clean up on disconnection
  socket.on("disconnect", () => {
    const email = socketidToEmailMap.get(socket.id);
    if (email) {
      emailToSocketIdMap.delete(email);
      socketidToEmailMap.delete(socket.id);
    }
    console.log("Socket Disconnected:", socket.id);
  });
});
