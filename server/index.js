const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app
const app = express();

// Define allowed origins
const allowedOrigins = [
  "http://localhost:3000", // Local development URL
  "https://video-call-nine-delta.vercel.app" // Production URL
];

// Configure CORS for Express
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server with CORS settings
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"]
  }
});

// Maps to store socket information
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // Handle room joining
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    // Join the socket to the room and notify others
    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  // Handle user call event
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  // Handle call accepted event
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  // Handle peer negotiation needed event
  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  // Handle peer negotiation done event
  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

// Start the server on port 8000
server.listen(8000, () => {
  console.log('Server is running on port 8000');
});
