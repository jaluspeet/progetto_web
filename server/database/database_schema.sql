-- SQL Script for Initializing the Database

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS note_app;

-- Use the database
USE note_app;

-- Drop existing tables if needed (optional)
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

-- Create the 'users' table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create the 'notes' table
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserire utenti admin
INSERT INTO users (username, password, is_admin) VALUES ('admin1', 'admin1', TRUE);
INSERT INTO users (username, password, is_admin) VALUES ('admin2', 'admin2', TRUE);

-- Reference Queries (for informational purposes)
-- INSERT INTO users (username, password) VALUES (?, ?);
-- SELECT * FROM users WHERE username = ?;
-- SELECT * FROM notes WHERE user_id = ?;
-- INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?);
-- UPDATE notes SET title, content = ? WHERE id = ? AND user_id = ?;
-- DELETE FROM notes WHERE id = ? AND user_id = ?;