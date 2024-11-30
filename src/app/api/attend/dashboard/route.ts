import { db } from "@/lib/db";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";
import dayjs from "dayjs";
import { roleAdmin } from "@/lib/function";
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);
export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const role = searchParams.get("role");

  // Validate inputs
  if (!date) {
    return Response.json({ error: "Date is required" }, { status: 400 });
  }

  // Validate role and fetch team if not admin
  let team: string | undefined;
  if (role?.toLowerCase() !== "admin") {
    try {
      // Assuming roleAdmin is a function that returns the team for a given role
      team = await roleAdmin(role!);
      
      // If no team is found, return an error
      if (!team) {
        return Response.json({ error: "Invalid role or team not found" }, { status: 403 });
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      return Response.json({ error: "Error determining team" }, { status: 500 });
    }
  }

  // Parse the target date
  const targetDate = dayjs(date).tz("Asia/Kuala_Lumpur");
  const startOfDay = targetDate.startOf("day").toISOString();
  const endOfDay = targetDate.endOf("day").toISOString();

  // Construct the query based on role
  const whereCondition = role?.toLowerCase()  === "admin" 
    ? {
        dates: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    : {
        dates: {
          gte: startOfDay,
          lte: endOfDay,
        },
        users: {
          AttendBranch: {
            team: team,
          },
        },
      };
console.log(whereCondition)
  try {
    // Fetch attendance data
    const data = await db.attends.findMany({
      where: whereCondition,
      select: {
        id: true,
        dates: true,
        clockIn: true,
        clockOut: true,
        img: true,
        locationIn: true,
        locationOut: true,
        userId: true,
        users: {
          select: {
            username: true,
            name: true,
            userImg: true,
            AttendBranch: { select: { team: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ date, data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return Response.json({ error: "Failed to retrieve attendance data" }, { status: 500 });
  }
};
