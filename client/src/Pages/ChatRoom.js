import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatRoom.css";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import lamarAnimation from "../assets/animations/lamar.lottie";
import { socket } from '../socket';

function ChatRoom({ nickname }) {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState(() => {});
    const [messages, setMessages] = useState([]);

    const [users, setUsers] = useState([]);
    const [currentRoom, setCurrentRoom] = useState("General");
    const [currentMessage, setCurrentMessage] = useState("");

    // Scroll to bottom when new message is received
    const messagesEndRef = useRef(null);

    useEffect(() => {

        socket.on('users', (users) => {
            setUsers(users);
        });

        socket.on('rooms', (rooms) => {
            setRooms(rooms);
        });

        socket.on('messages', (messages) => {

            setMessages(messages);
        });

        return () => {
            socket.off('users');
            socket.off('rooms');
            socket.off('messages');
        };
    }, [socket]);

    //Scroll to bottom when new message is received
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    socket.on('users', (users) => {
        setUsers(users);
    });

    socket.on('rooms', (rooms) => {
        setRooms(rooms);
    });

    socket.on('chat message', (msg) => {
        setMessages([...messages, msg]);
    });


    const handleSendMessage = () => {
        socket.emit('chat message',currentMessage, currentRoom);
        setCurrentMessage("");
    };

    const handleRoomChange = (room) => {
        setCurrentRoom(room);
        socket.emit('change-room', room);
    };

    const handleLeaveRoom = () => {
        const updatedRooms = rooms.filter((room) => room !== currentRoom);
        const updatedMessages = messages.filter((msg) => msg.room !== currentRoom);

        setRooms(updatedRooms);
        setMessages(updatedMessages);
        localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));

        setCurrentRoom(null);
        navigate("/rooms");
    };

    const handleBackToRooms = () => {
        navigate("/rooms");
    };

    const handleJoinRoom = (room) => {
        if (!rooms.includes(room)) {
            const updatedRooms = [...rooms, room];
            setRooms(updatedRooms);
            localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));
        }

        setCurrentRoom(room);
        navigate("/chatroom");
    };


    return (
        <div className="chat-room-container">
            {/* Sidebar gauche avec la liste des rooms */}
            <div className="chat-sidebar-left">
                <h3>Rooms</h3>
                <div className="room-title">{currentRoom}</div>
                <ul>
                    {rooms && rooms.map((room) => (
                        <li
                            key={room.channelName}
                            className={`chat-room-item ${room.channelName === currentRoom ? "active-chat-room" : ""}`}
                            onClick={() => handleRoomChange(room.channelName)}
                        >
                            {room.channelName}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="chat-animation">
                <DotLottieReact
                    src={lamarAnimation}
                    autoplay
                    loop
                    style={{ width: 150, height: 150 }}
                />
            </div>

            {/* Zone principale du chat */}
            <div className="chat-main">
                <header className="chat-header">
                    <div className="chat-header-content">
                        <div className="user-initial">{nickname.charAt(0).toUpperCase()}</div>
                    </div>
                    <div className="chat-header-buttons">
                        <button onClick={handleBackToRooms} className="chat-btn-back">
                            Back to Rooms
                        </button>
                        <button onClick={handleLeaveRoom} className="chat-btn-leave">
                            Leave Room
                        </button>
                    </div>
                </header>
                <div className="chat-messages">
                    {messages.map((msg, index) =>
                        msg.sender === "Server" ? (
                            <div key={index} className="chat-message server-message">
                                <p>ℹ️ {msg.text}</p>
                            </div>
                        ) : (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender === nickname ? "sent" : "received"}`}
                            >
                                {msg.to && <p className="chat-private-tag">[Private to {msg.to}]</p>}
                                <p>{msg.sender} : {msg.text}</p>
                            </div>
                        )
                    )}
                    <div ref={messagesEndRef}/>
                </div>
                {currentRoom && (
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder={`Message in ${currentRoom}...`}
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                )}
            </div>

            {/* Sidebar droite avec la liste des utilisateurs */}
            <div className="chat-sidebar-right">
                <h3>Users</h3>
                <ul>
                    {users.map((user) => (
                        <li key={user} className="chat-user-item">
                            {user}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChatRoom;