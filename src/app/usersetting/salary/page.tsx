import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import SalaryTable from "@/components/Tables/SalaryTable";

export const metadata: Metadata = {
  title: "Salary Page",
};

const Salary = () => {
  return (
    <>
      <DefaultLayout>
        <SalaryTable />
      </DefaultLayout>
    </>
  );
}

export default Salary;