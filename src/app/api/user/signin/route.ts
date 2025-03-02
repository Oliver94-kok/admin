"use server";
import { getUserByUsernameWithAttend } from "@/data/user";
import { db } from "@/lib/db";
import { checkPassword } from "@/lib/function";
import { createSession } from "@/lib/session";

export const GET = async () => {
  //   let user = await db.user.findMany({ orderBy: { username: "asc" } });
  return Response.json({ user: "ss" }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { username, password } = await req.json();
  let user = await getUserByUsernameWithAttend(username);
  if (!user) return Response.json({ Error: "User not exist" }, { status: 400 });
  let pass = await checkPassword(password, user.password);
  if (!pass)
    return Response.json(
      { Error: "Username or password not match" },
      { status: 400 },
    );
  if (user.isLogin)
    return Response.json(
      { error: "User has sign in another device" },
      { status: 400 },
    );
  let token = await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { token } });
  let branch = await db.branch.findMany({
    where: { team: user.AttendBranch?.team },
  });
  return Response.json({
    data: {
      id: user.id,
      name: user.name,
      role:user.role,
      username,
      token,
      userImg: user.userImg,
      AttendBranch: user.AttendBranch,
    },
    branch,
  });
};
