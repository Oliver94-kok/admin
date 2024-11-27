import { db } from "@/lib/db";
import { hashPassword } from "@/lib/function";
import { NextResponse } from "next/server";

export const GET = async () => {
  let user = await db.user.findMany({
    orderBy: { username: "asc" },
    include: { AttendBranch: true },
  });
  return Response.json({ user }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { name, username, password, role } = await req.json();
  let hash = await hashPassword(password);
  let data = {
    name,
    username,
    password: hash,
    role,
    isLogin: false,
  };
  let user = await db.user.create({ data });
  if (!user) {
    console.log(user);
    return Response.json({}, { status: 404 });
  }
  if (user.role != "ADMIN") {
    await db.notificationUser.create({ data: { userId: user.id } });
  }
  return Response.json({ user }, { status: 201 });
};
