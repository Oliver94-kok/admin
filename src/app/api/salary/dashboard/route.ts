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
  let data: SalaryUser[] = await db.salary.findMany({
    where: { month, year },
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
    orderBy: { users: { username: "asc" } },
  });
  return Response.json({ salary: data }, { status: 200 });
};
