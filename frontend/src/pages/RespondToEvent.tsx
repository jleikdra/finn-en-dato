import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';

interface EventDate {
  id: number;
  event_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface Event {
  id: string;
  name: string;
  created_at: string;
  finalized_date_id?: number;
  dates: EventDate[];
}

const RespondToEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondentName, setRespondentName] = useState('');
  const [responses, setResponses] = useState<{ [key: number]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const eventData = await response.json();
        setEvent(eventData);
      } catch (err) {
        setError('Failed to load event. Please check the link.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleResponseChange = (eventDateId: number, available: boolean) => {
    setResponses(prev => ({
      ...prev,
      [eventDateId]: available
    }));
  };

  const submitResponse = async () => {
    if (!respondentName || !eventId) return;

    const responseList = Object.entries(responses).map(([eventDateId, available]) => ({
      event_date_id: parseInt(eventDateId),
      available
    }));

    if (responseList.length === 0) {
      alert('Vennligst svar på minst en dato.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${eventId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: respondentName,
          responses: responseList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit response');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Kunne ikke sende svar. Prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="alert alert-error">
          <span>{error || 'Event ikke funnet'}</span>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-success mb-4">Takk for svaret! 🎉</h2>
            <p>Ditt svar er registrert for <strong>{event.name}</strong>.</p>
            <div className="card-actions justify-center mt-6">
              <button
                className="btn btn-primary"
                onClick={() => window.location.href = `/event/${eventId}/results`}
              >
                Se alle svar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center mb-2">{event.name}</h2>
          <p className="text-center text-base-content/70 mb-6">
            Når passer det for deg?
          </p>

          {event.finalized_date_id && (
            <div className="alert alert-info mb-6">
              <span>Denne hendelsen er ferdig planlagt!</span>
            </div>
          )}

          {/* Name Input */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text">Ditt navn</span>
            </label>
            <input
              type="text"
              placeholder="Skriv inn navnet ditt..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
            />
          </div>

          {/* Date Options */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Tilgjengelighet</h3>
            {event.dates.map((date) => {
              const dateObj = new Date(date.date);
              const isFinalized = event.finalized_date_id === date.id;

              return (
                <div
                  key={date.id}
                  className={`card bg-base-200 ${isFinalized ? 'border-2 border-success' : ''}`}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {dateObj.toLocaleDateString('no-NO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {isFinalized && <span className="badge badge-success ml-2">Valgt</span>}
                        </h4>
                        <p className="text-sm text-base-content/70">
                          {date.start_time} - {date.end_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={`btn btn-sm flex-1 ${
                          responses[date.id] === true
                            ? 'btn-success'
                            : 'btn-outline btn-success'
                        }`}
                        onClick={() => handleResponseChange(date.id, true)}
                        disabled={event.finalized_date_id !== undefined}
                      >
                        ✓ Tilgjengelig
                      </button>
                      <button
                        className={`btn btn-sm flex-1 ${
                          responses[date.id] === false
                            ? 'btn-error'
                            : 'btn-outline btn-error'
                        }`}
                        onClick={() => handleResponseChange(date.id, false)}
                        disabled={event.finalized_date_id !== undefined}
                      >
                        ✕ Ikke tilgjengelig
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="card-actions justify-center">
            <button
              className="btn btn-primary w-full"
              onClick={submitResponse}
              disabled={!respondentName || isSubmitting || event.finalized_date_id !== undefined}
            >
              {isSubmitting && <span className="loading loading-spinner"></span>}
              Send svar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RespondToEvent;