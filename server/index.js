const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//X for nameX
let x = 1;
//List of all users
let users = [];
//List of all rooms
let rooms = ["default"];

io.on('connection', (socket) => { // When a user connects
    let currentRoom = "default";
    let name = "user" + x;
    x++;
    users.push(name);

    socket.join(currentRoom); // Join default room
    console.log(`${name} connected`);
    io.to(currentRoom).emit('chat message', `${name} joined the room.`);


    // When a user disconnects
    socket.on('disconnect', () => { // When a user disconnects
        users = users.filter(item => item !== name);
        io.to(currentRoom).emit('chat message', `${name} left the room.`);
    });


    // When a msg is sent, broadcast it to all users
    socket.on('chat message', async (msg) => {
        io.to(currentRoom).emit('chat message', name + ": " + msg);
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});