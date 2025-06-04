import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const GET = async (req: Request) => {
  let data = await db.attendBranch.findMany({
    where: { users: { role: "USER", isDelete: false } },
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
  });
  const A = data.filter((d) => d.team === "A");
  const B = data.filter((d) => d.team === "B");
  const C = data.filter((d) => d.team === "C");
  const D = data.filter((d) => d.team === "D");
  const E = data.filter((e) => e.team === "E");
  const SW = data.filter((e) => e.team === "SW");
  return Response.json({ A, B, C, D, E, SW }, { status: 200 });
};
