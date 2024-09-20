"use server";

import { db } from "@/lib/db";

export const ApproveLeave = async (status: string, id: string) => {
  try {
    await db.leave.update({ where: { id }, data: { status } });
    return { success: "Data update" };
  } catch (error) {
    return { error: error };
  }
};
