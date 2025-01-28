import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatRoom.css";

function ChatRoom({ nickname }) {
    const navigate = useNavigate();

    // Charger les rooms et messages depuis localStorage ou initialiser
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

    // Sauvegarder les rooms et messages dans localStorage à chaque mise à jour
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
        // Supprimer la room et ses messages
        const updatedRooms = rooms.filter((room) => room !== currentRoom);
        const updatedMessages = messages.filter((msg) => msg.room !== currentRoom);

        setRooms(updatedRooms);
        setMessages(updatedMessages);
        localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));
        localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));

        setCurrentRoom(null); // Désactiver la room actuelle
        navigate("/rooms");
    };

    const handleBackToRooms = () => {
        navigate("/rooms");
    };

    const handleJoinRoom = (room) => {
        if (!rooms.includes(room)) {
            const updatedRooms = [...rooms, room];
            setRooms(updatedRooms);
            localStorage.setItem("chatRooms", JSON.stringify(updatedRooms)); // Sauvegarder la nouvelle room
        }

        // Sélectionner la room jointe et naviguer vers le chat
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
            {/* Liste des rooms */}
            <div className="sidebar-left">
                <h3>Rooms</h3>
                <ul>
                    {rooms.map((room) => (
                        <li
                            key={room}
                            className={`room-item ${room === currentRoom ? "active-room" : ""}`}
                            onClick={() => handleRoomChange(room)}
                        >
                            {room}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Zone principale de chat */}
            <div className="chat-main">
                <header className="chat-header">
                    <h2>{`${currentRoom ? currentRoom + " Chat Room" : "No Room Selected"}`}</h2>
                    <p>Logged in as: <strong>{nickname}</strong></p>
                    <div className="header-buttons">
                        <button onClick={handleBackToRooms} className="btn-back">Back to Rooms</button>
                        {currentRoom && (
                            <button onClick={handleLeaveRoom} className="btn-leave">Leave Room</button>
                        )}
                    </div>
                </header>
                <div className="chat-messages">
                    {filteredMessages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${
                                msg.sender === nickname ? "sent" : "received"
                            }`}
                        >
                            {msg.to && (
                                <p className="private-tag">
                                    [Private to {msg.to}]
                                </p>
                            )}
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

            {/* Liste des utilisateurs */}
            <div className="sidebar-right">
                <h3>Users</h3>
                <ul>
                    {users.map((user) => (
                        <li key={user} className="user-item">
                            {user}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ChatRoom;