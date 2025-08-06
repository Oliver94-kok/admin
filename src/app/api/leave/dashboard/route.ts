import { db } from "@/lib/db";
import { roleAdmin } from "@/lib/function";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  let data;
  if (role == "ADMIN") {
    data = await db.leave.findMany({
      where: {
        isDelete: false,
        users: {
          isDelete: false,
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
  } else {
    let team = await roleAdmin(role!);
    data = await db.leave.findMany({
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
  }


  return Response.json({ leave: data }, { status: 200 });
};
