"use server";
import { getUserByUsernameWithAttend } from "@/data/user";
import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/session";

export const POST = async (req: Request) => {
  try {
    const { token } = await req.json();
  const user = await db.user.findFirst({ where: { token } });
  if (!user)  throw new Error("User not exist")
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
  let usersRole = ['user77','user78','user79','user135 ','user136','user137','user187','user274']
  let roles = usersRole.find((e)=>e === user.username);
  
  let branch = await db.branch.findMany({
    where: { team: data?.AttendBranch?.team },
  });
  return Response.json({  data: {
    id: data?.id,
    name:data?.name,
    username: data?.username,
    token:data?.token,
    userImg: data?.userImg,

    isLogin: data?.isLogin,
    role: roles ? "Tracker":data?.role,
    AttendBranch: data?.AttendBranch
  }, branch }, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return Response.json({ 
      Error: error instanceof Error ? error.message : "An unknown error occurred" 
    },{status:400})
  }
};
