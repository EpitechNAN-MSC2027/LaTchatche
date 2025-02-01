const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

//Import dotenv & load .env
const dotenv = require('dotenv');
dotenv.config();
const io = new Server(server, {
    cors: {
        origin: [ process.env.IP, "http://localhost:3000"],
        methods: ["GET", "POST"],
    },
});
const mysql = require('mysql2');
const { DATETIME, NULL } = require('mysql/lib/protocol/constants/types');

//Mysql connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
    maxIdle: 999999,
    idleTimeout: 999999,
    enableKeepAlive: true,
    connectTimeout: 99999,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL!');
});

module.exports = connection;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function getCurrentDatetime() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
  }

async function InsertMessage(valeur) {
    connection.query("INSERT INTO Messages (nickname,channelName,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}

async function InsertPrivateMessage(valeur) {
    connection.query("INSERT INTO PrivateMessages (nickname,privateReceiver,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}

async function InsertUser(valeur) {
    connection.query("INSERT IGNORE INTO Users (nickname, iconID) VALUES (?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}

async function UpdateUser(valeur) {
    connection.query("UPDATE Users SET nickname = ? WHERE nickname = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data modified successfully!');
    });
}

async function InsertChannel([cName, cDescription]) {
    connection.query("INSERT IGNORE INTO Channels (channelName, channelDescription, isAlive) VALUES (?, ?, 1)", [cName, cDescription], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}

async function InsertPair(valeur) {
    connection.query("INSERT IGNORE INTO Pairs (nickname, channelName) VALUES (?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}

async function DeletePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (nickname = ? AND channelName = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

async function DeletenicknamePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (nickname = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

async function DeleteEveryPair() {
    connection.query("DELETE FROM Pairs", (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

async function DeletechannelNamePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (channelName = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

async function getPair(channel) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT nickname FROM Pairs WHERE channelName = ?", [channel], (err, resultat) => {
            if (err) {
                console.error("Error executing query:", err.message);
                reject(err);
            } else {
                const allNicknames = resultat.map(item => item.nickname);
                resolve(allNicknames);
            }
        });
    });
}

async function getChannels() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT channelName, channelDescription FROM Channels WHERE isAlive = 1", (err, resultat) => {
            if (err) {
                console.error("Error executing query:", err.message);
                reject(err);
            } else {
                const allChannels = resultat.map(item => ({
                    channelName: item.channelName,
                    channelDescription: item.channelDescription
                }));
                resolve(allChannels);
            }
        });
    });
}

async function getMyChannels(nickname) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT Channels.channelName, Channels.channelDescription FROM Channels JOIN Pairs ON Channels.channelName = Pairs.channelName WHERE Channels.isAlive = 1 AND Pairs.nickname = ?", [nickname], (err, resultat) => {
            if (err) {
                console.error("Error executing query:", err.message);
                reject(err);
            } else {
                const allChannels = resultat.map(item => ({
                    channelName: item.channelName,
                    channelDescription: item.channelDescription
                }));
                resolve(allChannels);
            }
        });
    });
}

async function getMessages(room) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT texteMessage, nickname FROM Messages WHERE channelName = ?", [room], (err, resultat) => {
            if (err) {
                console.error("Error executing query:", err.message);
                reject(err);
            } else {
                const allMessages = resultat.map(item => ({
                    text: item.texteMessage,
                    sender: item.nickname
                }));
                resolve(allMessages);
            }
        });
    });
}

async function UpdateChannel(valeur) {
    connection.query("UPDATE Channels SET isAlive = ? WHERE channelName = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
        } else {
            console.log('Data updated successfully!');
        }
    });
}

//X for nameX
let x = 1;
//List of all users
let users = [];
//List of all rooms
let rooms = ["General"];

