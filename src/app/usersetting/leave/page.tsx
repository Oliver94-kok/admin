import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import LeaveTable from "@/components/Tables/LeaveTable";
import { db } from "@/lib/db";
import { LeavesInterface } from "@/types/leave";


export const metadata: Metadata = {
  title: "Leave Page",
};

const getData = async () => {
  let data: LeavesInterface[] = await db.leave.findMany({
    orderBy: { status: "desc" },
    include: {
      users: {
        select: {
          userImg: true, name: true, username: true, AttendBranch: {
            select: {
              team: true
            }
          }
        }
      },

    }
  })
  return data;
}

const Leave = async () => {
  const leave = await getData()
  return (
    <>
      <DefaultLayout>
        <LeaveTable data={leave} />
      </DefaultLayout>
    </>
  );
}

export default Leave;