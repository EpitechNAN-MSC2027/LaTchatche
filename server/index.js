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
    //User is connected to connectedRooms
    let connectedRooms = ["default"];
    //currentRoom is the room where the user is writing a message
    let currentRoom = "default";
    let name = "user" + x;
    x++;
    users.push([name, socket.id]);

    socket.join(currentRoom); // Join default room
    console.log(`${name} connected`);
    io.to(currentRoom).emit('chat message', `${name} joined the room.`);


    // When a user disconnects
    socket.on('disconnect', () => { // When a user disconnects
        users = users.filter(item => item !== name);
        connectedRooms.forEach(room => {
            io.to(room).emit('chat message', `${name} left the room.`);
        })

    });

    //Lists of all commands
    const commandlist = ['/users', '/join', '/nick', '/quit', '/list', '/dadjoke', '/delete', '/create', '/msg', '/rooms'];

    // autocomplete requests
    socket.on("autocomplete_request", (data) => {
        const { inputText } = data;
        const suggestions = commandlist.filter(cmd => cmd.startsWith(inputText));
        socket.emit("autocomplete_response", { suggestions });
    });

    // When a msg is sent, broadcast it to all users
    socket.on('chat message', async (msg, userroom) => {

        if (userroom){
            currentRoom = userroom;
        }
        if (msg.startsWith("/")) {
            let cmd = msg.split(" ")[0];
            switch (cmd) {
                //List all users
                case "/users":
                    socket.emit('chat message', "list of users : " + users.map(user => user[0]));
                    break;
                // Change name
                case "/nick":
                    const newName = msg.split(" ")[1];
                    if (!newName) {
                        socket.emit('chat message', "Please provide a valid nickname.");
                        break;
                    }

                    if (users.some(user => user[0] === newName)) {
                        socket.emit('chat message', `The nickname "${newName}" is already in use. Please choose another.`);
                        break;
                    }

                    let userIndex = users.findIndex(user => user[1] === socket.id);
                    let oldName = users[userIndex][0];
                    users[userIndex][0] = newName;
                    name = newName;
                    users = users.filter(item => item !== oldName);
                    socket.emit('chat message', `Your name has been changed to ${newName}.`);
                    io.emit('chat message', `${oldName} has changed their nickname to ${newName}.`);
                    break;
                //create
                case "/create":
                    let room = msg.split(" ")[1];
                    rooms.push(room);
                    socket.join(room);
                    io.emit('chat message', "New room : " + room + " has been created by " + name);
                    break;
                //join
                case "/join":
                    let roomToJoin = msg.split(" ")[1];
                    if (connectedRooms.includes(roomToJoin)){
                        socket.emit('chat message', name + ": You are connected to this " + roomToJoin);
                        currentRoom = roomToJoin;
                        io.to(currentRoom).emit('chat message', name + " joined the room");
                    }else{
                        if (!rooms.includes(roomToJoin)) {
                            socket.emit('chat message', name + ": Room not found");
                            break;
                        } else {
                            socket.join(roomToJoin);
                            connectedRooms.push(roomToJoin);
                            currentRoom = roomToJoin;
                            io.to(roomToJoin).emit('chat message', name + " joined the room");
                        }
                    }

                    break;
                //list rooms
                case "/list":
                    socket.emit('chat message', "list of rooms : " + rooms);
                    break;
                //delete room
                case "/delete":
                    let roomToDelete = msg.split(" ")[1];
                    if (!rooms.includes(roomToDelete)) {
                        socket.emit('chat message', name + ": Room not found");
                        break;
                    } else {
                        rooms = rooms.filter(item => item !== roomToDelete);
                        io.emit('chat message', "Room : " + roomToDelete + " has been deleted by " + name);
                        let socketsInRoom = await io.in(roomToDelete).fetchSockets();
                        socketsInRoom.forEach((socket) => {
                            socket.leave(roomToDelete);
                            socket.join("default");
                            currentRoom = "default";
                        });
                        io.to("default").emit('chat message', 'Users from room ' +roomToDelete + ' have been moved to the default room.');
                        break;
                    }
                //Private msg
                case "/msg":
                    let userToMsg = msg.split(" ")[1];
                    let msgToUser = msg.split(" ").slice(2).join(" ");

                    if (!userToMsg || !msgToUser) {
                        socket.emit('chat message', "Usage: /msg <username> <message>");
                        break;
                    }

                    //If no users
                    if ((users.findIndex(user => user[0] === userToMsg)) === -1){
                        socket.emit('chat message', `User "${userToMsg}" not found.`);
                        break;
                    }

                    let targetSocketId = users[(users.findIndex(user => user[0] === userToMsg))][1];

                    io.to(targetSocketId).emit('chat message', `From ${name} (private): ${msgToUser}`);
                    socket.emit('chat message', `To ${userToMsg} (private): ${msgToUser}`);
                    break;
                //Quit room
                case "/quit":
                    //arg
                    let roomToQuit = msg.split(" ")[1];
                    //Check if user is connected to the room
                    if (roomToQuit in connectedRooms){
                        //leave room, join default room, remove from connectedRooms
                        socket.leave(roomToQuit);
                        socket.join("default");
                        currentRoom = "default";
                        let roomIndex = connectedRooms.indexOf(roomToQuit);
                        connectedRooms.splice(roomindex, 1);
                        socket.emit('chat message', "You have left the room " + roomToQuit);
                    }else{
                        socket.emit('chat message', "You are not connected to this room");
                    }
                    break;
                //DadJoke
                case "/dadjoke":
                    try {
                        const response = await fetch('https://icanhazdadjoke.com/', {
                            headers: {
                                'Accept': 'text/plain'
                            }
                        });
                        const data = await response.text();
                        io.to(currentRoom).emit('chat message', name + " ask for a Dad joke: " + data);
                    } catch (error) {
                        console.log({ error: 'Error fetching API data' });
                    }
                    break;
                //List all rooms connected
                case "/rooms":
                    socket.emit('chat message', "list of rooms : " + connectedRooms);
                    break;
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