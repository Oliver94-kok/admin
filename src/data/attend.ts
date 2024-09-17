import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";

interface dataAttend {
  create?: AttendsInterface;
  userId?: string;
}

export const createAttend = async ({ create }: dataAttend) => {
  let data = {
    userId: create?.userId,
    clockIn: null,
    clockOut: create?.clockOut,
  };

  let d = await db.attends.create({ data });
  return d;
};

export const checkClockIn = async (userId: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM attends WHERE userId=${userId} AND date(clockIn) = CURDATE()`;

  return a;
};
