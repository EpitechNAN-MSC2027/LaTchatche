import React, { useState, useEffect } from "react";
import {
    FiLogOut,
    FiSun,
    FiMoon,
    FiTrash2,
    FiInfo,
    FiCheckCircle,
    FiPlusCircle,
    FiMessageSquare,
} from "react-icons/fi"; // Import des icônes
import { Modal } from "antd"; // Pour le modal
import "./RoomList.css";

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
    const roomsPerPage = 6;

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle("dark-mode", !isDarkMode);
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

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
    };

    const handleRoomJoin = (roomName) => {
        alert(`You have joined the room: ${roomName}`);
    };

    const handleRoomDelete = (roomId) => {
        setRooms(rooms.filter((room) => room.id !== roomId));
    };

    const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="RoomList-container">
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
                    <button
                        onClick={toggleDarkMode}
                        className="mode-toggle-button"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <FiSun /> : <FiMoon />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label="Logout"
                    >
                        <FiLogOut />
                    </button>
                </div>
            </header>

            {/* Barre de recherche */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <div className="icon-container">
                    <FiPlusCircle
                        className="icon"
                        onClick={() => setIsModalOpen(true)}
                        title="Create Room"
                    />
                    <FiMessageSquare
                        className="icon"
                        onClick={() => alert("Navigate to Chat Room")}
                        title="Go to Chat Room"
                    />
                </div>
            </div>

            {/* Liste des salons */}
            <ul className="room-list">
                {currentRooms.map((room) => (
                    <li key={room.id} className="room-item">
                        <div className="room-info">
                            <strong>{room.name}</strong>
                            <FiInfo
                                className="room-icon info-icon"
                                title={room.description}
                            />
                        </div>
                        <div className="room-actions">
                            <button
                                onClick={() => handleRoomJoin(room.name)}
                                className="join-button"
                                aria-label="Join Room"
                            >
                                <FiCheckCircle />
                            </button>
                            {room.createdByUser && (
                                <button
                                    onClick={() => handleRoomDelete(room.id)}
                                    className="delete-button"
                                    aria-label="Delete Room"
                                >
                                    <FiTrash2 />
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Pagination */}
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

            {/* Modal pour créer un salon */}
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
        </div>
    );
}

export default RoomList;