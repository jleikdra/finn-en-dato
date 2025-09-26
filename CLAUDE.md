# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a learning project. I want to build and write code myself. Your role is to guide me along the way, and answer questions I have.

## Project plan

# Event Scheduler App - Development Plan

## Project Overview

A simple event scheduling app built with Go (backend), React with TypeScript (frontend), SQLite (database), and styled with Tailwind CSS + DaisyUI.

## Tech Stack

- **Backend**: Go with net/http package
- **Database**: SQLite
- **Frontend**: React with TypeScript
- **Routing**: React Router (single-page application)
- **Styling**: Tailwind CSS (pure, no component library)
- **HTTP Client**: Axios

## Database Schema

```sql
-- Table 1: events
id (TEXT, PRIMARY KEY - UUID)
name (TEXT)
created_at (TIMESTAMP)
finalized_date_id (INTEGER, FK to event_dates.id, nullable)

-- Table 2: event_dates
id (INTEGER, PRIMARY KEY)
event_id (TEXT, FK to events.id)
date (DATE)
start_time (TIME)
end_time (TIME)

-- Table 3: respondents
id (INTEGER, PRIMARY KEY)
event_id (TEXT, FK to events.id)
name (TEXT)
created_at (TIMESTAMP)

-- Table 4: responses
id (INTEGER, PRIMARY KEY)
respondent_id (INTEGER, FK to respondents.id)
event_date_id (INTEGER, FK to event_dates.id)
available (BOOLEAN)
UNIQUE(respondent_id, event_date_id)
```

## API Endpoints

```
POST   /api/events                  - Create event with dates
GET    /api/events/:id              - Get event details
POST   /api/events/:id/respond      - Submit availability response
GET    /api/events/:id/results      - Get aggregated responses
PATCH  /api/events/:id/finalize     - Lock in final date
```

## URL Structure (React Router)

- `/` or `/create` - Host view for creating events
- `/event/:eventId` - Respondent view for submitting availability
- `/event/:eventId/results` - Host view for seeing results

## Development Phases

### Phase 1: Project Setup & Design System (Day 1)

**Backend Tasks:**

- Initialize Go module and project structure
- Set up SQLite connection
- Create database schema
- Basic HTTP server with CORS

**Frontend Tasks:**

- Create React app with TypeScript
- Install and configure Tailwind CSS
- Set up React Router
- Configure custom color palette and design tokens
- Configure proxy to backend (port 8080)
- Create base layout component

**Deliverable:** Working project skeleton with styling system

### Phase 2: Event Creation - Styled Form (Days 2-3)

**Backend Tasks:**

- POST `/api/events` endpoint
- Event model and database functions
- UUID generation for event IDs

**Frontend Tasks:**

- Host UI with custom card styling (bg-white shadow-xl rounded-lg)
- "Hva planlegger du?" heading
- Rounded input field (rounded-full border-gray-300)
- "Opprett hendelse" button (bg-primary-500 text-white)
- Loading states with custom spinner

**Test Checkpoint:** Can create styled event and verify in database

### Phase 3: Date/Time Selection with Calendar (Days 4-5)

**Frontend Tasks:**

- Integrate react-calendar with Tailwind styling
- Custom time selection component (styled select with Tailwind)
- Selected dates display as custom badges (bg-gray-100 rounded-full)
- Remove functionality for selections

**Backend Tasks:**

- Update POST endpoint to handle date/time arrays
- Create event_dates entries
- Return complete event object

**Test Checkpoint:** Multiple date/time selection with visual feedback

### Phase 4: Shareable URL Generation (Day 6)

**Backend Tasks:**

- GET `/api/events/:id` endpoint
- Return event with all dates

**Frontend Tasks:**

- Transform button to "Kopier lenke" after creation
- Copy-to-clipboard functionality
- DaisyUI toast for copy confirmation
- Smooth transitions between states
- Add `/event/:eventId` route

**Test Checkpoint:** Create event and copy shareable link

### Phase 5: Respondent View - Mobile-First (Days 7-8)

**Frontend Tasks:**

