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
  try {
    const { username, password } = await req.json();
    let user = await getUserByUsernameWithAttend(username);
    if (!user) throw new Error("User not exist");
    let pass = await checkPassword(password, user.password);
    if (!pass)
      throw new Error("Username or password not match")
    if (user.isLogin)
      throw new Error("User has sign in another device")
    let token = await createSession(user.id);
    await db.user.update({ where: { id: user.id }, data: { token } });
    let branch = await db.branch.findMany({
      where: { team: user.AttendBranch?.team },
    });
    let usersRole = ['user258', 'user80', 'user77', 'user78', 'user79', 'user135 ', 'user136', 'user137', 'user187', 'user274']
    let roles = usersRole.find((e) => e === user?.username!);

    return Response.json({
      data: {
        id: user.id,
        name: user.name,
        role: roles ? "Tracker" : user.role,
        username,
        token,
        userImg: user.userImg,
        AttendBranch: user.AttendBranch,
      },
      branch,
    });
  } catch (error) {
    return Response.json({
      Error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 400 })
  }
};
