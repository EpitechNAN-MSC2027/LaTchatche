const express = require('express'); // Import Express framework
const app = express(); // Create an Express application
const http = require('http'); // Import Node.js HTTP module
const server = http.createServer(app); // Create an HTTP server using the Express app
const { Server } = require("socket.io"); // Import Socket.IO server

// Import dotenv & load .env file
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

// Create a new Socket.IO server with CORS configuration
const io = new Server(server, {
    cors: {
        origin: [process.env.IP, "http://localhost:3000"], // Allowed origins for CORS
        methods: ["GET", "POST"], // Allowed HTTP methods for CORS
    },
});

const mysql = require('mysql2'); // Import MySQL2 module
const { DATETIME, NULL } = require('mysql/lib/protocol/constants/types'); // Import MySQL constants

// MySQL connection configuration
const connection = mysql.createConnection({
    host: process.env.DB_HOST, // Database host
    user: process.env.DB_USER, // Database user
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME, // Database name
    port: process.env.DB_PORT, // Database port
    maxIdle: 999999, // Maximum idle connections
    idleTimeout: 999999, // Idle timeout duration
    enableKeepAlive: true, // Enable keep-alive
    connectTimeout: 99999, // Connection timeout duration
});

// Establish a connection to the MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack); // Log error if connection fails
        return;
    }
    console.log('Connected to MySQL!'); // Log success message if connection is successful
});

// Export the connection object for use in other parts of the application
module.exports = connection;

/**
 * Returns the current date and time formatted as 'YYYY-MM-DD HH:MM:SS'.
 *
 * @returns {string} The formatted current date and time.
 */
function getCurrentDatetime() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
  }

/**
 * Inserts a new message into the Messages table.
 *
 * @param {Array} valeur - An array containing the values to be inserted [nickname, channelName, dateMessage, texteMessage].
 */
async function InsertMessage(valeur) {
    connection.query("INSERT INTO Messages (nickname,channelName,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}

/**
 * Inserts a new private message into the PrivateMessages table.
 *
 * @param {Array} valeur - An array containing the values to be inserted [nickname, privateReceiver, dateMessage, texteMessage].
 */
async function InsertPrivateMessage(valeur) {
    connection.query("INSERT INTO PrivateMessages (nickname,privateReceiver,dateMessage,texteMessage) VALUES (?, ?, ?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data inserted successfully!');
    });
}

/**
 * Inserts a new user into the Users table.
 *
 * @param {Array} valeur - An array containing the values to be inserted [nickname, iconID].
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

/**
 * Updates the nickname of a user in the Users table.
 *
 * @param {Array} valeur - An array containing the values to be updated [newNickname, oldNickname].
 */
async function UpdateUser(valeur) {
    connection.query("UPDATE Users SET nickname = ? WHERE nickname = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        }
        console.log('Data modified successfully!');
    });
}

/**
 * Inserts a new channel into the Channels table.
 *
 * @param {Array} valeur - An array containing the values to be inserted [channelName, channelDescription].
 */
async function InsertChannel([cName, cDescription]) {
    connection.query("INSERT IGNORE INTO Channels (channelName, channelDescription, isAlive) VALUES (?, ?, 1)", [cName, cDescription], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}

/**
 * Inserts a new pair into the Pairs table.
 *
 * @param {Array} valeur - An array containing the values to be inserted [nickname, channelName].
 */
async function InsertPair(valeur) {
    connection.query("INSERT IGNORE INTO Pairs (nickname, channelName) VALUES (?, ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
        } else {
            console.log('Data inserted successfully!');
        }
    });
}

/**
 * Deletes a pair from the Pairs table.
 *
 * @param {Array} valeur - An array containing the values to be deleted [nickname, channelName].
 */
