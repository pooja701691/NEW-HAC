

const app = require('./src/app');
const connectDB = require('./src/config/db');
const http = require('http');
const socketIo = require('socket.io');

connectDB();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle leaderboard updates
  socket.on('update-leaderboard', (data) => {
    // Broadcast to all clients
    io.emit('leaderboard-updated', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});