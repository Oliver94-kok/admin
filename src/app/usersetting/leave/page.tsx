"use client"
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import LeaveTable from "@/components/Tables/LeaveTable";
import { db } from "@/lib/db";
import { LeavesInterface } from "@/types/leave";


// export const metadata: Metadata = {
//   title: "Leave Page",
// };
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/common/Loader";
import useSWR from "swr";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Leave = () => {
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: ['todos'],
  //   queryFn: ({ signal }) =>
  //     axios.get('/api/leave/dashboard', {
  //       signal,
  //     }),
  // });
  const { data, error, isLoading } = useSWR('/api/leave/dashboard', fetcher)

  return (
    <>
      <DefaultLayout>
        {isLoading ? <Loader /> : <LeaveTable data={data.leave} />}
      </DefaultLayout>
    </>
  );
}

export default Leave;