📜 README.md – LaTchatche

## Description
**LaTchatche** is an irc application where users can join chat rooms, send public and private messages, and interact in real time with other participants.

## Features
Login and nickname selection
Creation and management of chat rooms
Sending public and private messages
List of connected users in each chat room
Message storage in a database
Intuitive and responsive interface

# Technologies Used

Frontend
	•	React.js
	•	CSS

Backend
	•	Express.js
	•	Socket.IO 
	•	MySQL 

 ## Command
/nick nickname: define the nickname of the user on the server.
/list [string]: list the available channels from the server. If string is specified, only displays
those whose name contains the string.
/create channel: create a channel with the specified name.
/delete channel: delete the channel with the specified name.
/join channel: join the specified channel.
/quit channel: quit the specified channel.
/users: list the users currently in the channel
/msg nickname message: send a private message to the specified nickname.
message: send a message to all the users on the channel

## Installation

1. Download and install React, Express, Socket.IO, and MySQL.
2. Clone the repository: `git clone  https://github.com/yourusername/LaTchatche.git`
3. Navigate to the project: `cd LaTchatche`
4. Configure the Backend:
   - Go to the server folder and install dependencies:
     cd server
     npm install
   - Create a .env file at the root of the server folder and add:
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=motdepasse
     DB_NAME=latchatche
     DB_PORT=3306
   - Start the server:
     npm start

5. Configure the Client
    - Go to the client folder and install dependencies:
    cd ../client
    npm install
   - Start the application:
     npm start

The application is now accessible on your localhost.
