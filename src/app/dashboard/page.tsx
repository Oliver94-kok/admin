'use client';
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState } from "react";
import DashTable from "@/components/Tables/DashTable";
import { AttendsInterface } from "@/types/attendents";
import useSWR from 'swr'

import Loader from "@/components/common/Loader";

// export const metadata: Metadata = {
//     title: "Admin Page",
// };

import axios, { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(DateTime.now().toFormat('yyyy-MM-dd'));
    const { data, error, isLoading, mutate } = useSWR(
        `/api/attend/dashboard?date=${selectedDate}`,
        fetcher,
        {
            refreshInterval: 5000,
            revalidateOnMount: true,
        }
    );
    const handleDateChange = (newDate: string) => {
        // Convert DD/MM format to YYYY-MM-DD
        const [day, month] = newDate.split('/');
        const year = DateTime.now().year;
        const formattedDate = `${year}-${month}-${day}`;
        setSelectedDate(formattedDate);
    };
    return (

        <>
            <DefaultLayout>
                {/* {data?.data.data ? <DashTable data={data.data.data} /> : <>error</>} */}
                {isLoading ? <Loader /> : <DashTable data={data?.data || []}
                    onDateChange={handleDateChange}
                    currentDate={selectedDate} />}
            </DefaultLayout>
        </>
    );
}

export default Dashboard;