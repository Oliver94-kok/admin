import { db } from "@/lib/db";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db.user.findFirst({ where: { username } });
    return user;
  } catch (error) {
    return null;
  }
};
