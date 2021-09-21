const path = require('path');
const http = require('http'); //used by express for createServer
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")))

const botName = 'chatRoom Bot'

// Run when client connects, listens for the event 'connection'
io.on('connection', socket => {
    // on join room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
      
      socket.join(user.room);

    // sending event="(messages)" back and forth
    // socket. emits to just the user a welcome
    socket.emit("message", formatMessage(botName, "Welcome to chatRoom!"));

    // Broadcast when a user connects (to everyone in user.room)
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} has joined the chat`)
      );
      
    //   send users and room info
      io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
      })
  });

  // listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        
        io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // run when client disconnects
  socket.on("disconnect", () => {
    //all the clients (io.emit())
      
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat building`)
        );

        //   send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
  });
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));