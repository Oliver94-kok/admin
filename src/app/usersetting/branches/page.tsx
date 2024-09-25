import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";
import BranchTable from "@/components/Tables/BranchTable";
import { db } from "@/lib/db";
import { BranchsUser } from "@/types/branchs";

export const metadata: Metadata = {
  title: "Branches Page",
};

const getData = async () => {
  "use server"
  let data: BranchsUser[] = await db.attendBranch.findMany({ include: { users: { select: { name: true, username: true, userImg: true } } } })
  const teamA = data.filter((d) => d.team === "A");
  const teamB = data.filter(d => d.team === "B");
  const teamC = data.filter(d => d.team === "C");
  return { teamA, teamB, teamC };
}

const Branches = async () => {
  const branch = await getData()
  return (
    <>
      <DefaultLayout>
        <BranchTable A={branch.teamA} B={branch.teamB} C={branch.teamC} />
      </DefaultLayout>
    </>
  );
}

export default Branches;