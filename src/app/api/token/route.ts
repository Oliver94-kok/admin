"use server";
import { getUserByUsernameWithAttend } from "@/data/user";
import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/session";

export const POST = async (req: Request) => {
  const { token } = await req.json();
  const user = await db.user.findFirst({ where: { token } });
  if (!user) return Response.json({ Error: "User not exist" }, { status: 400 });
  let detail = await decrypt(token);
  if (!detail) {
    let t = await encrypt({ userId: user.id });
    await db.user.update({ where: { id: user.id }, data: { token: t } });
    let data = await getUserByUsernameWithAttend(user.username);
    let branch = await db.branch.findMany({
      where: { team: data?.AttendBranch?.team },
    });
    return Response.json({ data, branch }, { status: 200 });
  }

  let data = await getUserByUsernameWithAttend(user.username);
  let branch = await db.branch.findMany({
    where: { team: data?.AttendBranch?.team },
  });
  return Response.json({ data, branch }, { status: 200 });
};
