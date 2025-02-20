import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import RoomList from "./Pages/RoomList";
import AvatarSelection from "./Pages/AvatarSelection";
import ChatRoom from "./Pages/ChatRoom"; // Import de la page ChatRoom
import { socket } from './socket';

function App() {
    const [nickname, setNickname] = useState(""); // Stocker le pseudo globalement
    const [avatar, setAvatar] = useState(null); // Stocker le chemin de l'avatar globalement

    // Gestion de la connexion
    const handleConnect = (nicknameInput) => {
        setNickname(nicknameInput); // Stocker le pseudo
        socket.emit("login", nicknameInput);
    };

    // Gestion de la sélection d'avatar
    const handleAvatarSelect = (selectedAvatar) => {
        setAvatar(selectedAvatar.src); // Stocker le chemin de l'avatar sélectionné
        socket.emit("avatar", selectedAvatar.id);
    };

    return (
        <Router>
            <Routes>
                {/* Page de connexion */}
                <Route path="/" element={<Login onConnect={handleConnect} />} />

                {/* Page de sélection d'avatar */}
                <Route
                    path="/avatar-selection"
                    element={
                        <AvatarSelection
                            onAvatarSelect={handleAvatarSelect}
                        />
                    }
                />

                {/* Page de liste des salons */}
                <Route
                    path="/rooms"
                    element={
                        <RoomList
                            nickname={nickname}
                            avatar={avatar}
                        />
                    }
                />

                {/* Page ChatRoom */}
                <Route
                    path="/chatroom"
                    element={
                        <ChatRoom
                            nickname={nickname}
                            avatar={avatar}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;