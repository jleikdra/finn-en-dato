import React, { useState } from 'react';
import Layout from '../components/Layout';
import CustomCalendar from '../components/CustomCalendar';
import TimePicker from '../components/TimePicker';

interface DateTimeOption {
  date: Date;
  startTime: string;
  endTime: string;
}

const CreateEvent: React.FC = () => {
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

    // Reset time selection
    setShowTimeSelection(false);
    setPendingDate(null);
    setCurrentStartTime('');
    setCurrentEndTime('');
  };

  const cancelTimeSelection = () => {
    setShowTimeSelection(false);
    setPendingDate(null);
    setCurrentStartTime('');
    setCurrentEndTime('');
  };

  const createEvent = async () => {
    if (!eventName || dateTimeOptions.length === 0) return;

    setIsLoading(true);
    try {
      // Convert DateTimeOption to the format expected by the API
      const dates = dateTimeOptions.map(dto => ({
        date: dto.date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: dto.startTime,
        endTime: dto.endTime
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
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
    toast.innerHTML = `
      <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg">
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
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
            Hendelse opprettet! 🎉
          </h2>
          <p className="text-center mb-6">
            Del lenken under med deltakerne så de kan svare på tilgjengelighet:
          </p>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden mb-6">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 focus:outline-none"
              value={`${window.location.origin}/event/${createdEventId}`}
              readOnly
            />
            <button
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 font-medium transition-colors"
              onClick={copyLink}
            >
              Kopier lenke
            </button>
          </div>
          <div className="flex justify-center mt-6">
            <button
              className="border border-primary-500 text-primary-500 hover:bg-primary-50 px-6 py-3 rounded-full font-medium transition-colors"
              onClick={() => {
                setCreatedEventId(null);
                setEventName('');
                setSelectedDates([]);
                setDateTimeOptions([]);
              }}
            >
              Lag ny hendelse
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 font-nunito">
          Hva planlegger du?
        </h1>

        {/* Event Name Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Skriv hendelsesnavn..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] bg-white font-nunito text-gray-900 placeholder-gray-500"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        {/* Calendar Component */}
        <div className="mb-6">
          <CustomCalendar
            onDateSelect={handleDateSelect}
            selectedDates={selectedDates}
          />
        </div>

        {/* Create Event Button */}
        <button
          className="w-full bg-[#6366F1] hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:cursor-not-allowed"
          onClick={createEvent}
          disabled={!eventName || dateTimeOptions.length === 0 || isLoading}
        >
          {isLoading && (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          )}
          Opprett hendelse
        </button>
      </div>

      {/* Time Selection Modal */}
      {showTimeSelection && pendingDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Velg tid for {pendingDate.toLocaleDateString('no-NO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>

              <div className="space-y-4 mb-6">
                <TimePicker
                  label="Starttid"
                  value={currentStartTime}
                  onChange={setCurrentStartTime}
                />
                <TimePicker
                  label="Sluttid"
                  value={currentEndTime}
                  onChange={setCurrentEndTime}
                />
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={cancelTimeSelection}
                >
                  Avbryt
                </button>
                <button
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={confirmTimeSelection}
                  disabled={!currentStartTime || !currentEndTime}
                >
                  Bekreft
                </button>
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default CreateEvent;