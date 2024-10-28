import { cronAttend } from "@/data/attend";
import { getAllUser } from "@/data/user";
import { AttendsInterface } from "@/types/attendents";

export const POST = async (req: Request) => {
  let attendTody: AttendsInterface[] = await cronAttend();
  const attendedUserIds = new Set(attendTody.map((attend) => attend?.userId));
  let user = await getAllUser();
  const absentUser = user.filter((users) => !attendedUserIds.has(users.id));
  return Response.json({ attendTody, user, absentUser }, { status: 200 });
};
