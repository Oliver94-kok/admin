"use server";

import { db } from "@/lib/db";
import { tree } from "next/dist/build/templates/app-page";

export const getDataBranch = async (team: string) => {
  if (team == "All") {
    try {
      let data = await db.branch.findMany({
        select: { id: true, code: true, team: true },
      });
      return data;
    } catch (error) {
      return null;
    }
  } else {
    try {
      let data = await db.branch.findMany({
        where: { team },
        select: { id: true, code: true, team: true },
      });
      return data;
    } catch (error) {
      return null;
    }
  }
};
export const getBranchData = async () => {
  try {
    let data = await db.branch.findMany()
    return data;
  } catch (error) {
    return null
  }
}