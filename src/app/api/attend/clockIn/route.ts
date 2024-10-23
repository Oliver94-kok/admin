import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";

export const POST = async (req: Request) => {
  const { userId } = await req.json();
  let user: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userId} AND (date(clockIn) = CURDATE() OR date(clockOut) = CURDATE() )`;
  let nuser = user[0];
  if (nuser)
    return Response.json(
      {
        id: nuser.id,
        clockin: nuser.clockIn,
        clockout: nuser.clockOut,
        locationIn: nuser.locationIn,
        locationOut: nuser.locationOut,
      },
      { status: 201 },
    );
  return Response.json({ error: "not clock " }, { status: 400 });
};
