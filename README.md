📜 README.md – LaTchatche

## Description
**LaTchatche** is an irc application where users can join chat rooms, send public and private messages, and interact in real time with other participants.

![React](https://img.shields.io/badge/React-F7DF1E?style=for-the-badge&logo=react&logoColor=20232A) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)


## Features
Login and nickname selection
Creation and management of chat rooms
Sending public and private messages
List of connected users in each chat room
Message storage in a database
Intuitive and responsive interface

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

1. Make sure you have Node.js and npm installed on your machine. If not, download them from nodejs.org.
2. Clone the repository: `git clone git@github.com:EpitechNAN-MSC2027/LaTchatche.git`
3. Navigate to the project: `cd LaTchatche`
4. Configure the Backend:
   - Install server dependencies:
     npm install
   - Create a .env file at the root of the server folder and add:
     - DB_HOST
     - DB_USER
     - DB_PASSWORD
     - DB_NAME=irc_db (SQL File located in server folder)
     - DB_PORT
5. Configure the Client
    - Go to the client folder and install dependencies:
    cd client
    npm install

6. Start the application:
     npm start in the root of the repo

The application is now accessible on your localhost:3000.
