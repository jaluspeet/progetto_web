.PHONY: run database

all: run

run:
	node server/server.js

database:
	mysql -u root -p < server/database/database_schema.sql
