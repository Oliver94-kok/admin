'use client';
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import DashTable from "@/components/Tables/DashTable";
import { AttendsInterface } from "@/types/attendents";
import useSWR from 'swr'

import Loader from "@/components/common/Loader";

// export const metadata: Metadata = {
//     title: "Admin Page",
// };

import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Dashboard = () => {
    // const { isPending, isError, data, error } = useQuery({
    //     queryKey: ['todos'],
    //     queryFn: ({ signal }) =>
    //         axios.get('/api/attend/dashboard', {
    //             signal,
    //         }),
    // });
    const { data, error, isLoading } = useSWR('/api/attend/dashboard', fetcher)
    console.log("🚀 ~ Dashboard ~ data:", data)
    // if (isLoading) return <Loader />

    return (

        <>
            <DefaultLayout>
                {/* {data?.data.data ? <DashTable data={data.data.data} /> : <>error</>} */}
                {isLoading ? <Loader /> : <DashTable data={data.data} />}
            </DefaultLayout>
        </>
    );
}

export default Dashboard;