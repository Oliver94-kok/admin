import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    var user = await db.leave.findFirst({ where: { id } });
    console.log(user);
    return NextResponse.json(user);
  }

  return NextResponse.json(id);
};
