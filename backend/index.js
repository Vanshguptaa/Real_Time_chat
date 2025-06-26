const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());

let messages = [];
let onlineUsers = {};

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('login', username => {
    onlineUsers[socket.id] = username;
    io.emit('userList', Object.values(onlineUsers));
    socket.emit('chatHistory', messages);
  });

  socket.on('sendMessage', data => {
    messages.push(data);
    io.emit('receiveMessage', data);
  });

  socket.on('typing', username => {
    socket.broadcast.emit('userTyping', username);
  });

  socket.on('disconnect', () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit('userList', Object.values(onlineUsers));
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
