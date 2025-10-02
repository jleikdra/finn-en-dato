import React, { useState } from 'react';

interface CustomCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDates: Date[];
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onDateSelect, selectedDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const isDateSelected = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const checkDate = new Date(year, month, day);
    return selectedDates.some(d =>
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === day
    );
  };

  const isPastDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const checkDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDateClick = (day: number) => {
    if (isPastDate(day)) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDate = new Date(year, month, day);
    onDateSelect(selectedDate);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Create array of day cells
  const dayCells = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isDateSelected(day);
    const past = isPastDate(day);

    dayCells.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={past}
        className={`
          p-2 rounded-lg text-sm font-medium transition-colors
          ${selected
            ? 'bg-[#6366F1] text-white'
            : past
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
          }
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold text-base text-gray-900 capitalize">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
        <span>SUN</span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayCells}
      </div>
    </div>
  );
};

export default CustomCalendar;
