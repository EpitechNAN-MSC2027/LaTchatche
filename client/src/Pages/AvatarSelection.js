import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AvatarSelection.css";

// Import des avatars
import avatar1 from "../assets/Pilllz_download_pack/myPilllz01.svg";
import avatar2 from "../assets/Pilllz_download_pack/myPilllz02.svg";
import avatar3 from "../assets/Pilllz_download_pack/myPilllz04.svg";
import avatar4 from "../assets/Pilllz_download_pack/myPilllz05.svg";
import avatar5 from "../assets/Pilllz_download_pack/myPilllz06.svg";
import avatar6 from "../assets/Pilllz_download_pack/myPilllz07.svg";
import avatar7 from "../assets/Pilllz_download_pack/myPilllz10.svg";
import avatar8 from "../assets/Pilllz_download_pack/myPilllz35.svg";
import avatar9 from "../assets/Pilllz_download_pack/myPilllz12.svg";
import avatar10 from "../assets/Pilllz_download_pack/myPilllz13.svg";
import avatar11 from "../assets/Pilllz_download_pack/myPilllz14.svg";
import avatar12 from "../assets/Pilllz_download_pack/myPilllz15.svg";
import avatar13 from "../assets/Pilllz_download_pack/myPilllz16.svg";
import avatar14 from "../assets/Pilllz_download_pack/myPilllz18.svg";
import avatar15 from "../assets/Pilllz_download_pack/myPilllz19.svg";
import avatar16 from "../assets/Pilllz_download_pack/myPilllz20.svg";
import avatar17 from "../assets/Pilllz_download_pack/myPilllz23.svg";
import avatar18 from "../assets/Pilllz_download_pack/myPilllz24.svg";
import avatar19 from "../assets/Pilllz_download_pack/myPilllz25.svg";
import avatar20 from "../assets/Pilllz_download_pack/myPilllz30.svg";
import avatar21 from "../assets/Pilllz_download_pack/myPilllz31.svg";
import avatar22 from "../assets/Pilllz_download_pack/myPilllz32.svg";
import avatar23 from "../assets/Pilllz_download_pack/myPilllz33.svg";
import avatar24 from "../assets/Pilllz_download_pack/myPilllz34.svg";

function AvatarSelection({ onAvatarSelect }) {
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const navigate = useNavigate();

    const avatars = [
        { id: 1, src: avatar1 },
        { id: 2, src: avatar2 },
        { id: 3, src: avatar3 },
        { id: 4, src: avatar4 },
        { id: 5, src: avatar5 },
        { id: 6, src: avatar6 },
        { id: 7, src: avatar7 },
        { id: 8, src: avatar8 },
        { id: 9, src: avatar9 },
        { id: 10, src: avatar10 },
        { id: 11, src: avatar11 },
        { id: 12, src: avatar12 },
        { id: 13, src: avatar13 },
        { id: 14, src: avatar14 },
        { id: 15, src: avatar15 },
        { id: 16, src: avatar16 },
        { id: 17, src: avatar17 },
        { id: 18, src: avatar18 },
        { id: 19, src: avatar19 },
        { id: 20, src: avatar20 },
        { id: 21, src: avatar21 },
        { id: 22, src: avatar22 },
        { id: 23, src: avatar23 },
        { id: 24, src: avatar24 },
    ];

    const handleAvatarClick = (avatar) => {
        if (selectedAvatar === avatar.id) {
            // Si on clique à nouveau sur l'avatar sélectionné, confirmer
            onAvatarSelect(avatar);
            navigate("/rooms"); // Rediriger vers la liste des salons
        } else {
            setSelectedAvatar(avatar.id); // Sélectionner l'avatar
        }
    };

    return (
        <div className="avatar-selection-container">
            <h1 className="selection-title">Select Your Avatar</h1>
            <div className="avatar-grid">
                {avatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        className={`avatar-item ${
                            selectedAvatar === avatar.id ? "selected" : ""
                        }`}
                        onClick={() => handleAvatarClick(avatar)}
                    >
                        <img src={avatar.src} alt={`Avatar ${avatar.id}`} />
                        {/* Affichage du checkmark si sélectionné */}
                        {selectedAvatar === avatar.id && (
                            <div className="checkmark">✔️</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AvatarSelection;