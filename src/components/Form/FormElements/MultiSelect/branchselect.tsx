"use client";
import { typeData } from "@/components/Tables/BranchATable";
import React, { useEffect, useState } from "react";

interface BranchSelectGroupProps {
  onSendData: (type: typeData, data: string) => void;
  initialValue: string;
}

const BranchSelectGroup: React.FC<BranchSelectGroupProps> = ({
  onSendData,
  initialValue,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>(initialValue);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  console.log("initisl value", initialValue);
  const changeTextColor = () => {
    setIsOptionSelected(true);
  };
  useEffect(() => {
    setSelectedOption(initialValue);
  }, [initialValue]);

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
            onSendData(typeData.TEAM, e.target.value);
            changeTextColor();
          }}
          className={`relative z-10 w-full appearance-none rounded-[7px] border border-stroke bg-transparent px-11.5 py-3 pl-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 ${isOptionSelected ? "text-dark dark:text-white" : ""
            }`}
        >
          <option value="A" className="text-dark-5 dark:text-dark-6">
            A
          </option>
          <option value="B" className="text-dark-5 dark:text-dark-6">
            B
          </option>
          <option value="C" className="text-dark-5 dark:text-dark-6">
            C
          </option>
          <option value="D" className="text-dark-5 dark:text-dark-6">
            D
          </option>
          <option value="E" className="text-dark-5 dark:text-dark-6">
            E
          </option>
          <option value="SW" className="text-dark-5 dark:text-dark-6">
            SW
          </option>
          <option value="Ocean" className="text-dark-5 dark:text-dark-6">
            Ocean
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

export default BranchSelectGroup;
