import React, { useState } from 'react';
import Layout from '../components/Layout';
import CalendarDatePicker from '../components/CalendarDatePicker';
import TimePicker from '../components/TimePicker';

interface DateTimeOption {
  date: Date;
  startTime: string;
  endTime: string;
}

const CreateEventWithCalendar: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateTimeOptions, setDateTimeOptions] = useState<DateTimeOption[]>([]);
  const [currentStartTime, setCurrentStartTime] = useState('');
  const [currentEndTime, setCurrentEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date) => {
    const isAlreadySelected = selectedDates.some(d => d.toDateString() === date.toDateString());

    if (isAlreadySelected) {
      // Remove the date and its time options
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
      setDateTimeOptions(dateTimeOptions.filter(dto => dto.date.toDateString() !== date.toDateString()));
    } else {
      // Start time selection for this date
      setPendingDate(date);
      setCurrentStartTime('');
      setCurrentEndTime('');
      setShowTimeSelection(true);
    }
  };

  const confirmTimeSelection = () => {
    if (!pendingDate || !currentStartTime || !currentEndTime) return;

    if (currentStartTime >= currentEndTime) {
      alert('Starttid må være før sluttid');
      return;
    }

    // Add the date to selected dates
    setSelectedDates([...selectedDates, pendingDate]);

    // Add the date-time option
    setDateTimeOptions([...dateTimeOptions, {
      date: pendingDate,
      startTime: currentStartTime,
      endTime: currentEndTime
    }]);

    // Reset
    setPendingDate(null);
    setCurrentStartTime('');
    setCurrentEndTime('');
    setShowTimeSelection(false);
  };

  const cancelTimeSelection = () => {
    setPendingDate(null);
    setCurrentStartTime('');
    setCurrentEndTime('');
    setShowTimeSelection(false);
  };

  const removeDateTime = (dateToRemove: Date) => {
    setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateToRemove.toDateString()));
    setDateTimeOptions(dateTimeOptions.filter(dto => dto.date.toDateString() !== dateToRemove.toDateString()));
  };

  const createEvent = async () => {
    if (!eventName || dateTimeOptions.length === 0) return;

    setIsLoading(true);
    try {
      const dates = dateTimeOptions.map(dto => ({
        date: dto.date.toISOString().split('T')[0], // YYYY-MM-DD format
        start_time: dto.startTime,
        end_time: dto.endTime
      }));

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: eventName,
          dates: dates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const event = await response.json();
      setCreatedEventId(event.id);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/event/${createdEventId}`;
    navigator.clipboard.writeText(link);

    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center';
    toast.innerHTML = `
      <div class="alert alert-success">
        <span>Lenke kopiert til utklippstavle!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  if (createdEventId) {
    return (
      <Layout>
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-center text-success mb-6">
              Hendelse opprettet! 🎉
            </h2>
            <p className="text-center mb-6">
              Del lenken under med deltakerne så de kan svare på tilgjengelighet:
            </p>
            <div className="form-control">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 focus:outline-none"
                  value={`${window.location.origin}/event/${createdEventId}`}
                  readOnly
                />
                <button
                  className="btn btn-primary"
                  onClick={copyLink}
                >
                  Kopier lenke
                </button>
              </div>
            </div>
            <div className="card-actions justify-center mt-6">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setCreatedEventId(null);
                  setEventName('');
                  setSelectedDates([]);
                  setDateTimeOptions([]);
                }}
              >
                Lag ny hendelse
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.open(`/event/${createdEventId}/results`, '_blank')}
              >
                Se resultater
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-sm">
        {/* Event Name */}
        <div className="w-full">
          <h1 className="text-3xl font-bold text-black mb-6 font-sans">
            Hva planlegger du?
          </h1>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="i ressursene"
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white font-sans text-sm"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Calendar Selection */}
        <div className="w-full border border-gray-300 rounded p-4 bg-white">
          <CalendarDatePicker
            onDateSelect={handleDateSelect}
            selectedDates={selectedDates}
          />
        </div>

        {/* Time Selection Modal */}
        {showTimeSelection && pendingDate && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">
                Velg tidspunkt for {pendingDate.toLocaleDateString('no-NO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TimePicker
                  label="Starttid"
                  value={currentStartTime}
                  onChange={setCurrentStartTime}
                  placeholder="Velg starttid"
                />
                <TimePicker
                  label="Sluttid"
                  value={currentEndTime}
                  onChange={setCurrentEndTime}
                  placeholder="Velg sluttid"
                />
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={cancelTimeSelection}
                >
                  Avbryt
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmTimeSelection}
                  disabled={!currentStartTime || !currentEndTime}
                >
                  Bekreft
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Date-Times */}
        {dateTimeOptions.length > 0 && (
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">
                Valgte datoer og tider ({dateTimeOptions.length})
              </h3>
              <div className="space-y-3">
                {dateTimeOptions
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((dto, index) => (
                    <div key={index} className="card bg-base-200">
                      <div className="card-body p-4 flex-row justify-between items-center">
                        <div>
                          <div className="font-semibold">
                            {dto.date.toLocaleDateString('no-NO', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-base-content/70">
                            {dto.startTime} - {dto.endTime}
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => removeDateTime(dto.date)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Event Button */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <button
              className="btn btn-primary w-full rounded-full btn-lg"
              onClick={createEvent}
              disabled={!eventName || dateTimeOptions.length === 0 || isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              Opprett hendelse med {dateTimeOptions.length} datoalternativer
            </button>
            {eventName && dateTimeOptions.length === 0 && (
              <p className="text-center text-sm text-base-content/70 mt-2">
                Velg minst en dato for å opprette hendelsen
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEventWithCalendar;