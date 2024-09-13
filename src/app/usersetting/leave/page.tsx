import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import LeaveTable from "@/components/Tables/LeaveTable";


export const metadata: Metadata = {
  title: "Leave Page",
};

const Leave = () => {
  return (
    <>
      <DefaultLayout>
        <LeaveTable />
      </DefaultLayout>
    </>
  );
}

export default Leave;