package database

import (
	"database/sql"
	"time"
	"fmt"

	"github.com/google/uuid"
	"github.com/jleikdra/finn-en-dato/backend/internal/models"
)

// CreateEvent creates a new event with its associated dates
func CreateEvent(db *sql.DB, req models.CreateEventRequest) (*models.Event, error) {
	// Generate UUID for event
	eventID := uuid.New().String()

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert event
	_, err = tx.Exec(`
		INSERT INTO events (id, name, created_at)
		VALUES (?, ?, ?)
	`, eventID, req.Name, time.Now())
	if err != nil {
		return nil, fmt.Errorf("failed to insert event: %w", err)
	}

	// Insert event dates
	var dates []models.EventDate
	for _, dateReq := range req.Dates {
		result, err := tx.Exec(`
			INSERT INTO event_dates (event_id, date, start_time, end_time)
			VALUES (?, ?, ?, ?)
		`, eventID, dateReq.Date, dateReq.StartTime, dateReq.EndTime)

		if err != nil {
			return nil, fmt.Errorf("failed to insert event date: %w", err)
		}

		dateID, err := result.LastInsertId()
		if err != nil {
			return nil, fmt.Errorf("failed to get last insert id: %w", err)
		}

		dates = append(dates, models.EventDate{
			ID:        int(dateID),
			EventID:   eventID,
			Date:      dateReq.Date,
			StartTime: dateReq.StartTime,
			EndTime:   dateReq.EndTime,
		})
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Return created event
	event := &models.Event{
		ID:        eventID,
		Name:      req.Name,
		CreatedAt: time.Now(),
		Dates:     dates,
	}

	return event, nil
}

// GetEvent retrieves an event by ID with its dates
func GetEvent(db *sql.DB, eventID string) (*models.Event, error) {
	// Get event details
	var event models.Event
	var createdAt string
	var finalizedDateID sql.NullInt64

	err := db.QueryRow(`
		SELECT id, name, created_at, finalized_date_id
		FROM events WHERE id = ?
	`, eventID).Scan(&event.ID, &event.Name, &createdAt, &finalizedDateID)

	if err != nil {
		return nil, err
	}

	// Parse created_at timestamp - SQLite stores it in RFC3339 format
	event.CreatedAt, err = time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		// Try alternative format with space instead of T
		event.CreatedAt, err = time.Parse("2006-01-02 15:04:05.999999999Z07:00", createdAt)
		if err != nil {
			return nil, fmt.Errorf("failed to parse created_at: %w", err)
		}
	}

	// Set finalized date ID if exists
	if finalizedDateID.Valid {
		id := int(finalizedDateID.Int64)
		event.FinalizedDateID = &id
	}

	// Get event dates
	rows, err := db.Query(`
		SELECT id, event_id, date, start_time, end_time
		FROM event_dates WHERE event_id = ?
		ORDER BY date, start_time
	`, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get event dates: %w", err)
	}
	defer rows.Close()

	var dates []models.EventDate
	for rows.Next() {
		var date models.EventDate
		err := rows.Scan(&date.ID, &date.EventID, &date.Date, &date.StartTime, &date.EndTime)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event date: %w", err)
		}
		dates = append(dates, date)
	}

	event.Dates = dates
	return &event, nil
}

