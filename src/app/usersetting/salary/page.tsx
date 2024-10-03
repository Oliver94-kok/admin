import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import SalaryTable from "@/components/Tables/SalaryTable";
import { db } from "@/lib/db";
import { SalaryUser } from "@/types/salary";

export const metadata: Metadata = {
  title: "Salary Page",
};

const getData = async () => {
  "use server";
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  let data: SalaryUser[] = await db.salary.findMany({
    where: { month, year },
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
  });

  return data;
};

const Salary = async () => {
  const salary = await getData();
  return (
    <>
      <DefaultLayout>
        <SalaryTable data={salary} />
      </DefaultLayout>
    </>
  );
};

export default Salary;
