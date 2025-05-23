"use client";
import { useState, useEffect, useRef } from "react";

interface ChildProps {
  days: string | null
  setDays: React.Dispatch<React.SetStateAction<string[]>>;
}


const DayPicker = ({ days, setDays }: ChildProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement | null>(null); // Reference to the picker container
  const inputRef = useRef<HTMLInputElement | null>(null); // Reference to the input field

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((selectedDay) => selectedDay !== day));
      setDays(selectedDays.filter((selectedDay) => selectedDay !== day))
    } else {
      setSelectedDays([...selectedDays, day]);
      setDays([...selectedDays, day])
    }
  };

  const handleInputClick = () => {
    setIsPickerVisible(!isPickerVisible); // Toggle visibility of day picker
  };

  // Close the picker if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        pickerRef.current && !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerVisible(false); // Close the picker if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Attach event listener

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Clean up event listener
    };
  }, []);

  return (
    <div className="relative">

      {/* Input Field with Placeholder */}
      <input
        ref={inputRef}
        className="form-datepicker w-full rounded-[15px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
        placeholder={
          days!.length > 0
            ? days! // Display selected days in the placeholder
            : "Select days"
        }
        defaultValue={selectedDays}
        onClick={handleInputClick} // Toggle day picker visibility on input click
        readOnly // Make input read-only
      />

      {/* Day Picker (Only visible when the input is clicked) */}
      {isPickerVisible && (
        <div
          ref={pickerRef}
          className="absolute left-0 mt-1 w-150px bg-white border border-gray-300 rounded-md shadow-md p-2 z-10"
        >
          <div className="flex justify-center gap-1">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => toggleDaySelection(day)}
                className={`px-2 py-1 flex items-center justify-center rounded-md font-medium text-xs transition-colors ${selectedDays.includes(day)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Input for Selected Days */}
      <input type="hidden" value={selectedDays.join(", ")} readOnly />
    </div>
  );
};

export default DayPicker;
