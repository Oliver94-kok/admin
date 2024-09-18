// import { db } from "@/lib/db";
// import { hashPassword } from "@/lib/function";
// import { NextResponse } from "next/server";

// export const GET = async () => {
//   let user = await db.user.findMany({ orderBy: { username: "asc" } });
//   return Response.json({ user }, { status: 200 });
// };

// export const POST = async (req: Request) => {
//   const { name, username, password, role } = await req.json();
//   let hash = await hashPassword(password);
//   let data = {
//     name,
//     username,
//     password: hash,
//     role,
//   };
//   let user = await db.user.create({ data });
//   return Response.json({ user }, { status: 201 });
// };
