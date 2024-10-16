import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  if (userId) {
    var user = await db.attends.findMany({ where: { userId: userId! } });
    console.log(user);
    return NextResponse.json(user);
  }

  return NextResponse.json(userId);
};
