const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

//Import dotenv & load .env
const dotenv = require('dotenv');
dotenv.config();
const io = new Server(server /*, {
    cors: {
        origin: [ process.env.IP, "http://localhost:3000"],
        methods: ["GET", "POST"],
    },
}*/);
const mysql = require('mysql2');
const { DATETIME, NULL } = require('mysql/lib/protocol/constants/types');

//const bodyParser = require('body-parser');

//app.use(cors());
//app.use(bodyParser.json());

//Mysql connection

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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

async function DebugTableUser(){
    connection.query("SELECT * FROM Users",(err,resultat) => {
        if (err){
            console.error('Error retrieving data:', err);
        }
        console.log(resultat);
    })
}

/*
app.get('/dataUsers', (req, res) => {
    const sql = 'SELECT * FROM Users';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).send('Failed to fetch data');
        }
        res.json(results);
    });
});
*/

async function DebugTableChannels(){
    connection.query("SELECT * FROM Channels",(err,resultat) => {
        if (err){
            console.error('Error retrieving data:', err);
        }
        console.log(resultat);
    })
}
/*
app.get('/dataChannels', (req, res) => {
    const sql = 'SELECT * FROM Channels';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).send('Failed to fetch data');
        }
        res.json(results);
    });
});
*/

async function DebugTableMessages(){
    connection.query("SELECT * FROM Messages",(err,resultat) => {
        if (err){
            console.error('Error retrieving data:', err);
        }
        console.log(resultat);
    })
}
/*
app.get('/dataMessages', (req, res) => {
    const sql = 'SELECT * FROM Messages';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).send('Failed to fetch data');
        }
        res.json(results);
    });
});
*/

async function DebugTablePrivateMessages(){
    connection.query("SELECT * FROM PrivateMessages",(err,resultat) => {
        if (err){
            console.error('Error retrieving data:', err);
        }
        console.log(resultat);
    })
}
/*
app.get('/dataPrivateMessages', (req, res) => {
    const sql = 'SELECT * FROM PrivateMessages';
    
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.stack);
            return res.status(500).send('Failed to fetch data');
        }
        res.json(results);
    });
});
*/

