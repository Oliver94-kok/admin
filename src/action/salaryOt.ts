"use server";

import { db } from "@/lib/db";

export const AddOverTime = async (id: string, ot: number) => {
  try {
    await db.salary.update({ where: { id }, data: { overTime: ot } });
    return { success: "Success " };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delOvetime = async (id: string) => {
  try {
    await db.salary.update({ where: { id }, data: { overTime: null } });
    return { success: "success " };
  } catch (error) {
    return { error: "error while delete" };
  }
};