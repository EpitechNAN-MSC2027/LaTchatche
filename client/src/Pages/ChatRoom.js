import React from "react";

function ChatRoom({ nickname }) {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to the Chat Room</h1>
            <p>Logged in as: {nickname}</p>
            <button
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    marginTop: "10px",
                    borderRadius: "5px",
                    backgroundColor: "#FF4B2B",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={() => alert("Logout functionality can be added later!")}
            >
                Logout
            </button>
        </div>
    );
}

export default ChatRoom;