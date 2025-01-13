CREATE DATABASE IF NOT EXISTS irc_db;
USE irc_db;

CREATE TABLE IF NOT EXISTS Users(
    nickname VARCHAR(255) PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS Channels(
    channelName VARCHAR(255) PRIMARY KEY NOT NULL,
    alive BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS Pairs(
    nickname VARCHAR(255),
    channelName VARCHAR(255),
    PRIMARY KEY(nickname,channelName),
    FOREIGN KEY(nickname) REFERENCES Users(nickname) ON DELETE CASCADE,
    FOREIGN KEY(channelName) REFERENCES Channels(channelName) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Messages(
    texteMessage VARCHAR(255) NOT NULL,
    dateMessage DATETIME NOT NULL,
    nickname VARCHAR(255),
    channelName VARCHAR(255),
    FOREIGN KEY(nickname) REFERENCES Users(nickname) ON DELETE CASCADE,
    FOREIGN KEY(channelName) REFERENCES Channels(channelName) ON DELETE CASCADE
);