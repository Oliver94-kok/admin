"use client";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import SalaryTable from "@/components/Tables/SalaryTable";
import { db } from "@/lib/db";
import { SalaryUser } from "@/types/salary";

// export const metadata: Metadata = {
//   title: "Salary Page",
// };

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/common/Loader";
import useSWR, { mutate } from "swr";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const dynamic = "force-dynamic";
export const dynamicParams = true;
// Correctly set revalidate value
// export const revalidate = 1;
const Salary = () => {
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: ['todos'],
  //   queryFn: ({ signal }) =>
  //     axios.get('/api/salary/dashboard', {
  //       signal,
  //     }),
  // });
  const { data, error, isLoading } = useSWR("/api/salary/dashboard", fetcher);
  const refreshData = () => {
    mutate("/api/salary/dashboard"); // Re-fetch data from the server
  };
  return (
    <>
      <DefaultLayout>
        {isLoading ? <Loader /> : <SalaryTable data={data.salary} />}
      </DefaultLayout>
    </>
  );
};

export default Salary;
