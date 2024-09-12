import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import BranchTable from "@/components/Tables/BranchTable";

export const metadata: Metadata = {
  title: "Admin Page",
};

const Branches = () => {
  return (
    <>
      <DefaultLayout>
        <BranchTable />
      </DefaultLayout>
    </>
  );
}

export default Branches;