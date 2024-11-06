import { db } from "@/lib/db";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("month");
  console.log("🚀 ~ GET ~ date:", date);
  let data = await db.leave.findMany({
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
            },
          },
        },
      },
    },
  });
  return Response.json({ leave: data }, { status: 200 });
};
