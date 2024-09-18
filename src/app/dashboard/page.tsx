import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import DashTable from "@/components/Tables/DashTable";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";

export const metadata: Metadata = {
    title: "Admin Page",
};
// const getAllData = async () => {

//     let data: AttendsInterface[] = await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
//     FROM attends AS a
//     JOIN user AS u ON a.userId = u.id
//     WHERE date(a.clockIn) = CURDATE() OR date(a.clockOut) = CURDATE()`;
//     return data;
// }
const Dashboard = async () => {
    // const attends = await getAllData()
    return (
        <>
            <DefaultLayout>
                {/* <DashTable data={attends} />*/}
                <DashTable />
            </DefaultLayout>
        </>
    );
}

export default Dashboard;