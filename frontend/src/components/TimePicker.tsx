import React from 'react';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Velg tid",
  disabled = false
}) => {
  // Generate time options from 06:00 to 23:00 in 15-minute intervals
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">{label}</span>
      </label>
      <select
        className="select select-bordered w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;