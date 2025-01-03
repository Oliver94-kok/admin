'use client';
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React, { useState, useEffect } from "react";
import DashTable from "@/components/Tables/DashTable";
import { DateTime } from "luxon";
import Loader from "@/components/common/Loader";
import { getDictionary } from "@/locales/dictionary";
import axios from "axios";
import useSWR from 'swr';
import { useSession, SessionProvider } from 'next-auth/react';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const metadata: Metadata = {
    title: "Dashboard Page",
};

const Dashboard = () => {
    const session = useSession();

    const [selectedDate, setSelectedDate] = useState(DateTime.now().toFormat('yyyy-MM-dd'));
    const { data, error, isLoading } = useSWR(
        `/api/attend/dashboard?date=${selectedDate}&role=${session.data?.user.role}`,
        fetcher,
        {
            refreshInterval: 5000,
            revalidateOnMount: true,
        }
    );

    const [dictionary, setDictionary] = useState<any | null>(null); // Renamed `dict` to `dictionary`

    useEffect(() => {
        const fetchDictionary = async () => {
            const dict = await getDictionary();
            setDictionary(dict);
        };
        fetchDictionary();
    }, []);

    const handleDateChange = (newDate: string) => {
        // Convert DD/MM format to YYYY-MM-DD
        const [day, month] = newDate.split('/');
        const year = DateTime.now().year;
        const formattedDate = `${year}-${month}-${day}`;
        setSelectedDate(formattedDate);
    };

    return (
        <DefaultLayout>
            {isLoading || !dictionary ? ( // Use `dictionary` instead of `dict`
                <Loader />
            ) : (
                <DashTable
                    data={data?.data || []}
                    onDateChange={handleDateChange}
                    currentDate={selectedDate}
                    dict={dictionary} // Pass `dictionary` to `DashTable`
                />
            )}
        </DefaultLayout>
    );
};

export default Dashboard;
