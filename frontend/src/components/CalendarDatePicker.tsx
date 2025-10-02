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
    <div className="calendar-container p-3">
      <style jsx>{`
        .calendar-container :global(.react-calendar) {
          width: 100%;
          background: white;
          border: none;
          font-family: 'Nunito Sans', sans-serif;
        }

        .calendar-container :global(.react-calendar__navigation) {
          display: flex;
          height: 32px;
          margin-bottom: 0.75em;
        }

        .calendar-container :global(.react-calendar__navigation button) {
          min-width: 32px;
          background: transparent;
          border: none;
          color: #000;
          font-size: 0.875rem;
          font-weight: 400;
        }

        .calendar-container :global(.react-calendar__navigation button:hover) {
          background-color: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__navigation__label) {
          font-weight: 400;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays) {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.7rem;
          color: #000;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays__weekday) {
          padding: 0.4em;
        }

        .calendar-container :global(.react-calendar__month-view__weekdays abbr) {
          text-decoration: none;
        }

        .calendar-container :global(.react-calendar__month-view__days__day) {
          color: #000;
          padding: 0.5em;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .calendar-container :global(.react-calendar__month-view__days__day--neighboringMonth) {
          color: #d1d5db;
        }

        .calendar-container :global(.react-calendar__month-view__days__day:hover:not(:disabled)) {
          background-color: #f3f4f6;
        }

        .calendar-container :global(.react-calendar__tile--active) {
          background: #2563eb !important;
          color: white !important;
        }

        .calendar-container :global(.react-calendar__tile--active:hover) {
          background: #1d4ed8 !important;
        }

        .calendar-container :global(.react-calendar__tile:disabled) {
          color: #d1d5db;
          cursor: not-allowed;
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
        showNeighboringMonth={true}
      />
    </div>
  );
};

export default CalendarDatePicker;