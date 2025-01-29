import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatRoom.css";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import lamarAnimation from "../assets/animations/lamar.lottie";

function ChatRoom({ nickname }) {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState(() => {
        const savedRooms = localStorage.getItem("chatRooms");
        return savedRooms ? JSON.parse(savedRooms) : ["General", "TechTalk", "Random"];
    });

    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });

    const [users] = useState(["Aurore", "Bob"]);
    const [currentRoom, setCurrentRoom] = useState("General");
    const [currentMessage, setCurrentMessage] = useState("");

    useEffect(() => {
        localStorage.setItem("chatRooms", JSON.stringify(rooms));
    }, [rooms]);

    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = () => {
        if (!currentMessage.trim() || !currentRoom) return;

        if (currentMessage.startsWith("/msg ")) {
            const parts = currentMessage.split(" ");
            if (parts.length >= 3) {
                const recipient = parts[1];
                const privateMessage = parts.slice(2).join(" ");

                if (users.includes(recipient)) {
                    const newMessage = {
                        sender: nickname,
                        text: privateMessage,
                        room: currentRoom,
                        to: recipient,
                    };
                    setMessages([...messages, newMessage]);
                    setCurrentMessage("");
                    return;
                }
            }
        }

        const newMessage = {
            sender: nickname,
            text: currentMessage,
            room: currentRoom,
            to: null,
        };
        setMessages([...messages, newMessage]);
        setCurrentMessage("");
    };

    const handleRoomChange = (room) => {
        setCurrentRoom(room);
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

    const filteredMessages = messages.filter((msg) => {
        if (msg.to) {
            return (
                (msg.to === nickname && msg.sender !== nickname) ||
                (msg.sender === nickname && msg.to)
            );
        }
        return msg.room === currentRoom && !msg.to;
    });

    return (
        <div className="chat-room-container">
            {/* Sidebar gauche avec la liste des rooms */}
            <div className="chat-sidebar-left">
                <h3>Rooms</h3>
                <div className="room-title">{currentRoom}</div>
                <ul>
                    {rooms.map((room) => (
                        <li
                            key={room}
                            className={`chat-room-item ${room === currentRoom ? "active-chat-room" : ""}`}
                            onClick={() => handleRoomChange(room)}
                        >
                            {room}
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
                    {filteredMessages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === nickname ? "sent" : "received"}`}>
                            {msg.to && <p className="chat-private-tag">[Private to {msg.to}]</p>}
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
                {currentRoom && (
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder={`Message in ${currentRoom}...`}
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
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