CREATE DATABASE IF NOT EXISTS note_app;
USE note_app;

-- drop tabelle preesistenti
DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS users;

-- tabella utenti
CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(255) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL UNIQUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- tabella note
CREATE TABLE notes (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	content TEXT NOT NULL,
	user_id INT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tabella tags
CREATE TABLE tags (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE
);

-- tabella note_tags
CREATE TABLE note_tags (
	note_id INT NOT NULL,
	tag_id INT NOT NULL,
	PRIMARY KEY (note_id, tag_id),
	FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
	FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- admin preimpostati - le password sono state criptate con bcrypt (10 pass)
INSERT INTO users (username, email, password, is_admin) VALUES
('admin1', 'admin1@example.com', '$2b$10$EPQ9n84kOljlrCbpvhktN.5OquTLF1M6mNhwKAVElL3LaWGbCpQAS', TRUE),
('admin2', 'admin2@example.com', '$2b$10$TX2FMRkzA4boFk0EjUaSEOvzm1V6Fa3R86/BnTxn5MbVpHcRjals2', TRUE);
