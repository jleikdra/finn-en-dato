package main

import (
	"database/sql"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"

	"github.com/jleikdra/finn-en-dato/backend/internal/database"
	"github.com/jleikdra/finn-en-dato/backend/internal/handlers"
)

func main() {
	// db init
	db := initDatabase()

	// handler setup
	eventHandler := handlers.NewEventHandler(db)

	// routes
	mux := setupRoutes(eventHandler)

	// cors
	handler := corsMiddleware(mux)

	// server start
	log.Println("Server starting on :8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// helper functions
func initDatabase() *sql.DB {
	db, err := sql.Open("sqlite3", "./events.db")
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	err = database.CreateTables(db)
	if err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	log.Println("Database initialized successfully")
	return db
}

func setupRoutes(handler *handlers.EventHandler) *http.ServeMux {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/events", handler.HandleEvents)
	mux.HandleFunc("/api/events/", handler.HandleEventsByID)

	// Serve React frontend static files
	fs := http.FileServer(http.Dir("../frontend/build/"))
	mux.Handle("/", fs)

	return mux
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow requests from the React dev server (typically on port 3000)
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		

		next.ServeHTTP(w, r)
	})
}
