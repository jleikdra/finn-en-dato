package models

import (
	"database/sql"
	"time"
)

// Event represents a scheduled event with multiple possible dates
type Event struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	CreatedAt        time.Time  `json:"created_at"`
	FinalizedDateID  *int       `json:"finalized_date_id,omitempty"`
	Dates            []EventDate `json:"dates,omitempty"`
	Respondents      []Respondent `json:"respondents,omitempty"`
}

// EventDate represents a possible date/time option for an event
type EventDate struct {
	ID        int    `json:"id"`
	EventID   string `json:"event_id"`
	Date      string `json:"date"`      // YYYY-MM-DD format
	StartTime string `json:"start_time"` // HH:MM format
	EndTime   string `json:"end_time"`   // HH:MM format
}

// Respondent represents someone who can respond to an event
type Respondent struct {
	ID        int       `json:"id"`
	EventID   string    `json:"event_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Responses []Response `json:"responses,omitempty"`
}

// Response represents a respondent's availability for a specific event date
type Response struct {
	ID            int  `json:"id"`
	RespondentID  int  `json:"respondent_id"`
	EventDateID   int  `json:"event_date_id"`
	Available     bool `json:"available"`
}

// CreateEventRequest represents the request payload for creating a new event
type CreateEventRequest struct {
	Name  string             `json:"name"`
	Dates []CreateDateRequest `json:"dates"`
}

// CreateDateRequest represents a date option when creating an event
type CreateDateRequest struct {
	Date      string `json:"date"`       // YYYY-MM-DD format
	StartTime string `json:"start_time"` // HH:MM format
	EndTime   string `json:"end_time"`   // HH:MM format
}

// SubmitResponseRequest represents the request payload for submitting availability
type SubmitResponseRequest struct {
	Name      string            `json:"name"`
	Responses []ResponseRequest `json:"responses"`
}

// ResponseRequest represents a single availability response
type ResponseRequest struct {
	EventDateID int  `json:"event_date_id"`
	Available   bool `json:"available"`
}

// EventResults represents aggregated results for an event
type EventResults struct {
	Event       Event                    `json:"event"`
	Respondents []Respondent            `json:"respondents"`
	Summary     map[int]AvailabilitySummary `json:"summary"` // keyed by event_date_id
}

// AvailabilitySummary shows availability stats for a specific event date
type AvailabilitySummary struct {
	EventDateID     int      `json:"event_date_id"`
	AvailableCount  int      `json:"available_count"`
	UnavailableCount int     `json:"unavailable_count"`
	AvailableNames  []string `json:"available_names"`
}

// NullString helper for database nullable strings
func NullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

// NullInt helper for database nullable integers
func NullInt(i *int) sql.NullInt64 {
	if i == nil {
		return sql.NullInt64{}
	}
	return sql.NullInt64{Int64: int64(*i), Valid: true}
}