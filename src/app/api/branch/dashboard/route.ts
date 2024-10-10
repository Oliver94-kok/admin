import { db } from "@/lib/db";

export const GET = async (req: Request) => {
  let data = await db.attendBranch.findMany({
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
  });
  const teamA = data.filter((d) => d.team === "A");
  const teamB = data.filter((d) => d.team === "B");
  const teamC = data.filter((d) => d.team === "C");
  const teamD = data.filter((d) => d.team === "D");
  return Response.json({ teamA, teamB, teamC, teamD }, { status: 200 });
};
