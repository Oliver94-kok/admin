import { db } from "@/lib/db";

export const GET = async (req: Request) => {
  let data = await db.leave.findMany({
    orderBy: { status: "desc" },
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
