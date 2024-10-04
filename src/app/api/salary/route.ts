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

export const POST = async (req: Request) => {
  const { month, year, workingDay, userId, fine } = await req.json();
  let data = {
    userId,
    workingDay,
    year,
    month,
    fine,
  };
  let user = await db.salary.create({ data });
  return Response.json({ data }, { status: 201 });
};
