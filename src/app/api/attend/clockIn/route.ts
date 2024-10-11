import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";

export const POST = async (req: Request) => {
  const { userId } = await req.json();
  let user: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM Attends WHERE userId=${userId} AND date(clockIn) = CURDATE()`;
  let nuser = user[0];
  if (nuser)
    return Response.json(
      { clockin: nuser.clockIn, clockout: nuser.clockOut },
      { status: 201 },
    );
  return Response.json({ error: "not clock " }, { status: 400 });
};
