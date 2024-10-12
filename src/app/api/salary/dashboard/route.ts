import { db } from "@/lib/db";
import { SalaryUser } from "@/types/salary";
export const dynamic = "force-dynamic";
export const GET = async (req: Request) => {
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  let data: SalaryUser[] = await db.salary.findMany({
    where: { month, year },
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
  });
  return Response.json({ salary: data }, { status: 200 });
};
