"use client";
import React, { useState } from "react";

const ClockoutSelectGroup: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div>
      {/* <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        Select Country
      </label> */}

      <div className="relative z-20 rounded-[7px] bg-white dark:bg-dark-2">

        <select
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            changeTextColor();
          }}
          className={`relative z-10 w-full appearance-none rounded-[7px] border border-stroke bg-transparent pl-3 px-11.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 ${isOptionSelected ? "text-dark dark:text-white" : ""
            }`}
        >
          <option value="UnitedStates" className="text-dark-5 dark:text-dark-6">
            16:00
          </option>
          <option value="UK" className="text-dark-5 dark:text-dark-6">
            20:00
          </option>
        </select>

        {/* Dropdown arrow */}
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-4 dark:text-dark-6">
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ClockoutSelectGroup;
