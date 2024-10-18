import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

// export const PATCH = async (req: Request) => {
//   const { id } = await req.json();
//   let day = {
//     date: "18-10-2024",
//     clockIn: "2024-10-18T01:11:00.000Z",
//     clockOut: "2024-10-18T09:11:00.000Z",
//     late: 1,
//     noClockin: 0,
//   };
//   let salary = await db.salary.findFirst({ where: { id } });
//   const currentArray = Array.isArray(salary?.day) ? salary?.day : [];
//   const updatedArray = [...currentArray, day];
//   let data = await db.salary.update({
//     where: { id },
//     data: { day: updatedArray },
//   });
//   return Response.json({ data }, { status: 200 });
// };
