"use server";

import { db } from "@/lib/db";

export const AddTransport = async (id: string, transport: number) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! + transport;
  try {
    await db.salary.update({ where: { id }, data: { Transport: transport, total } });
    return { success: "Success ", total };
  } catch (error) {
    return { error: "error while update data" };
  }
};

export const delTransport = async (id: string) => {
  let user = await db.salary.findFirst({ where: { id } });
  if (!user) return { error: "cannot find user" };
  let total = user?.total! - user.Transport!;
  try {
    await db.salary.update({ where: { id }, data: { Transport: null, total } });
    return { success: "success ", total };
  } catch (error) {
    return { error: "error while delete" };
  }
};
