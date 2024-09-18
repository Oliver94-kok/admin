import { db } from "@/lib/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.user.findFirst({ where: { username } });
    return user;
  } catch (error) {
    return null;
  }
};

export const checkUsername = async () => {
  try {
    const user = await db.user.findMany({
      orderBy: { username: "desc" },
      where: { role: "USER" },
    });
    return user[0];
  } catch (error) {
    return null;
  }
};
