"use client";
import React, { useState, useEffect, useMemo } from "react";
import { BranchsUser } from "@/types/branchs";
import { BranchATable } from "./BranchATable";
import { useSession } from "next-auth/react";
import { roleAdmin } from "@/lib/function";
import { getDataBranch } from "@/data/branch";

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
  const { data: session } = useSession();
  const [dict, setDict] = useState<any>(null);
  const [branch, setBranch] = useState<{ id: string; code: string, team: string }[] | null>(null);
  const [selectBranchs, setSelectBranchs] = useState<{ id: string; code: string, team: string }[] | null>(null);
  // Memoized accessible teams to avoid recalculating on every render
  const accessibleTeams = useMemo(() => {
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
  }, [session, A, B, C, D]);

  // Initialize current page with the first accessible team's page
  const [currentPage, setCurrentPage] = useState(() =>
    accessibleTeams.length > 0 ? accessibleTeams[0].page : 1
  );
  const getteam = (d: string) => {
    switch (d) {
      case "Team A":
        return "A";
      case "Team B":
        return "B";
      case "Team C":
        return "C";
      case "Team D":
        return "D";
      default:
        return "A"
    }
  }
  const getbranch = async () => {
    let team = await roleAdmin(session?.user.role);
    console.log("🚀 ~ getBranch ~ team:", team)
    if (session?.user.role == "ADMIN") {
      let data = await getDataBranch("All")
      let teams = getteam(team)
      let t = data?.filter((d) => d.team == teams)
      setBranch(data)
      setSelectBranchs(t || [])
      console.log("🚀 ~ getBranch ~ data:", data)
    } else {

      let data = await getDataBranch(team);
      setBranch(data)
      setSelectBranchs(data)
      console.log("🚀 ~ getBranch ~ data:", data)
    }
  }
  // Dictionary loading effect
  useEffect(() => {
    const getLocale = (): 'en' | 'zh' => {
      const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') : null;
      return (locale === 'en' || locale === 'zh') ? locale : 'en';
    };

    const locale = getLocale();
    dictionaries[locale]()
      .then((languageDict) => {
        setDict(languageDict);
      })
      .catch(error => {
        console.error('Failed to load dictionary:', error);
        // Fallback to English dictionary
        dictionaries['en']().then((languageDict) => {
          setDict(languageDict);
        });
      });
    getbranch()
  }, []);

  // Effect to update current page when accessible teams change
  useEffect(() => {
    if (accessibleTeams.length > 0) {
      // If current page is not in accessible teams, set to first accessible team's page
      const currentTeamExists = accessibleTeams.some(team => team.page === currentPage);
      if (!currentTeamExists) {
        setCurrentPage(accessibleTeams[0].page);
      }
    }
  }, [accessibleTeams, currentPage]);

  // If dictionary is loading, show loading state
  if (!dict) return <div>Loading...</div>;

  const totalPages = accessibleTeams.length;

  // Get the current team's data
  const currentTeamData = accessibleTeams.find(team => team.page === currentPage);

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
      {/* Render the current team's table */}
      {currentTeamData && (
        <BranchATable
          key={currentTeamData.team}
          data={currentTeamData.data}
          team={currentTeamData.team}
          refresh={refreshData}
          dict={dict}
          databranch={selectBranchs}
        />
      )}

      {/* Only show pagination if user has access to multiple teams */}
      {totalPages > 1 && (
        <div className="flex justify-between px-7.5 py-7 mt-4">
          <div className="flex items-center">
            {/* Prev Button */}
            <button
              onClick={() => {
                const currentIndex = accessibleTeams.findIndex(team => team.page === currentPage);
                if (currentIndex > 0) {
                  setCurrentPage(accessibleTeams[currentIndex - 1].page);
                }
              }}
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
              onClick={() => {
                const currentIndex = accessibleTeams.findIndex(team => team.page === currentPage);
                if (currentIndex < accessibleTeams.length - 1) {
                  setCurrentPage(accessibleTeams[currentIndex + 1].page);
                }
              }}
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
            Showing {currentTeamData?.team || 'No'} of {totalPages} teams
          </p>
        </div>
      )}
    </div>
  );
};

export default BranchTable;