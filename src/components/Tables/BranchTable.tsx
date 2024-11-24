"use client";
import Image from "next/image";
import { Branch } from "@/types/product";
import React, { useState, useEffect } from "react";
import Modal from "../modal";
import BranchSelectGroup from "../Form/FormElements/MultiSelect/branchselect";
import ClockinSelectGroup from "../Form/FormElements/MultiSelect/clockinselect";
import ClockoutSelectGroup from "../Form/FormElements/MultiSelect/clockoutselect";
import DatePickerOne from "../Form/FormElements/DatePicker/DatePickerOne";
import { BranchsUser } from "@/types/branchs";
import { BranchATable } from "./BranchATable";

const dictionaries = {
  en: () => import('../../locales/en/lang.json').then((module) => module.default),
  zh: () => import('../../locales/zh/lang.json').then((module) => module.default),
};
// const branchData: Branch[] = [
//   {
//     image: "/images/product/product-01.png",
//     username: "001",
//     name: "tester",
//     branches: "Electronics",
//     setclockin: "08:00",
//     setclockout: "16:00",
//     starton: "Sep 2, 2024",
//   },
//   {
//     image: "/images/product/product-01.png",
//     username: "006",
//     name: "test",
//     branches: "Electronics",
//     setclockin: "08:00",
//     setclockout: "16:00",
//     starton: "Sep 2, 2024",
//   },
//   {
//     image: "/images/product/product-01.png",
//     username: "005",
//     name: "tes",
//     branches: "Electronics",
//     setclockin: "08:00",
//     setclockout: "16:00",
//     starton: "Sep 2, 2024",
//   },
//   {
//     image: "/images/product/product-01.png",
//     username: "004",
//     name: "tester",
//     branches: "Electronics",
//     setclockin: "08:00",
//     setclockout: "16:00",
//     starton: "Sep 2, 2024",
//   },
//   {
//     image: "/images/product/product-01.png",
//     username: "002",
//     name: "tester",
//     branches: "Electronics",
//     setclockin: "08:00",
//     setclockout: "16:00",
//     starton: "Sep 2, 2024",
//   },
// ];

interface BranchTableInterface {
  A: BranchsUser[];
  B: BranchsUser[];
  C: BranchsUser[];
  D: BranchsUser[];
  refreshData: () => void;
}

const BranchTable = ({ A, B, C, D, refreshData }: BranchTableInterface) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dict, setDict] = useState<any>(null); // State to hold the dictionary
  const totalPages = 4; // Since there are 4 teams (A, B, C, D)

  // Function to get the current locale from localStorage or fallback to 'en'
  const getLocale = (): 'en' | 'zh' => {
    // Get the locale from localStorage, default to 'en' if null
    const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
    return (locale === 'en' || locale === 'zh') ? locale : 'en'; // Ensure it's either 'en' or 'zh'
  };

  // Dynamically load the dictionary based on the current locale
  useEffect(() => {
    const locale = getLocale(); // Get the valid locale
    dictionaries[locale]().then((languageDict) => {
      setDict(languageDict); // Set the dictionary in the state
    });
  }, []);

  if (!dict) return <div>Loading...</div>; // Show a loading state until the dictionary is loaded

  return (
    <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto 
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {currentPage === 1 && <BranchATable data={A} team="Team A" refresh={refreshData} dict={dict} />}
      {currentPage === 2 && <BranchATable data={B} team="Team B" refresh={refreshData} dict={dict} />}
      {currentPage === 3 && <BranchATable data={C} team="Team C" refresh={refreshData} dict={dict} />}
      {currentPage === 4 && <BranchATable data={D} team="Team D" refresh={refreshData} dict={dict} />}

      {/* Pagination Controls */}
      <div className="flex justify-between px-7.5 py-7 mt-4">
        <div className="flex items-center">
          {/* Prev Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] 
              ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "hover:bg-primary hover:text-white"}`}
          >
            {dict.dashboard.prev}
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium 
                ${currentPage === i + 1 ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] 
              ${currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "hover:bg-primary hover:text-white"}`}
          >
            {dict.dashboard.next}
          </button>
        </div>

        {/* Page Info */}
        <p className="font-medium">
          Showing {currentPage} of {totalPages} pages
        </p>
      </div>
    </div>
  );
};

export default BranchTable;