// SubmitResponse submits a respondent's availability responses
func SubmitResponse(db *sql.DB, eventID string, req models.SubmitResponseRequest) error {
	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// Check if respondent already exists
	var respondentID int64
	err = tx.QueryRow(`
		SELECT id FROM respondents WHERE event_id = ? AND name = ?
	`, eventID, req.Name).Scan(&respondentID)

	if err == sql.ErrNoRows {
		// Insert new respondent
		result, err := tx.Exec(`
			INSERT INTO respondents (event_id, name, created_at)
			VALUES (?, ?, ?)
		`, eventID, req.Name, time.Now())

		if err != nil {
			return fmt.Errorf("failed to insert respondent: %w", err)
		}

		respondentID, err = result.LastInsertId()
		if err != nil {
			return fmt.Errorf("failed to get respondent id: %w", err)
		}
	} else if err != nil {
		return fmt.Errorf("failed to check existing respondent: %w", err)
	}

	// Delete existing responses for this respondent
	_, err = tx.Exec(`
		DELETE FROM responses WHERE respondent_id = ?
	`, respondentID)
	if err != nil {
		return fmt.Errorf("failed to delete existing responses: %w", err)
	}

	// Insert new responses
	for _, response := range req.Responses {
		_, err = tx.Exec(`
			INSERT INTO responses (respondent_id, event_date_id, available)
			VALUES (?, ?, ?)
		`, respondentID, response.EventDateID, response.Available)

		if err != nil {
			return fmt.Errorf("failed to insert response: %w", err)
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetEventResults gets aggregated results for an event
func GetEventResults(db *sql.DB, eventID string) (*models.EventResults, error) {
	// Get event
	event, err := GetEvent(db, eventID)
	if err != nil {
		return nil, err
	}

	// Get respondents with their responses
	respondents, err := getRespondents(db, eventID)
	if err != nil {
		return nil, err
	}

	// Calculate summary statistics
	summary := make(map[int]models.AvailabilitySummary)

	for _, date := range event.Dates {
		availableNames := []string{}
		availableCount := 0
		unavailableCount := 0

		for _, respondent := range respondents {
			for _, response := range respondent.Responses {
				if response.EventDateID == date.ID {
					if response.Available {
						availableCount++
						availableNames = append(availableNames, respondent.Name)
					} else {
						unavailableCount++
					}
					break
				}
			}
		}

		summary[date.ID] = models.AvailabilitySummary{
			EventDateID:      date.ID,
			AvailableCount:   availableCount,
			UnavailableCount: unavailableCount,
			AvailableNames:   availableNames,
		}
	}

	return &models.EventResults{
		Event:       *event,
		Respondents: respondents,
		Summary:     summary,
	}, nil
}

// getRespondents gets all respondents for an event with their responses
func getRespondents(db *sql.DB, eventID string) ([]models.Respondent, error) {
	rows, err := db.Query(`
		SELECT id, event_id, name, created_at
		FROM respondents WHERE event_id = ?
		ORDER BY created_at
	`, eventID)
	if err != nil {
		return nil, fmt.Errorf("failed to get respondents: %w", err)
	}
	defer rows.Close()

	var respondents []models.Respondent
	for rows.Next() {
		var respondent models.Respondent
		var createdAt string

		err := rows.Scan(&respondent.ID, &respondent.EventID, &respondent.Name, &createdAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan respondent: %w", err)
		}

		// Parse created_at timestamp
		respondent.CreatedAt, err = time.Parse(time.RFC3339Nano, createdAt)
		if err != nil {
			// Try alternative format with space instead of T
			respondent.CreatedAt, err = time.Parse("2006-01-02 15:04:05.999999999Z07:00", createdAt)
			if err != nil {
				return nil, fmt.Errorf("failed to parse respondent created_at: %w", err)
			}
		}

		// Get responses for this respondent
		responseRows, err := db.Query(`
			SELECT id, respondent_id, event_date_id, available
			FROM responses WHERE respondent_id = ?
		`, respondent.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get responses: %w", err)
		}

		var responses []models.Response
		for responseRows.Next() {
			var response models.Response
			err := responseRows.Scan(&response.ID, &response.RespondentID, &response.EventDateID, &response.Available)
			if err != nil {
				responseRows.Close()
				return nil, fmt.Errorf("failed to scan response: %w", err)
			}
			responses = append(responses, response)
		}
		responseRows.Close()

		respondent.Responses = responses
		respondents = append(respondents, respondent)
	}

	return respondents, nil
}

// FinalizeEvent sets the finalized date for an event
func FinalizeEvent(db *sql.DB, eventID string, eventDateID int) error {
	// Verify event date belongs to the event
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM event_dates
		WHERE id = ? AND event_id = ?
	`, eventDateID, eventID).Scan(&count)

	if err != nil {
		return fmt.Errorf("failed to verify event date: %w", err)
	}

	if count == 0 {
		return fmt.Errorf("event date does not belong to this event")
	}

	// Update event with finalized date
	_, err = db.Exec(`
		UPDATE events SET finalized_date_id = ? WHERE id = ?
	`, eventDateID, eventID)

	if err != nil {
		return fmt.Errorf("failed to finalize event: %w", err)
	}

	return nil
}