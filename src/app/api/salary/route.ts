import { db } from "@/lib/db";

export const GET = async () => {
  let user = await db.salary.findMany({
    where: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    include: { users: true },
  });
  return Response.json({ user }, { status: 200 });
};
