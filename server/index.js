const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require('mysql2');
const { DATETIME, NULL } = require('mysql/lib/protocol/constants/types');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'irc',
  password: 'test',
  database: 'irc_db',
  port: 3306,
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
    connection.query("INSERT IGNORE INTO Users (nickname) VALUES (?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
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

async function InsertChannel(valeur) {
    connection.query("INSERT IGNORE INTO Channels (channelName) VALUES (?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}

async function InsertPair(valeur) {
    connection.query("INSERT IGNORE INTO Pairs (nickname, channelName) VALUES (?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
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

async function DeletechannelNamePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (channelName = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

//X for nameX
let x = 1;
//List of all users
let users = [];
//List of all rooms
let rooms = ["General"];

io.on('connection', (socket) => { // When a user connects
    let currentRoom = "General";
    let name = "user" + x;
    x++;
    InsertChannel([currentRoom]);
    InsertUser([name]);
    users.push([name, socket.id]);

    socket.join(currentRoom); // Join default room
    InsertPair([name, currentRoom]);
    console.log(`${name} connected`);
    io.to(currentRoom).emit('chat message', `${name} joined the room.`);


    // When a user disconnects
    socket.on('disconnect', () => { // When a user disconnects
        users = users.filter(item => item !== name);
        io.to(currentRoom).emit('chat message', `${name} left the room.`);
        DeletenicknamePair([name]);
    });


    // When a msg is sent, broadcast it to all users
    socket.on('chat message', async (msg) => {
        if (msg.startsWith("/")) {
            const command = msg.split(" ")[0];
            switch (command) {
                //List all users
                case "/users":
                    connection.query("SELECT nickname FROM Pairs WHERE channelName = ?", [currentRoom], (err,resultat)=>{
                        if (err) {
                            console.error("Error executing query:", err.message);
                            return;
                          }
                          const allNicknames = resultat.map(item => item.nickname).join(', ');
                          socket.emit('chat message', "list of users : " + allNicknames);
                      })
                    break;
                // Change name
                case "/nick":
                    const newName = msg.split(" ")[1];
                    if (!newName) {
                        socket.emit('chat message', "Please provide a new nickname.");
                        break;
                    }
                    let userIndex = users.findIndex(user => user[1] === socket.id);
                    let oldName = users[userIndex][0];
                    users[userIndex][0] = newName;
                    UpdateUser([newName, oldName]);
                    name = newName;
                    socket.emit('chat message', `Your name has been changed to ${newName}.`);
                    io.emit('chat message', `${oldName} has changed their nickname to ${newName}.`);
                    break;
                //create
                case "/create":
                    let room = msg.split(" ")[1];
                    InsertChannel([room]);
                    rooms.push(room);
                    socket.join(room);
                    io.emit('chat message', "New room : " + room + " has been created by " + name);
                    break;
                //join
                case "/join":
                    let roomToJoin = msg.split(" ")[1];
                    if (!rooms.includes(roomToJoin)) {
                        socket.emit('chat message', name + ": Room not found");
                        break;
                    } else {
                        socket.leave(currentRoom);
                        socket.join(roomToJoin);
                        currentRoom = roomToJoin;
                        io.to(roomToJoin).emit('chat message', name + " joined the room");
                        InsertPair([name,currentRoom])
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
                    } 
                    else if (roomToDelete == "General") {
                        socket.emit(name + ": Can't delete the General channel");
                    }else {
                        DeletechannelNamePair([roomToDelete]);
                        rooms = rooms.filter(item => item !== roomToDelete);
                        io.emit('chat message', "Room : " + roomToDelete + " has been deleted by " + name);
                        let socketsInRoom = await io.in(roomToDelete).fetchSockets();
                        socketsInRoom.forEach((socket) => {
                            socket.leave(roomToDelete);
                            socket.join("General");
                            currentRoom = "General";
                        });
                        io.to("General").emit('chat message', 'Users from room ' +roomToDelete + ' have been moved to the General room.');
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
                    InsertPrivateMessage([name,userToMsg,getCurrentDatetime(),msg]);
                    break;
                //Quit room
                case "/quit":
                    let roomToQuit = msg.split(" ")[1];
                    socket.leave(roomToQuit);
                    DeletePair([name, roomToQuit]);
                    socket.join("General");
                    currentRoom = "General";
                    socket.emit('chat message', "You have left the room " + roomToQuit);
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

                default:
                    socket.emit('chat message', name + ": Command not found");
                    break;
            }
        } else {
            io.to(currentRoom).emit('chat message', name + ": " + msg);
            InsertMessage([name,currentRoom,getCurrentDatetime(),msg]);
        }

    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});