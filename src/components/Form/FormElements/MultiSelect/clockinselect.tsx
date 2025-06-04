"use client";
import { typeData } from "@/components/Tables/BranchATable";
import React, { useState } from "react";

interface ClockinSelectGroupProps {
  onSendData: (type: typeData, data: string) => void;
  initialValue: string;
}

const ClockinSelectGroup: React.FC<ClockinSelectGroupProps> = ({
  onSendData,
  initialValue,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(initialValue);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div>
      {/* <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        Select Country
      </label> */}

      <div className="relative rounded-[7px] bg-white dark:bg-dark-2">
        <select
          // defaultValue={initialValue}
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            onSendData(typeData.CLOCKIN, e.target.value);
            changeTextColor();
          }}
          className={`relative z-10 w-full appearance-none rounded-[7px] border border-stroke bg-transparent px-11.5 py-3 pl-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 ${isOptionSelected ? "text-dark dark:text-white" : ""
            }`}
        >
          <option value="-" className="text-dark-5 dark:text-dark-6">
            -
          </option>
          <option value="00:00" className="text-dark-5 dark:text-dark-6">
            00:00
          </option>
          <option value="00:30" className="text-dark-5 dark:text-dark-6">
            00:30
          </option>
          <option value="01:00" className="text-dark-5 dark:text-dark-6">
            01:00
          </option>
          <option value="01:30" className="text-dark-5 dark:text-dark-6">
            01:30
          </option>
          <option value="02:00" className="text-dark-5 dark:text-dark-6">
            02:00
          </option>
          <option value="02:30" className="text-dark-5 dark:text-dark-6">
            02:30
          </option>
          <option value="03:00" className="text-dark-5 dark:text-dark-6">
            03:00
          </option>
          <option value="03:30" className="text-dark-5 dark:text-dark-6">
            03:30
          </option>
          <option value="04:00" className="text-dark-5 dark:text-dark-6">
            04:00
          </option>
          <option value="04:30" className="text-dark-5 dark:text-dark-6">
            04:30
          </option>
          <option value="05:00" className="text-dark-5 dark:text-dark-6">
            05:00
          </option>
          <option value="05:30" className="text-dark-5 dark:text-dark-6">
            05:30
          </option>
          <option value="06:00" className="text-dark-5 dark:text-dark-6">
            06:00
          </option>
          <option value="06:30" className="text-dark-5 dark:text-dark-6">
            06:30
          </option>
          <option value="07:00" className="text-dark-5 dark:text-dark-6">
            07:00
          </option>
          <option value="07:30" className="text-dark-5 dark:text-dark-6">
            07:30
          </option>
          <option value="08:00" className="text-dark-5 dark:text-dark-6">
            08:00
          </option>
          <option value="08:30" className="text-dark-5 dark:text-dark-6">
            08:30
          </option>
          <option value="09:00" className="text-dark-5 dark:text-dark-6">
            09:00
          </option>
          <option value="09:30" className="text-dark-5 dark:text-dark-6">
            09:30
          </option>
          <option value="10:00" className="text-dark-5 dark:text-dark-6">
            10:00
          </option>
          <option value="10:30" className="text-dark-5 dark:text-dark-6">
            10:30
          </option>
          <option value="11:00" className="text-dark-5 dark:text-dark-6">
            11:00
          </option>
          <option value="11:30" className="text-dark-5 dark:text-dark-6">
            11:30
          </option>
          <option value="12:00" className="text-dark-5 dark:text-dark-6">
            12:00
          </option>
          <option value="12:30" className="text-dark-5 dark:text-dark-6">
            12:30
          </option>
          <option value="13:00" className="text-dark-5 dark:text-dark-6">
            13:00
          </option>
          <option value="13:30" className="text-dark-5 dark:text-dark-6">
            13:30
          </option>
          <option value="14:00" className="text-dark-5 dark:text-dark-6">
            14:00
          </option>
          <option value="14:30" className="text-dark-5 dark:text-dark-6">
            14:30
          </option>
          <option value="15:00" className="text-dark-5 dark:text-dark-6">
            15:00
          </option>
          <option value="15:30" className="text-dark-5 dark:text-dark-6">
            15:30
          </option>
          <option value="16:00" className="text-dark-5 dark:text-dark-6">
            16:00
          </option>
          <option value="16:30" className="text-dark-5 dark:text-dark-6">
            16:30
          </option>
          <option value="17:00" className="text-dark-5 dark:text-dark-6">
            17:00
          </option>
          <option value="17:30" className="text-dark-5 dark:text-dark-6">
            17:30
          </option>
          <option value="18:00" className="text-dark-5 dark:text-dark-6">
            18:00
          </option>
          <option value="18:30" className="text-dark-5 dark:text-dark-6">
            18:30
          </option>
          <option value="19:00" className="text-dark-5 dark:text-dark-6">
            19:00
          </option>
          <option value="19:30" className="text-dark-5 dark:text-dark-6">
            19:30
          </option>
          <option value="20:00" className="text-dark-5 dark:text-dark-6">
            20:00
          </option>
          <option value="20:30" className="text-dark-5 dark:text-dark-6">
            20:30
          </option>
          <option value="21:00" className="text-dark-5 dark:text-dark-6">
            21:00
          </option>
          <option value="21:30" className="text-dark-5 dark:text-dark-6">
            21:30
          </option>
          <option value="22:00" className="text-dark-5 dark:text-dark-6">
            22:00
          </option>
          <option value="22:30" className="text-dark-5 dark:text-dark-6">
            22:30
          </option>
          <option value="23:00" className="text-dark-5 dark:text-dark-6">
            23:00
          </option>
          <option value="23:30" className="text-dark-5 dark:text-dark-6">
            23:30
          </option>
        </select>

        <span className="absolute right-4 top-1/2 -translate-y-1/2 transform text-dark-4 dark:text-dark-6">
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

export default ClockinSelectGroup;
