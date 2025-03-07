import { db } from "@/lib/db";
import { DateTime } from "luxon";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  const type = searchParams.get("type");
  console.log("🚀 ~ GET ~ type:", type);
  if (userId) {
    var select;
    if (type == "clock") {
      select = { clock: true };
    } else {
      select = {
        leave: true,
      };
    }
    var user = await db.notificationUser.findFirst({
      where: { userId },
      select: select,
    });
    return Response.json({ user }, { status: 200 });
  }

  return Response.json({ error: "no id" }, { status: 400 });
};
export const POST = async (req: Request) => {
  const { userId } = await req.json();
  let notify = await db.notificationUser.findFirst({
    where: { userId },
  });
  const currentArray = Array.isArray(notify?.leave) ? notify?.leave : [];
  // return notify?.leave;
  return Response.json({ data: notify?.leave }, { status: 201 });
};
