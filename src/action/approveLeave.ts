"use server";

import { db } from "@/lib/db";

export const ApproveLeave = async (status: string, id: string) => {
  try {
    let a = await db.leave.update({ where: { id }, data: { status } });
    return { success: a.userId };
  } catch (error) {
    return { error: error };
  }
};