async function DeletePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (nickname = ? AND channelName = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

/**
 * Deletes a pair from the Pairs table based on the nickname.
 *
 * @param {Array} valeur - An array containing the nickname to be deleted.
 */
async function DeletenicknamePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (nickname = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

/**
 * Deletes all pairs from the Pairs table.
 */
async function DeleteEveryPair() {
    connection.query("DELETE FROM Pairs", (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

/**
 * Deletes pairs from the Pairs table based on the channelName.
 *
 * @param {Array} valeur - An array containing the channelName to be deleted.
 */
async function DeletechannelNamePair(valeur) {
    connection.query("DELETE FROM Pairs WHERE (channelName = ?)", valeur, (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
        }
        console.log('Data deleted successfully!');
    });
}

/**
 * Retrieves all nicknames from the Pairs table for a given channel.
 *
 * @param {string} channel - The name of the channel.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of nicknames.
 */
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

/**
 * Retrieves all channels from the Channels table where isAlive is 1.
 *
 * @returns {Promise<Array<{channelName: string, channelDescription: string}>>} A promise that resolves with an array of channel objects.
 */
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

/**
 * Retrieves all channels from the Channels table where isAlive is 1 and the nickname matches.
 *
 * @param {string} nickname - The nickname of the user.
 * @returns {Promise<Array<{channelName: string, channelDescription: string}>>} A promise that resolves with an array of channel objects.
 */
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

/**
 * Retrieves all messages from the Messages table for a given channel.
 *
 * @param {string} room - The name of the channel.
 * @returns {Promise<Array<{text: string, sender: string}>>} A promise that resolves with an array of message objects.
 */
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

/**
 * Updates the isAlive status of a channel in the Channels table.
 *
 * @param {Array} valeur - An array containing the values to be updated [isAlive, channelName].
 */
async function UpdateChannel(valeur) {
    connection.query("UPDATE Channels SET isAlive = ? WHERE channelName = ?", valeur, (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
        } else {
            console.log('Data updated successfully!');
        }
    });
}

//List of all users
let users = [];
//List of all rooms
let rooms = ["General"];

io.on('connection', (socket) => { // When a user connects
    //currentRoom is the room where the user is writing a message
    let currentRoom
    //User is connected to connectedRooms
    let connectedRooms = [];
    //Name of the user
    let name;
    //Avatar of the user
    let avatarID

    // Handle user login event
    socket.on('login', (nickname) => {
        name = nickname; // Set the user's nickname
        users.push([name, socket.id]); // Add the user to the list of connected users
    });

    //Handle user avatar event
    socket.on('avatar', (avatar) => {
        avatarID = avatar; // Set the user's avatar
        InsertUser([name, avatar]); // Insert the user into the Users table
    });

    // Handle user join-room event
    socket.on('join-room', async (room) => {
        currentRoom = room; // Set the current room
        socket.join(currentRoom); // Join default room
        connectedRooms.push(currentRoom); // Add the room to the list of connected rooms
        InsertPair([name, currentRoom]); // Insert the user into the Pairs table
        // Handle name not defined
        if (!name) {
            console.log("Warning: Name is undefined in join-room handler");
        }

        //Emit all users in the room
        const allNicknames = await getPair(room);
        io.to(currentRoom).emit('users', allNicknames);

        //Emit All room of the user
        const allRooms = await getMyChannels(name);
        socket.emit('rooms', allRooms);

        //Emit all messages in the room
        const allMessages = await getMessages(room);
        socket.emit('messages', allMessages);
    });

    //Handle create-room event
    socket.on('create-room', (rName, rDescription ) => {
        InsertChannel([rName, rDescription, 1]); // Insert the channel into the Channels table
    });

    //Handle delete-room event
    socket.on('delete-room', (rName) => {
        DeletechannelNamePair([rName]); // Delete the channel from the Pairs table
        UpdateChannel([0,rName]); // Update the channel in the Channels table
    });

    //Handle change-room event
    socket.on('change-room', async (room) => {
        currentRoom = room; // Set the current room
        socket.join(currentRoom); // Join the new room

        // Emit all users in the room
        const allNicknames = await getPair(room);
        io.to(currentRoom).emit('users', allNicknames);

        //Emit all messages in the room
        const allMessages = await getMessages(room);
        socket.emit('messages', allMessages);
    });

    //Handle get-rooms event
    socket.on('get-rooms', async () => {
        //Emit all rooms
        const allRooms = await getChannels();
        socket.emit('rooms', allRooms);
    });


    // Handle user disconnect event
    socket.on('disconnect', () => {
        users = users.filter(item => item !== name);// Remove the user from the list of connected users
        DeletenicknamePair([name]);// Delete the user from the Pairs table
        //Emit all users in the room
        connectedRooms.forEach(room => {
            io.to(room).emit('chat message', `${name} left the room.`);
        })
    });

    //Lists of all commands
    const commandlist = ['/users', '/join', '/nick', '/quit', '/list', '/dadjoke', '/delete', '/create', '/msg', '/rooms'];

    // Handle autocomplete request event
    socket.on("autocomplete_request", (data) => {
        const { inputText } = data;
        const suggestions = commandlist.filter(cmd => cmd.startsWith(inputText));
        socket.emit("autocomplete_response", { suggestions });
    });

    // Handle chat message event
    socket.on('chat message', async (msg, userroom) => {
        // Create a new message object
        let newMessage = {
            sender: name,
            text: msg,
            room: currentRoom,
            to: null,
        };
        //If userroom is defined, defined the currentRoom
        if (userroom){
            currentRoom = userroom;
        }
        //If the message starts with a slash, it's a command
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
                        sender: name,
                        text: "From " + name + "(private): " + msgToUser,
                        room: currentRoom,
                        to: null,
                    };

                    io.to(targetSocketId).emit('chat message', newMessage);

                    newMessage = {
                        sender: name,
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
                    if (connectedRooms.includes(roomToQuit)) {
                        //leave room, join default room, remove from connectedRooms
                        socket.leave(roomToQuit);
                        DeletePair([name, roomToQuit]);
                        socket.join("General");
                        currentRoom = "General";
                        let roomIndex = connectedRooms.indexOf(roomToQuit);
                        connectedRooms.splice(roomIndex, 1);
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
                        const allRooms = await getMyChannels(name);
                        socket.emit('rooms', allRooms);
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
                //Default command found
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
            //Emit the message to the room and InsertMessage in the database
            io.to(currentRoom).emit('chat message', newMessage);
            InsertMessage([name,currentRoom,getCurrentDatetime(),msg]);
        }

    });
});


// Start the server on port 5000
server.listen(5000, () => {
    console.log('listening on *:5000');
    DeleteEveryPair(); //Delete all pairs
});