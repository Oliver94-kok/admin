"use client";
import { useState } from "react";

interface DayPicker {
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

const DayPicker: React.FC<DayPicker> = ({
  value,
  defaultValue,
  inputRef,
  ...props
}) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const handleDayClick = (day: string) => {
    setSelectedDays((prevSelected) =>
      prevSelected.includes(day)
        ? prevSelected.filter((d) => d !== day) // Deselect if already selected
        : [...prevSelected, day] // Add if not selected
    );
  };

  return (
    <div className="relative">
      {/* Input Field */}
      <input
        className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-3 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
        placeholder={
          selectedDays.length > 0
            ? selectedDays.join(", ") // Display selected days
            : "Select days"
        }
        {...props}
        defaultValue={defaultValue}
        ref={inputRef}
        readOnly // Make input read-only
      />

      {/* Day Picker inside Input Wrapper */}
      <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
        <div className="flex justify-center gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`w-12 h-12 flex items-center justify-center rounded-lg font-semibold transition-colors ${selectedDays.includes(day)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden Input for Selected Days */}
      <input
        type="hidden"
        value={selectedDays.join(", ")} // Join selected days into a single string
        readOnly
      />
    </div>
  );
};

export default DayPicker;
