import { db } from "@/lib/db";
import { roleAdmin } from "@/lib/function";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  let team = await roleAdmin(role!);
  let data = await db.leave.findMany({
    where: {
      users: {
        AttendBranch: {
          team: team!,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: {
          userImg: true,
          name: true,
          username: true,
          AttendBranch: {
            select: {
              team: true,
              branch: true,
            },
          },
        },
      },
    },
  });
  return Response.json({ leave: data }, { status: 200 });
};
