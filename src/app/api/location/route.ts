import { db } from "@/lib/db";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    let t = dayjs(date)
    let today = new Date(t.format("YYYY-MM-DD"))
    let location = await db.locatioUsers.findMany({
      where: {
        createdAt: {
          gte: t.startOf('day').toDate(),
          lte: t.endOf('day').toDate()
        }
      },
      select: {
        id: true,
        addressIn: true,
        addressOut: true,
        userId: true,
        branch: true,
        type: true,
        timeIn: true,
        timeOut: true,
        status: true,
        users: {
          select: {
            name: true,
            userImg: true,
            username: true
          }
        }
      }
    })

    return Response.json(location, { status: 200 })
  } catch (error) {
    return Response.json(error, { status: 400 })
  }
}