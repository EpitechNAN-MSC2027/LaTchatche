import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import RoomList from "./Pages/RoomList";
import AvatarSelection from "./Pages/AvatarSelection";
import { io } from "socket.io-client";

function App() {
    const [nickname, setNickname] = useState(""); // Stocker le pseudo globalement
    const [avatar, setAvatar] = useState(null); // Stocker le chemin de l'avatar globalement

    // Gestion de la connexion
    const handleConnect = (nicknameInput) => {
        const socket = io("localhost:3001"); // Connexion au serveur
        setNickname(nicknameInput); // Stocker le pseudo
        console.log("Connected as:", nicknameInput);
    };

    // Gestion de la sélection d'avatar
    const handleAvatarSelect = (selectedAvatar) => {
        setAvatar(selectedAvatar.src); // Stocker le chemin de l'avatar sélectionné
        console.log("Avatar selected:", selectedAvatar);
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
            </Routes>
        </Router>
    );
}

export default App;