async function InsertMessage(valeur) {
    connection.query("INSERT INTO Messages (nickname,channelName,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}
/*
app.post('/addMessage', async (req, res) => {
    const { nickname,channelName,dateMessage,texteMessage } = req.body;
  
    const sql = "INSERT INTO Messages (nickname,channelName,dateMessage,texteMessage) VALUES (?, ?, ?, ?)";
    const values = [nickname,channelName,dateMessage,texteMessage];
  
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json('Failed to insert message');
        }
        res.status(200).json('Message inserted successfully!');
    });
  });
*/
async function InsertPrivateMessage(valeur) {
    connection.query("INSERT INTO PrivateMessages (nickname,privateReceiver,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}
/*
app.post('/addPrivateMessage', async (req, res) => {
    const { nickname,privateReceiver,dateMessage,texteMessage } = req.body;
  
    const sql = "INSERT INTO PrivateMessages (nickname,privateReceiver,dateMessage,texteMessage) VALUES (?, ?, ?, ?)";
    const values = [nickname,privateReceiver,dateMessage,texteMessage];
  
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json('Failed to insert message');
        }
        res.status(200).json('Message inserted successfully!');
    });
  });
*/
async function InsertUser(valeur) {
    connection.query("INSERT IGNORE INTO Users (nickname, iconID) VALUES (?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}
/*
app.post('/addUser', async (req, res) => {
    const { nickname, iconID } = req.body;
  
    const sql = "INSERT INTO Users (nickname, iconID) VALUES (?, ?)";
    const values = [nickname, iconID];
  
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json('Failed to insert user');
        }
        res.status(200).json('User inserted successfully!');
    });
  });
*/

async function UpdateUser(valeur) {
    connection.query("UPDATE Users SET nickname = ?  WHERE nickname = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data modified successfully!');
    });
}
/*
app.put('/updateUser/:nickname', async (req, res) => {
    const {nickname} = req.params;
    const {newnickname} = req.body;

    const sql = "UPDATE Users SET nickname = ?  WHERE nickname = ?";
    const values = [newnickname, nickname];

    try {
        const [results] = await connection.promise().query(sql, values);
        if (results.affectedRows === 0) {
            return res.status(404).send('User non trouvé.');
        }
        res.status(200).send('User mise à jour avec succès !');
    } catch (err) {
        console.error('Erreur lors de la mise à jour du User', err);
        res.status(500).send('Erreur lors de la mise à jour de du User' + err.message);
    }
});
*/
async function InsertChannel(valeur) {
    connection.query("INSERT INTO Channels (channelName, channelDescription) VALUES (?, ?) ON DUPLICATE KEY UPDATE isAlive = TRUE", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}
/*
app.post('/addChannel', async (req, res) => {
    const {channelName, channelDescription} = req.body;
  
    const sql = "INSERT INTO Channels (channelName, channelDescription) VALUES (?, ?)";
    const values = [channelName, channelDescription];
  
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json('Failed to insert channel');
        }
        res.status(200).json('Channel inserted successfully!');
    });
  });
*/
async function KillChannel(valeur) {
    connection.query("UPDATE Channels SET isAlive = FALSE WHERE channelName = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
        }
        console.log('Data updated successfully!');
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
/*
app.post('/addPair', async (req, res) => {
    const { nickname, channelName } = req.body;
  
    const sql = "INSERT INTO Entreprises (nickname, channelName) VALUES (?, ?)";
    const values = [nickname, channelName];
  
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json('Failed to insert pair');
        }
        res.status(200).json('Pair inserted successfully!');
    });
  });
  
*/
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

//X for nameX
let x = 1;
//List of all users
let users = [];
//List of all rooms
let rooms = ["general"];

io.on('connection', (socket) => { // When a user connects

    let currentRoom = "general";

    //User is connected to connectedRooms
    let connectedRooms = [currentRoom];
    //currentRoom is the room where the user is writing a message
    //let name;

    let name = "user" + x;
    x++;
    DebugTableUser();
    DebugTableChannels();
    DebugTableMessages();
    DebugTablePrivateMessages();
    InsertChannel([currentRoom, "Default chat"]);
    InsertUser([name, 1]);
    users.push([name, socket.id]);

    socket.join(currentRoom); // Join default room
    InsertPair([name, currentRoom]);
    console.log(`${name} connected`);
    io.to(currentRoom).emit('chat message', `${name} joined the room.`);

/*
    socket.on('login', (nickname) => {
        name = nickname;
    });
    socket.on('avatar', (avatar) => {
        InsertUser([name, avatar]);
    });
*/

    socket.on('join-room', (room) => {
        socket.join(currentRoom); // Join default room
        currentRoom = room;
        console.log("joined room: " + currentRoom + " by " + name);
        InsertPair([name, currentRoom]);
        if (!name) {
            console.log("Warning: Name is undefined in join-room handler");
        }
        io.to(currentRoom).emit('chat message', `${name} joined the room.`);
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
                          socket.emit('chat message', "list of users : " + allNicknames);
                      })
                    break;
                // Change name
                case "/nick":
                    const newName = msg.split(" ")[1];
                    if (!newName) {
                        socket.emit('chat message', "Please provide a valid nickname.");
                        break;
                    }
                    
                    connection.query("SELECT nickname FROM Users WHERE nickname = ? LIMIT 1", [newName], (err, results) => {

                        if (results.length > 0) {
                            socket.emit('chat message', `Nickname denied. ${newName} is already existant.`);
                        } else {
                            let userIndex = users.findIndex(user => user[1] === socket.id);
                            let oldName = users[userIndex][0];
                            users[userIndex][0] = newName;
                            UpdateUser([newName, oldName]);
                            name = newName;
                            users = users.filter(item => item !== oldName);
                            socket.emit('chat message', `Your name has been changed to ${newName}.`);
                            io.emit('chat message', `${oldName} has changed their nickname to ${newName}.`);
                        }
                    });

                    break;
                //create
                case "/create":
                    let room = msg.split(" ")[1].toLowerCase();
                    let description = msg.split(" ").slice(2).join(" ");

                    if (rooms.includes(room)){
                        socket.emit('chat message', room + " already exists.");
                        break;
                    }
                    else{
                        InsertChannel([room, description]);
                        rooms.push(room);
                        socket.join(room);
                        io.emit('chat message', "New room : " + room + " has been created by " + name);
                        break;
                    }
                //join
                case "/join":
                    let roomToJoin = msg.split(" ")[1];
                    if (connectedRooms.includes(roomToJoin)){
                        socket.emit('chat message', name + ": You are already connected to " + roomToJoin);
                        currentRoom = roomToJoin;

                    }else{
                        if (!rooms.includes(roomToJoin)) {
                            socket.emit('chat message', name + ": Room not found");
                            break;
                        } else {
                            socket.join(roomToJoin);
                            connectedRooms.push(roomToJoin);
                            currentRoom = roomToJoin;
                            InsertPair([name,currentRoom])
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
                    } 
                    else if (roomToDelete == "General") {
                        socket.emit(name + ": Can't delete the General channel");
                    }else {
                        DeletechannelNamePair([roomToDelete]);
                        KillChannel([roomToDelete]);
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
            InsertMessage([name,currentRoom,getCurrentDatetime(),msg]);
        }

    });
});



server.listen(5000, () => {
    console.log('listening on *:5000');
    DeleteEveryPair();
});