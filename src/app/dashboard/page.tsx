import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import DashTable from "@/components/Tables/DashTable";

export const metadata: Metadata = {
    title: "Admin Page",
};

const Dashboard = () => {
    return (
        <>
            <DefaultLayout>
                <DashTable />
            </DefaultLayout>
        </>
    );
}

export default Dashboard;