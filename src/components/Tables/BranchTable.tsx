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
import { useSession } from "next-auth/react";

const dictionaries = {
  en: () => import('../../locales/en/lang.json').then((module) => module.default),
  zh: () => import('../../locales/zh/lang.json').then((module) => module.default),
};

interface BranchTableInterface {
  A: BranchsUser[];
  B: BranchsUser[];
  C: BranchsUser[];
  D: BranchsUser[];
  refreshData: () => void;
}
interface TeamData {
  data: BranchsUser[];
  team: string;
  page: number;
}
const BranchTable = ({ A, B, C, D, refreshData }: BranchTableInterface) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dict, setDict] = useState<any>(null); // State to hold the dictionary
  const { data: session } = useSession();


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
  // const totalPages = 4; // Since there are 3 teams (A, B, C)
  const getAccessibleTeams = (): TeamData[] => {
    const userRole = session?.user?.role?.toLowerCase();
    const allTeams = {
      'A': { data: A, team: "Team A", page: 1 },
      'B': { data: B, team: "Team B", page: 2 },
      'C': { data: C, team: "Team C", page: 3 },
      'D': { data: D, team: "Team D", page: 4 }
    };

    switch (userRole) {
      case 'admin':
        return Object.values(allTeams);
      case 'manager_a':
        return [allTeams['A']];
      case 'manager_b':
        return [allTeams['B']];
      case 'manager_c':
        return [allTeams['C']];
      case 'manager_d':
        return [allTeams['D']];
      default:
        return [];
    }
  };

  const accessibleTeams = getAccessibleTeams();
  const totalPages = accessibleTeams.length;

  // Function to get current team data
  const getCurrentTeamData = () => {
    const currentTeam = accessibleTeams.find(team => team.page === currentPage);
    return currentTeam;
  };

  // If user has no access, show message
  if (totalPages === 0) {
    return (
      <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto 
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center py-4">No access to any teams</div>
      </div>
    );
  }
  return (
    <div className="w-[1920px] h-[1280px] p-4 md:p-6 2xl:p-10 overflow-auto 
           md:w-full md:h-auto rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Render appropriate team table based on role and current page */}
      {accessibleTeams.map((teamData) => (
        currentPage === teamData.page && (
          <BranchATable
            key={teamData.team}
            data={teamData.data}
            team={teamData.team}
            refresh={refreshData}
            dict={dict}
          />
        )
      ))}

      {/* Only show pagination if user has access to multiple teams */}
      {totalPages > 1 && (
        <div className="flex justify-between px-7.5 py-7 mt-4">
          <div className="flex items-center">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === accessibleTeams[0].page}
              className={`flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] 
                ${currentPage === accessibleTeams[0].page
                  ? "cursor-not-allowed text-gray-400"
                  : "hover:bg-primary hover:text-white"}`}
            >
              {dict.dashboard.prev}
            </button>

            {/* Page Numbers - Only show accessible pages */}
            {accessibleTeams.map((team) => (
              <button
                key={team.page}
                onClick={() => setCurrentPage(team.page)}
                className={`mx-1 flex cursor-pointer items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium 
                  ${currentPage === team.page
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"}`}
              >
                {team.page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === accessibleTeams[accessibleTeams.length - 1].page}
              className={`flex cursor-pointer items-center justify-center rounded-[3px] p-[7px] px-[7px] 
                ${currentPage === accessibleTeams[accessibleTeams.length - 1].page
                  ? "cursor-not-allowed text-gray-400"
                  : "hover:bg-primary hover:text-white"}`}
            >
              {dict.dashboard.next}
            </button>
          </div>

          {/* Page Info */}
          <p className="font-medium">
            Showing {getCurrentTeamData()?.team || 'No'} of {totalPages} teams
          </p>
        </div>
      )}
    </div>
  );
};

export default BranchTable;