io.on('connection', (socket) => { // When a user connects
    let currentRoom
    //User is connected to connectedRooms
    let connectedRooms = [currentRoom];
    //currentRoom is the room where the user is writing a message
    let name;
    let avatarID

    socket.on('login', (nickname) => {
        name = nickname;
        users.push([name, socket.id]);
    });
    socket.on('avatar', (avatar) => {
        avatarID = avatar;
        InsertUser([name, avatar]);
    });

    socket.on('join-room', async (room) => {
        currentRoom = room;
        socket.join(currentRoom); // Join default room
        InsertPair([name, currentRoom]);
        if (!name) {
            console.log("Warning: Name is undefined in join-room handler");
        }
        const allNicknames = await getPair(room);
        io.to(currentRoom).emit('users', allNicknames);

        const allRooms = await getMyChannels(name);
        socket.emit('rooms', allRooms);

        const allMessages = await getMessages(room);
        socket.emit('messages', allMessages);
    });

    socket.on('create-room', (rName, rDescription ) => {
        InsertChannel([rName, rDescription, 1]);
    });

    socket.on('delete-room', (rName) => {
        DeletechannelNamePair([rName]);
        UpdateChannel([0,rName]);
    });

    socket.on('change-room', async (room) => {
        currentRoom = room;
        socket.join(currentRoom);
        const allNicknames = await getPair(room);
        io.to(currentRoom).emit('users', allNicknames);

        const allMessages = await getMessages(room);
        socket.emit('messages', allMessages);
    });


    socket.on('get-rooms', async () => {
        const allRooms = await getChannels();
        socket.emit('rooms', allRooms);
    });


    // When a user disconnects
    socket.on('disconnect', () => { // When a user disconnects
        users = users.filter(item => item !== name);

        DeletenicknamePair([name]);
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

        let newMessage = {
            sender: name,
            text: msg,
            room: currentRoom,
            to: null,
        };

        if (userroom){
            currentRoom = userroom;
        }
        if (msg.startsWith("/")) {
            let cmd = msg.split(" ")[0];
            switch (cmd) {
                //List all users
                case "/users":
                    connection.query("SELECT nickname FROM Pairs WHERE channelName = ?", [currentRoom], (err,resultat)=>{
                        if (err) {
                            console.error("Error executing query:", err.message);
                          }
                          const allNicknames = resultat.map(item => item.nickname).join(', ');
                        newMessage = {
                            sender: "Server",
                            text: "list of users : " + allNicknames,
                            room: currentRoom,
                            to: null,
                        };
                          socket.emit('chat message', newMessage);
                      })
                    break;
                // Change name
                case "/nick":
                    const newName = msg.split(" ")[1];
                    if (!newName) {
                        newMessage = {
                            sender: "Server",
                            text: "Please provide a valid nickname.",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        break;
                    }

                    if (users.findIndex(user => user[0] === newName) !== -1) {
                        newMessage = {
                            sender: "Server",
                            text: "Nickname denied. " + newName + " is already existent.",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                    } else {
                        let userIndex = users.findIndex(user => user[1] === socket.id);
                        let oldName = users[userIndex][0];
                        users[userIndex][0] = newName;
                        UpdateUser([newName, oldName]);
                        name = newName;
                        newMessage = {
                            sender: "Server",
                            text: "Your name has been changed to " + newName,
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        newMessage = {
                            sender: "Server",
                            text: oldName + " has changed their nickname to " + newName,
                            room: currentRoom,
                            to: null,
                        };
                        io.emit('chat message', newMessage);
                        const allNicknames = await getPair(currentRoom);
                        io.to(currentRoom).emit('users', allNicknames);
                    }
                    break;
                //create
                case "/create":
                    let room = msg.split(" ")[1];
                    let description = msg.split(" ").slice(2).join(" ");
                    InsertChannel([room, description, 1]);
                    rooms.push(room);
                    socket.join(room);
                    newMessage = {
                        sender: "Server",
                        text: "New room : " + room + " has been created by " + name,
                        room: currentRoom,
                        to: null,
                    };
                    io.emit('chat message', newMessage);
                    break;
                //join
                case "/join":
                    let roomToJoin = msg.split(" ")[1];
                    if (connectedRooms.includes(roomToJoin)){
                        newMessage = {
                            sender: "Server",
                            text: name + ": You are already connected to " + roomToJoin,
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        currentRoom = roomToJoin;

                    }else{
                        if (!rooms.includes(roomToJoin)) {
                            newMessage = {
                                sender: "Server",
                                text: ": Room not found",
                                room: currentRoom,
                                to: null,
                            };
                            socket.emit('chat message', newMessage);
                            break;
                        } else {
                            socket.join(roomToJoin);
                            connectedRooms.push(roomToJoin);
                            currentRoom = roomToJoin;
                            InsertPair([name,currentRoom])
                            newMessage = {
                                sender: "Server",
                                text: name + " joined " + roomToJoin,
                                room: currentRoom,
                                to: null,
                            };
                            io.to(roomToJoin).emit('chat message', newMessage);
                        }
                    }

                    break;
                //list rooms
                case "/list":
                    const allRooms = await getChannels();
                    const roomNames = allRooms.map(room => room.channelName).join(', ');
                    newMessage = {
                        sender: "Server",
                        text: "list of rooms : " + roomNames,
                        room: currentRoom,
                        to: null,
                    };
                    socket.emit('chat message', newMessage);
                    break;
                //delete room
                case "/delete":
                    let roomToDelete = msg.split(" ")[1];
                    if (!rooms.includes(roomToDelete)) {
                        newMessage = {
                            sender: "Server",
                            text: "Room not found",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        break;
                    } 
                    else if (roomToDelete == "General") {
                        newMessage = {
                            sender: "Server",
                            text: name + ": Can't delete the General channel",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                    }else {
                        DeletechannelNamePair([roomToDelete]);
                        UpdateChannel([0,roomToDelete]);
                        rooms = rooms.filter(item => item !== roomToDelete);
                        newMessage = {
                            sender: "Server",
                            text: "Room : " + roomToDelete + " has been deleted by " + name,
                            room: currentRoom,
                            to: null,
                        };
                        io.emit('chat message', newMessage);
                        let socketsInRoom = await io.in(roomToDelete).fetchSockets();
                        socketsInRoom.forEach((socket) => {
                            socket.leave(roomToDelete);
                            socket.join("General");
                            currentRoom = "General";
                        });
                        newMessage = {
                            sender: "Server",
                            text: "Users from room " +roomToDelete + " have been moved to the General room.",
                            room: currentRoom,
                            to: null,
                        };
                        io.to("General").emit('chat message', newMessage);
                        break;
                    }
                //Private msg
                case "/msg":
                    let userToMsg = msg.split(" ")[1];
                    let msgToUser = msg.split(" ").slice(2).join(" ");

                    if (!userToMsg || !msgToUser) {
                        newMessage = {
                            sender: "Server",
                            text: "Usage: /msg <username> <message>",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        break;
                    }

                    //If no users
                    if ((users.findIndex(user => user[0] === userToMsg)) === -1){
                        newMessage = {
                            sender: "Server",
                            text: "User " + userToMsg + " not found.",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                        break;
                    }

                    let targetSocketId = users[(users.findIndex(user => user[0] === userToMsg))][1];

                    newMessage = {
                        sender: "Server",
                        text: "From " + name + "(private): " + msgToUser,
                        room: currentRoom,
                        to: null,
                    };

                    io.to(targetSocketId).emit('chat message', newMessage);

                    newMessage = {
                        sender: "Server",
                        text: "To " + userToMsg + "(private): " + msgToUser,
                        room: currentRoom,
                        to: null,
                    };
                    socket.emit('chat message', newMessage);
                    InsertPrivateMessage([name,userToMsg,getCurrentDatetime(),msgToUser]);
                    break;
                //Quit room
                case "/quit":
                    //arg
                    let roomToQuit = msg.split(" ")[1];
                    //Check if user is connected to the room
                    if (roomToQuit in connectedRooms){
                        //leave room, join default room, remove from connectedRooms
                        socket.leave(roomToQuit);
                        DeletePair([name, roomToQuit]);
                        socket.join("General");
                        currentRoom = "General";
                        let roomIndex = connectedRooms.indexOf(roomToQuit);
                        connectedRooms.splice(roomindex, 1);
                        newMessage = {
                            sender: "Server",
                            text: name + "have left the room " + roomToQuit,
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
                    }else{
                        newMessage = {
                            sender: "Server",
                            text: "You are not connected to this room",
                            room: currentRoom,
                            to: null,
                        };
                        socket.emit('chat message', newMessage);
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

                        newMessage = {
                            sender: "DadJoke",
                            text: name + " ask for a Dad joke: " + data,
                            room: currentRoom,
                            to: null,
                        };
                        io.to(currentRoom).emit('chat message', newMessage);
                    } catch (error) {
                        console.log({ error: 'Error fetching API data' });
                    }
                    break;
                //List all rooms connected
                case "/rooms":
                    const allMyRooms = await getMyChannels(name);
                    const MyroomNames = allMyRooms.map(room => room.channelName).join(', ');
                    newMessage = {
                        sender: "Server",
                        text: "list of rooms : " + MyroomNames,
                        room: currentRoom,
                        to: null,
                    };
                    socket.emit('chat message', newMessage);
                    break;
                default:
                    newMessage = {
                        sender: "Server",
                        text: "Command not found",
                        room: currentRoom,
                        to: null,
                    };
                    socket.emit('chat message', newMessage);
                    break;
            }
        } else {
            newMessage = {
                sender: name,
                text: msg,
                room: currentRoom,
                to: null,
            };

            io.to(currentRoom).emit('chat message', newMessage);
            InsertMessage([name,currentRoom,getCurrentDatetime(),msg]);
        }

    });
});



server.listen(5000, () => {
    console.log('listening on *:5000');
    DeleteEveryPair();
});