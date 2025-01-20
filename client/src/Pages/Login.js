import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../assets/logo.png";

function Login({ onConnect }) {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [particles, setParticles] = useState([]);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!nickname.trim() || !password.trim()) {
            setError(true);
            setTimeout(() => setError(false), 3000);
            return;
        }
        onConnect(nickname, password);
        navigate("/avatar-selection");
    };

    // Générer les particules
    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 5 + 2,
                    opacity: Math.random() * 0.8 + 0.2,
                    duration: Math.random() * 5 + 3,
                });
            }
            setParticles(newParticles);
        };
        generateParticles();
    }, []);

    // Focus automatique sur le champ de pseudo au chargement
    useEffect(() => {
        const inputField = document.querySelector(".login-input");
        if (inputField) {
            inputField.focus();
        }
    }, []);

    return (
        <div className="login-container">
            {/* Particules dynamiques */}
            <div className="particles-container">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            opacity: particle.opacity,
                            animationDuration: `${particle.duration}s`,
                        }}
                    ></div>
                ))}
            </div>

            {/* Boîte de connexion */}
            <div className="login-box">
                <img
                    src={logo}
                    alt="Logo"
                    className="login-logo"
                    title="La Tchatche"
                />
                <div className="input-button-container">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        className="login-input"
                        aria-label="Nickname input"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="login-input"
                        aria-label="Password input"
                        style={{ marginTop: "10px" }}
                    />
                    <button
                        onClick={handleLogin}
                        className="login-button"
                        aria-label="Connect button"
                        style={{ marginTop: "20px" }}
                    >
                        Connect
                    </button>
                </div>
                {error && (
                    <p className="login-error">
                        Please enter a valid nickname and password
                    </p>
                )}
            </div>
        </div>
    );
}

export default Login;