- Responsive mobile-first layout
- Name input with form-control
- Clickable date/time cards or button groups
- Visual selection states (border-primary on selected)
- Submit button with loading state

**Backend Tasks:**

- POST `/api/events/:id/respond` endpoint
- Respondent and response creation
- Database transactions for atomic updates

**Test Checkpoint:** Intuitive respondent interface on mobile

### Phase 6: Results View with Visualization (Day 9)

**Backend Tasks:**

- GET `/api/events/:id/results` endpoint
- Response aggregation logic

**Frontend Tasks:**

- Custom table for results display (border-collapse border-gray-200)
- Color-coded availability (custom badges/progress indicators)
- Avatar placeholders with bg-gray-300 rounded-full
- Highlight most popular times
- Responsive overflow handling

**Test Checkpoint:** Clear visualization of all responses

### Phase 7: Event Finalization (Day 10)

**Backend Tasks:**

- PATCH `/api/events/:id/finalize` endpoint
- Update event with selected date

**Frontend Tasks:**

- "Lås denne tiden" button with lock icon
- Confirmation modal (custom modal with backdrop-blur)
- Success state styling
- Update respondent view for finalized events
- Disable non-selected options

**Test Checkpoint:** Host can lock final time

### Phase 8: Polish & Responsive Design (Days 11-12)

**Tasks:**

- Skeleton loaders for all loading states
- Error handling with custom alert styling (bg-red-50 text-red-800)
- Empty states with helpful messages
- Dark mode toggle (optional)
- Mobile optimizations (44px tap targets)
- Keyboard navigation
- Form validation
- Timezone handling
- Cross-browser testing

## Key Styling Patterns

### Essential Styling Patterns:

- **Forms**: Custom styled inputs with focus states
- **Buttons**: Tailwind button variants with hover/active states
- **Feedback**: Custom alert components with appropriate colors
- **Layout**: Card-based layout with shadows and rounded corners
- **Data Display**: Custom table and avatar styling

### Styling Guidelines:

```jsx
// Card container
<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">

// Rounded input
<input className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />

// Primary button
<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-medium transition-colors w-full">

// Success toast
<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg">

// Clickable date card
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer
                data-[selected=true]:border-primary-500 data-[selected=true]:bg-primary-50">

// Avatar placeholder
<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
```

## Project Structure

```
/backend
  /cmd/server/main.go
  /internal
    /handlers/
    /models/
    /database/
  /go.mod

/frontend
  /src
    /components
      /host/
      /respondent/
      /shared/
    /pages/
    /services/
    /styles/
  /package.json
  /tailwind.config.js
```

## Development Tips

1. **Start Simple**: Get basic functionality working before adding complexity
2. **Test Continuously**: Test each phase before moving forward
3. **Mobile First**: Design for mobile, then enhance for desktop
4. **Use DaisyUI Docs**: Reference component examples frequently
5. **SQLite Browser**: Use DB browser for debugging
6. **API Testing**: Use Postman/curl independently from frontend
7. **Hot Reload**: Use `air` for Go, React has built-in
8. **CORS Early**: Configure CORS in Go immediately
9. **Component Reuse**: Build reusable styled components
10. **Git Commits**: Commit after each working phase

## Testing Checkpoints

- [ ] Phase 1: Both servers running, styling visible
- [ ] Phase 2: Events saved to database
- [ ] Phase 3: Multiple dates saved correctly
- [ ] Phase 4: Shareable links working
- [ ] Phase 5: Responses recorded properly
- [ ] Phase 6: Results aggregated correctly
- [ ] Phase 7: Finalization updates database
- [ ] Phase 8: Mobile responsive, error handling works

## MVP Definition

Minimum viable product includes:

- Create event with multiple date/time options
- Generate shareable link
- Collect responses from multiple users
- Display aggregated availability
- Basic mobile responsiveness
- Essential error handling

## Future Enhancements (Post-MVP)

- Email notifications
- Recurring events
- Time zone support
- Export to calendar
- Edit/delete events
- Authentication for hosts
- Comments from respondents
- Suggest optimal time automatically
