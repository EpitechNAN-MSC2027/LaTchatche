import React, { useState, useEffect, useRef } from "react";
import {
    FiTrash2,
    FiInfo,
    FiCheckCircle,
    FiPlusCircle,
} from "react-icons/fi";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Modal } from "antd";
import "./RoomList.css";
import { useNavigate } from "react-router-dom";
import { socket } from '../socket';
import logoutanimation from "../assets/animations/logout.lottie";
import toggleAnimation from "../assets/animations/toggle.lottie";
import addAnimation from "../assets/animations/add.lottie";
import chatAnimation from '../assets/animations/chat.lottie';
import cameleonAnimation from "../assets/animations/cameleon.lottie";
import meufAnimation from "../assets/animations/meuf.lottie";
import memeAnimation from "../assets/animations/meme.lottie";
import eyeAnimation from "../assets/animations/eye.lottie";



function RoomList({ nickname, avatar }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [greeting, setGreeting] = useState("");
    const [rooms, setRooms] = useState([
        { id: 1, name: "General", description: "General chat room", createdByUser: false },
        { id: 2, name: "TechTalk", description: "Discuss technology", createdByUser: true },
        { id: 3, name: "Random", description: "Anything goes", createdByUser: false },
    ]);
    const [search, setSearch] = useState("");
    const [newRoom, setNewRoom] = useState({ name: "", description: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const roomsPerPage = 4;

    const handleLogout = () => {
        window.location.href = "/";
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        } else {
            setIsDarkMode(false);
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
        }

        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    };

    const handleSearchChange = (e) => setSearch(e.target.value);
    const handleRoomCreation = () => {
        if (!newRoom.name.trim() || !newRoom.description.trim()) {
            alert("Room name and description cannot be empty.");
            return;
        }
        if (rooms.some((room) => room.name.toLowerCase() === newRoom.name.toLowerCase())) {
            alert("A room with this name already exists.");
            return;
        }
        setRooms([
            ...rooms,
            {
                id: rooms.length + 1,
                name: newRoom.name,
                description: newRoom.description,
                createdByUser: true,
            },
        ]);
        setNewRoom({ name: "", description: "" });
        setIsModalOpen(false);
        socket.emit("create-room", newRoom.name, newRoom.description);
    };

    const navigate = useNavigate();
    const handleRoomJoin = (roomName) => {
        socket.emit("join-room", roomName);
        navigate(`/chatroom`); // Redirige vers la page ChatRoom
    };

    const handleRoomDelete = (roomId, roomName) => {
        setRooms(rooms.filter((room) => room.id !== roomId));
        socket.emit('delete-room', roomName);
    };

    const [infoModal, setInfoModal] = useState({ visible: false, description: "" });

    const showRoomInfo = (roomDescription) => {
        setInfoModal({ visible: true, description: roomDescription });
    };

    const closeInfoModal = () => {
        setInfoModal({ visible: false, description: "" });
    };

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    const handlePageChange = (page) => setCurrentPage(page);

    const lottieRef = useRef(null);
    const handleToggle = () => {
        if (lottieRef.current) {
            lottieRef.current.play();
        }
        toggleDarkMode();
    };

    return (
        <div className={`RoomList-container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
            {/* effects */}
            <div className="background-effects">
                {isDarkMode
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="pulse-shape"></div>
                    ))
                    : Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bubble"></div>
                    ))}
            </div>

            {!isDarkMode && (
                <DotLottieReact
                    src={meufAnimation}
                    autoplay
                    loop
                    style={{
                        position: "absolute",
                        bottom: "-100px",
                        left: "-180px",
                        width: "150px",
                        height: "150px",
                        pointerEvents: "none",
                        zIndex: -1,
                    }}
                    className="fixed-animation bottom-left"
                />
            )}

            {isDarkMode && (
                <DotLottieReact
                    src={memeAnimation}
                    autoplay
                    loop
                    style={{
                        position: "absolute",
                        bottom: "-100px",
                        left: "-200px",
                        width: "120px",
                        height: "120px",
                        pointerEvents: "none",
                        zIndex: -1,
                    }}
                    className="fixed-animation bottom-left"
                />
            )}

            {/* Header */}
            <header className="RoomList-header">
                <div className="header-left">
                    <img
                        src={avatar}
                        alt="User Avatar"
                        className="user-avatar"
                        title={`Hello, ${nickname}`}
                    />
                    <div>
                        <h2>{greeting}, {nickname}</h2>
                        <small>Explore and manage your rooms.</small>
                    </div>
                </div>
                <div className="header-right">
                    <DotLottieReact
                        src={toggleAnimation}
                        autoplay
                        loop
                        style={{ width: 40, height: 40, cursor: "pointer" }}
                        lottieRef={lottieRef}
                        onMouseDown={handleToggle}
                    />
                    <div
                        onClick={handleLogout}
                        style={{
                            cursor: "pointer",
                            width: "40px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        title="Logout"
                    >
                        <DotLottieReact
                            autoplay
                            loop
                            src={logoutanimation}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>
                </div>
            </header>

            {/* search bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <div className="icon-container">
                    <DotLottieReact
                        src={addAnimation}
                        autoplay={false}
                        loop={false}
                        initialSegment={[0, 1]}
                        style={{ width: 70, height: 70, cursor: "pointer" }}
                        onClick={() => setIsModalOpen(true)}
                    />
                    <DotLottieReact
                        src={chatAnimation}
                        autoplay={false}
                        loop={false}
                        initialSegment={[0, 1]}
                        style={{ width: 80, height: 80, cursor: "pointer" }}
                        onClick={handleRoomJoin}
                    />
                </div>
            </div>

            {/* list of room */}
            <ul className="room-list">
                {currentRooms.map((room) => (
                    <li key={room.id} className="room-item-wrapper">
                        <div className="room-item">
                            <div className="room-info">
                                <strong>{room.name}</strong>
                                <FiInfo
                                    className="room-icon info-icon"
                                    title="Room Info"
                                    onClick={() => showRoomInfo(room.description)}
                                />
                            </div>
                            <div className="room-actions">
                                <button onClick={() => handleRoomJoin(room.name)} className="join-button">
                                    <FiCheckCircle />
                                </button>
                                {room.createdByUser && (
                                    <button onClick={() => handleRoomDelete(room.id, room.name)} className="delete-button">
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Number of pages */}
            <div className="pagination">
                {Array.from({ length: Math.ceil(filteredRooms.length / roomsPerPage) }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {/* Modal for create a room */}
            <Modal
                title="Create Room"
                visible={isModalOpen}
                onOk={handleRoomCreation}
                onCancel={() => setIsModalOpen(false)}
                okText="Create"
                className="room-create-modal"
            >
                <input
                    type="text"
                    placeholder="Room Name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="modal-input"
                />
                <textarea
                    placeholder="Room Description"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="modal-textarea"
                    style={{ marginTop: "10px", width: "100%" }}
                />
            </Modal>

            {/* Modal for info */}
            <Modal
                title="Room Description"
                visible={infoModal.visible}
                onOk={closeInfoModal}
                onCancel={closeInfoModal}
            >
                <p>{infoModal.description}</p>
            </Modal>
        </div>
    );
}

export default RoomList;