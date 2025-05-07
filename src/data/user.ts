"use server"
import { db } from "@/lib/db";
import { createSession, encrypt } from "@/lib/session";
import { User } from "@prisma/client";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.user.findFirst({ where: { username } });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserByUsernameWithAttend = async (username: string) => {
  try {
    const user = await db.user.findFirst({
      where: { username },
      include: { AttendBranch: true },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const checkUsername = async () => {
  try {
    // const user = await db.user.findMany({
    //   orderBy:[ { username: {sort:"desc"} },],
    //   where: { role: "USER" },
    // });
    const user: User[] = await db.$queryRaw`
    SELECT * FROM User where role="USER" ORDER BY CONVERT(SUBSTRING(username, 5), UNSIGNED INTEGER) DESC;
  `;
    return user[0];
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findFirst({
      where: { id },
      include: { AttendBranch: true },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const tokenCheck = async (token: string) => {
  try {
    const user = await db.user.findFirst({ where: { token } });
    let updatetoken = await createSession(user?.id!);
    await db.user.update({
      where: { id: user?.id },
      data: { token: updatetoken },
    });
    return updatetoken;
  } catch (error) {
    return null;
  }
};

export const getAllUser = async () => {
  let user = await db.user.findMany({
    select: { id: true },
    where: { role: "USER", isDelete: false },
  });
  return user;
};

export const getUserLeave = async (role: string) => {
  try {
    if (role == "ADMIN") {
      const users = await db.user.findMany({
        where: { isDelete: false, role: "USER", }, select: {
          id: true, username: true, AttendBranch: { select: { clockIn: true, clockOut: true } }
        }
      });
      const data = users.map((r) => ({
        value: r.id,
        label: r.username
      }));


      return { data, users }
    }
    const users = await db.user.findMany({
      where: { isDelete: false, role: "USER", AttendBranch: { team: role } }, select: {
        id: true, username: true, AttendBranch: { select: { clockIn: true, clockOut: true } }
      }
    });
    const data = users.map((r) => ({
      value: r.id,
      label: r.username
    }));

    return { data, users }
  } catch (error) {
    console.log("🚀 ~ getUserLeave ~ error:", error)
    return null
  }
}