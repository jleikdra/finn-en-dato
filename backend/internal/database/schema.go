package database

import (
	"database/sql"
)

// CreateTables creates all necessary database tables for the event scheduler
func CreateTables(db *sql.DB) error {
	schema := `
	-- Table 1: events
	CREATE TABLE IF NOT EXISTS events (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		finalized_date_id INTEGER,
		FOREIGN KEY (finalized_date_id) REFERENCES event_dates(id)
	);

	-- Table 2: event_dates
	CREATE TABLE IF NOT EXISTS event_dates (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event_id TEXT NOT NULL,
		date DATE NOT NULL,
		start_time TIME NOT NULL,
		end_time TIME NOT NULL,
		FOREIGN KEY (event_id) REFERENCES events(id)
	);

	-- Table 3: respondents
	CREATE TABLE IF NOT EXISTS respondents (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event_id TEXT NOT NULL,
		name TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (event_id) REFERENCES events(id)
	);

	-- Table 4: responses
	CREATE TABLE IF NOT EXISTS responses (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		respondent_id INTEGER NOT NULL,
		event_date_id INTEGER NOT NULL,
		available BOOLEAN NOT NULL,
		UNIQUE(respondent_id, event_date_id),
		FOREIGN KEY (respondent_id) REFERENCES respondents(id),
		FOREIGN KEY (event_date_id) REFERENCES event_dates(id)
	);
	`

	_, err := db.Exec(schema)
	return err
}