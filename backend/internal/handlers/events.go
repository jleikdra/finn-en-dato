package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jleikdra/finn-en-dato/backend/internal/models"
	"github.com/jleikdra/finn-en-dato/backend/internal/database"
)

// EventHandler handles HTTP requests for events
type EventHandler struct {
	db *sql.DB
}

// NewEventHandler creates a new event handler
func NewEventHandler(db *sql.DB) *EventHandler {
	return &EventHandler{db: db}
}

// HandleEvents handles requests to /api/events
func (h *EventHandler) HandleEvents(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.createEvent(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// HandleEventsByID handles requests to /api/events/{id}
func (h *EventHandler) HandleEventsByID(w http.ResponseWriter, r *http.Request) {
	// Extract event ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/events/")
	parts := strings.Split(path, "/")
	eventID := parts[0]

	if eventID == "" {
		http.Error(w, "Event ID is required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		if len(parts) > 1 && parts[1] == "results" {
			h.getEventResults(w, r, eventID)
		} else {
			h.getEvent(w, r, eventID)
		}
	case http.MethodPost:
		if len(parts) > 1 && parts[1] == "respond" {
			h.submitResponse(w, r, eventID)
		} else {
			http.Error(w, "Invalid endpoint", http.StatusNotFound)
		}
	case http.MethodPatch:
		if len(parts) > 1 && parts[1] == "finalize" {
			h.finalizeEvent(w, r, eventID)
		} else {
			http.Error(w, "Invalid endpoint", http.StatusNotFound)
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// createEvent handles POST /api/events
func (h *EventHandler) createEvent(w http.ResponseWriter, r *http.Request) {
	var req models.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Name == "" {
		http.Error(w, "Event name is required", http.StatusBadRequest)
		return
	}
	if len(req.Dates) == 0 {
		http.Error(w, "At least one date is required", http.StatusBadRequest)
		return
	}

	// Create event in database
	event, err := database.CreateEvent(h.db, req)
	if err != nil {
		http.Error(w, "Failed to create event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}

// getEvent handles GET /api/events/{id}
func (h *EventHandler) getEvent(w http.ResponseWriter, r *http.Request, eventID string) {
	event, err := database.GetEvent(h.db, eventID)
	if err == sql.ErrNoRows {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to get event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// submitResponse handles POST /api/events/{id}/respond
func (h *EventHandler) submitResponse(w http.ResponseWriter, r *http.Request, eventID string) {
	var req models.SubmitResponseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if len(req.Responses) == 0 {
		http.Error(w, "At least one response is required", http.StatusBadRequest)
		return
	}

	// Submit response in database
	err := database.SubmitResponse(h.db, eventID, req)
	if err != nil {
		http.Error(w, "Failed to submit response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Response submitted successfully"})
}

// getEventResults handles GET /api/events/{id}/results
func (h *EventHandler) getEventResults(w http.ResponseWriter, r *http.Request, eventID string) {
	results, err := database.GetEventResults(h.db, eventID)
	if err == sql.ErrNoRows {
		http.Error(w, "Event not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to get event results: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// finalizeEvent handles PATCH /api/events/{id}/finalize
func (h *EventHandler) finalizeEvent(w http.ResponseWriter, r *http.Request, eventID string) {
	var req struct {
		EventDateID int `json:"event_date_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.EventDateID == 0 {
		http.Error(w, "Event date ID is required", http.StatusBadRequest)
		return
	}

	err := database.FinalizeEvent(h.db, eventID, req.EventDateID)
	if err != nil {
		http.Error(w, "Failed to finalize event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Event finalized successfully"})
}