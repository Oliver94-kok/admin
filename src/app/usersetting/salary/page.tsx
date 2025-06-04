"use client";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useEffect, useState } from "react";
import SalaryTable from "@/components/Tables/SalaryTable";
import { db } from "@/lib/db";
import { SalaryUser } from "@/types/salary";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/common/Loader";
import useSWR, { mutate } from "swr";
import { DateTime } from "luxon";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const dynamic = "force-dynamic";
export const dynamicParams = true;
// Correctly set revalidate value
// export const revalidate = 1;
import { useSession, SessionProvider } from 'next-auth/react';
import { SalaryTable2 } from "@/components/Tables/salaryTable2";
const Salary = () => {
  // const session = useSession();
  // const [month, selectMonth] = useState(DateTime.now().toFormat('MM'));
  // const [year, setYear] = useState(DateTime.now().toFormat('yyyy'));
  // useEffect(() => {
  //   // Get current date
  //   const currentDate = DateTime.now();
  //   let targetMonth, targetYear;

  //   // If current date is before 6th of the month, use previous month
  //   if (currentDate.day < 6) {
  //     const previousMonth = currentDate.minus({ months: 1 });
  //     targetMonth = previousMonth.toFormat('MM');
  //     targetYear = previousMonth.toFormat('yyyy');
  //   } else {
  //     targetMonth = currentDate.toFormat('MM');
  //     targetYear = currentDate.toFormat('yyyy');
  //   }

  //   selectMonth(targetMonth);
  //   setYear(targetYear);
  // }, []);
  // const { data, error, isLoading } = useSWR(`/api/salary/dashboard?month=${month}&year=${year}`, fetcher);
  // const refreshData = () => {
  //   mutate("/api/salary/dashboard"); // Re-fetch data from the server
  // };
  // const handleMonthChange = (month: string) => {
  //   selectMonth(month);
  // };
  // const handleYearChange = (year: string) => {
  //   setYear(year);
  // };

  // if (session.data?.user.role != "ADMIN") {
  //   return (<><DefaultLayout><p className="flex justify-center items-center h-screen text-red-700">You don&apos;t have permission in this page </p> </DefaultLayout></>)
  // }

  return (
    <>
      <DefaultLayout>
        {/* {isLoading ? <Loader /> : <SalaryTable data={data.salary} onMonthChange={handleMonthChange} currentMonth={month} onYearChange={handleYearChange} currentYear={year} />} */}
        <SalaryTable2 />
      </DefaultLayout>
    </>
  );
};

export default Salary;
