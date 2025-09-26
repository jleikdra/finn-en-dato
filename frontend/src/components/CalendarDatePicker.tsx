import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarDatePickerProps {
  onDateSelect: (date: Date) => void;
  selectedDates: Date[];
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({ onDateSelect, selectedDates }) => {
  const [value, setValue] = useState<Value>(new Date());

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate =>
      selectedDate.toDateString() === date.toDateString()
    );
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    // Only apply custom styling to month view
    if (view !== 'month') return '';

    // Check if date is selected
    if (isDateSelected(date)) {
      return 'bg-primary text-primary-content rounded-lg';
    }

    // Disable past dates
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return 'text-base-content/30 cursor-not-allowed';
    }

    return 'hover:bg-base-200 rounded-lg transition-colors';
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    // Disable past dates
    return view === 'month' && date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="calendar-container">
      <style jsx>{`
        .calendar-container :global(.react-calendar) {
          width: 100%;
          background: transparent;
          border: 1px solid hsl(var(--bc) / 0.2);
          border-radius: 0.5rem;
          font-family: inherit;
          line-height: 1.125em;
        }

        .calendar-container :global(.react-calendar__navigation) {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }

        .calendar-container :global(.react-calendar__navigation button) {
          min-width: 44px;
          background: transparent;
          border: none;
          color: hsl(var(--bc));
          font-size: 1rem;
          font-weight: 500;
        }

        .calendar-container :global(.react-calendar__navigation button:hover) {
          background-color: hsl(var(--b2));
        }

        .calendar-container :global(.react-calendar__navigation button:disabled) {
          background-color: transparent;
          color: hsl(var(--bc) / 0.3);
        }

        .calendar-container :global(.react-calendar__month-view__weekdays) {
          text-align: center;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.75em;
          color: hsl(var(--bc) / 0.7);
        }

        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.5em;
        }

        .calendar-container :global(.react-calendar__month-view__days__day) {
          color: hsl(var(--bc));
          padding: 0.75em 0.5em;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .calendar-container :global(.react-calendar__month-view__days__day:hover) {
          background-color: hsl(var(--b2));
          border-radius: 0.375rem;
        }

        .calendar-container :global(.react-calendar__tile--now) {
          background: hsl(var(--b2));
          border-radius: 0.375rem;
        }

        .calendar-container :global(.react-calendar__tile--active) {
          background: hsl(var(--p));
          color: hsl(var(--pc));
          border-radius: 0.375rem;
        }

        .calendar-container :global(.react-calendar__tile--active:hover) {
          background: hsl(var(--p));
        }
      `}</style>

      <Calendar
        onChange={setValue}
        value={value}
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        locale="no-NO"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={false}
      />

      {selectedDates.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-base-content/70 mb-2">
            Valgte datoer ({selectedDates.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date, index) => (
              <div key={index} className="badge badge-primary badge-outline">
                {date.toLocaleDateString('no-NO', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDatePicker;