import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const GET = async (req: Request) => {
  let data = await db.attendBranch.findMany({
    where: { users: { role: "USER", isDelete: false } },
    include: {
      users: { select: { name: true, username: true, userImg: true } },
    },
  });
  const teamA = data.filter((d) => d.team === "A");
  const teamB = data.filter((d) => d.team === "B");
  const teamC = data.filter((d) => d.team === "C");
  const teamD = data.filter((d) => d.team === "D");
  const teamE = data.filter((e) => e.team === "E");
  const teamSW = data.filter((e) => e.team === "SW");
  const teamOcean = data.filter((e) => e.team === "Ocean");
  const teamOffice = data.filter((e) => e.team === "Office");
  return Response.json({ teamA, teamB, teamC, teamD, teamE, teamSW, teamOcean ,teamOffice}, { status: 200 });
};
