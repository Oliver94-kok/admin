import { db } from "@/lib/db";
import { SalaryUser } from "@/types/salary";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const m = searchParams.get("month");
  const y = searchParams.get("year");
  let month = parseInt(m!);
  let year = parseInt(y!);
  let data = await db.salary.findMany({
    where: { month, year, users: { isDelete: false } },
    include: {
      users: { select: { name: true, username: true, userImg: true, AttendBranch: { select: { team: true, branch: true } } } },
    },
    orderBy: { users: { AttendBranch: { branch: 'asc' } } },
  });
  return Response.json({ salary: data }, { status: 200 });
};
