'use client';
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import BranchTable from "@/components/Tables/BranchTable";

import Loader from "@/components/common/Loader";

// export const metadata: Metadata = {
//   title: "Branches Page",
// };

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);


const Branches = () => {
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: ['todos'],
  //   queryFn: ({ signal }) =>
  //     axios.get('/api/branch/dashboard', {
  //       signal,
  //     }),
  // });
  const { data, error, isLoading } = useSWR('/api/branch/dashboard', fetcher)
  console.log("🚀 ~ Branches ~ data:", data)
  const refreshData = () => {
    mutate("/api/branch/dashboard"); // Re-fetch data from the server  
  };
  return (

    <>
      <DefaultLayout>
        {isLoading ? <Loader /> : <BranchTable A={data.teamA} B={data.teamB} C={data.teamC} D={data.teamD} refreshData={refreshData} />}
      </DefaultLayout>
    </>
  );
}

export default Branches;