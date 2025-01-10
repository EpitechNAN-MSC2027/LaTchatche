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
        if (msg.startsWith("/")) {
            const command = msg.split(" ")[0];
            switch (command) {
                //List all users
                case "/users":
                    socket.emit('chat message', "list of users : " + users);
                    break;
                // Change name
                case "/nick":
                    users[users.indexOf(name)] = msg.split(" ")[1];
                    name = msg.split(" ")[1];
                    socket.emit('chat message', "Your name has been changed to " + name);
                    break;
                //create
                case "/create":
                    const room = msg.split(" ")[1];
                    rooms.push(room);
                    socket.join(room);
                    io.emit('chat message', "New room : " + room + " has been created by " + name);
                    break;
                //join
                case "/join":
                    const roomToJoin = msg.split(" ")[1];
                    if (!rooms.includes(roomToJoin)) {
                        socket.emit('chat message', name + ": Room not found");
                        break;
                    } else {
                        socket.leave(currentRoom);
                        socket.join(roomToJoin);
                        currentRoom = roomToJoin;
                        io.to(roomToJoin).emit('chat message', name + " joined the room");
                    }
                    break;
                //list rooms
                case "/list":
                    socket.emit('chat message', "list of rooms : " + rooms);
                    break;
                //delete room
                case "/delete":
                    const roomToDelete = msg.split(" ")[1];
                    if (!rooms.includes(roomToDelete)) {
                        socket.emit('chat message', name + ": Room not found");
                        break;
                    } else {
                        rooms = rooms.filter(item => item !== roomToDelete);
                        io.emit('chat message', "Room : " + roomToDelete + " has been deleted by " + name);
                        const socketsInRoom = await io.in(roomToDelete).fetchSockets();
                        socketsInRoom.forEach((socket) => {
                            socket.leave(roomToDelete);
                            socket.join("default");
                            currentRoom = "default";
                        });
                        io.to("default").emit('chat message', 'Users from room ' +roomToDelete + ' have been moved to the default room.`);
                        break;
                    }
                default:
                    socket.emit('chat message', name + ": Command not found");
                    break;
            }
        } else {
            io.to(currentRoom).emit('chat message', name + ": " + msg);
        }

    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});