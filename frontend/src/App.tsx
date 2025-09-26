import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent';
import CreateEventWithCalendar from './pages/CreateEventWithCalendar';
import RespondToEvent from './pages/RespondToEvent';
import EventResults from './pages/EventResults';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to create event */}
        <Route path="/" element={<Navigate to="/create" replace />} />

        {/* Host view - create event (original version) */}
        <Route path="/create" element={<CreateEvent />} />

        {/* Host view - create event with calendar (enhanced version) */}
        <Route path="/calendar" element={<CreateEventWithCalendar />} />

        {/* Respondent view - respond to event */}
        <Route path="/event/:eventId" element={<RespondToEvent />} />

        {/* Host view - see results */}
        <Route path="/event/:eventId/results" element={<EventResults />} />

        {/* Catch all - redirect to create */}
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </Router>
  );
}

export default App;