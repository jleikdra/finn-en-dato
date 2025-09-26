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

interface Response {
  id: number;
  respondent_id: number;
  event_date_id: number;
  available: boolean;
}

interface Respondent {
  id: number;
  event_id: string;
  name: string;
  created_at: string;
  responses: Response[];
}

interface Event {
  id: string;
  name: string;
  created_at: string;
  finalized_date_id?: number;
  dates: EventDate[];
}

interface AvailabilitySummary {
  event_date_id: number;
  available_count: number;
  unavailable_count: number;
  available_names: string[];
}

interface EventResults {
  event: Event;
  respondents: Respondent[];
  summary: { [key: string]: AvailabilitySummary };
}

const EventResults: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [results, setResults] = useState<EventResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/results`);
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError('Could not load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [eventId]);

  const finalizeEvent = async (eventDateId: number) => {
    if (!eventId || !confirm('Er du sikker på at du vil låse denne datoen?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_date_id: eventDateId }),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize event');
      }

      // Refresh the results
      window.location.reload();
    } catch (error) {
      console.error('Error finalizing event:', error);
      alert('Kunne ikke låse datoen. Prøv igjen.');
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

  if (error || !results) {
    return (
      <Layout>
        <div className="alert alert-error">
          <span>{error || 'Kunne ikke laste resultater'}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center text-2xl mb-2">
              {results.event.name}
            </h2>
            <p className="text-base-content/70">
              {results.respondents.length} personer har svart
            </p>
            {results.event.finalized_date_id && (
              <div className="badge badge-success">Ferdig planlagt</div>
            )}
          </div>
        </div>

        {/* Results by Date */}
        <div className="space-y-4">
          {results.event.dates
            .sort((a, b) => {
              // Sort finalized date first, then by available count
              const summaryA = results.summary[a.id.toString()];
              const summaryB = results.summary[b.id.toString()];

              if (results.event.finalized_date_id === a.id) return -1;
              if (results.event.finalized_date_id === b.id) return 1;

              return summaryB.available_count - summaryA.available_count;
            })
            .map((date) => {
              const summary = results.summary[date.id.toString()];
              const totalResponses = summary.available_count + summary.unavailable_count;
              const availabilityPercentage = totalResponses > 0
                ? Math.round((summary.available_count / totalResponses) * 100)
                : 0;
              const isFinalized = results.event.finalized_date_id === date.id;
              const dateObj = new Date(date.date);

              return (
                <div
                  key={date.id}
                  className={`card bg-base-100 shadow-lg ${
                    isFinalized ? 'border-2 border-success' : ''
                  }`}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {dateObj.toLocaleDateString('no-NO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {isFinalized && (
                            <span className="badge badge-success ml-2">Valgt dato</span>
                          )}
                        </h3>
                        <p className="text-base-content/70">
                          {date.start_time} - {date.end_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="stat-value text-2xl text-success">
                          {summary.available_count}
                        </div>
                        <div className="stat-desc">av {totalResponses}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="bg-success h-3 rounded-full"
                        style={{ width: `${availabilityPercentage}%` }}
                      ></div>
                    </div>

                    {/* Available Names */}
                    {summary.available_names.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Tilgjengelige:</p>
                        <div className="flex flex-wrap gap-2">
                          {summary.available_names.map((name, index) => (
                            <div key={index} className="badge badge-success badge-outline">
                              {name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Finalize Button */}
                    {!results.event.finalized_date_id && summary.available_count > 0 && (
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => finalizeEvent(date.id)}
                        >
                          🔒 Lås denne tiden
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Detailed Responses Table */}
        {results.respondents.length > 0 && (
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title mb-4">Detaljert oversikt</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Navn</th>
                      {results.event.dates.map((date) => (
                        <th key={date.id} className="text-center min-w-24">
                          {new Date(date.date).toLocaleDateString('no-NO', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          <br />
                          <span className="text-xs">
                            {date.start_time}-{date.end_time}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.respondents.map((respondent) => (
                      <tr key={respondent.id}>
                        <td className="font-semibold">{respondent.name}</td>
                        {results.event.dates.map((date) => {
                          const response = respondent.responses.find(
                            (r) => r.event_date_id === date.id
                          );
                          return (
                            <td key={date.id} className="text-center">
                              {response?.available === true ? (
                                <span className="text-success text-xl">✓</span>
                              ) : response?.available === false ? (
                                <span className="text-error text-xl">✗</span>
                              ) : (
                                <span className="text-base-content/30">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventResults;