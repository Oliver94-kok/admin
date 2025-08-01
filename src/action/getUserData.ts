"use server";

import { db } from "@/lib/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import { userExcel } from "@/app/usersetting/userdata/page";

dayjs.extend(utc);
dayjs.extend(timezone);
// const fetchImageBuffer = async (
//   imageUrl: string,
//   retries = 3,
//   timeout = 5000,
// ) => {
//   try {
//     const response = await axios.get(imageUrl, {
//       responseType: "arraybuffer",
//       timeout: timeout, // Set a timeout for the request
//     });
//     return Buffer.from(response.data, "base64");
//   } catch (error) {
//     if (retries > 0) {
//       console.warn(
//         `Retrying image fetch for ${imageUrl}. Retries left: ${retries - 1}`,
//       );
//       return fetchImageBuffer(imageUrl, retries - 1, timeout); // Retry the request
//     } else {
//       console.error(`Failed to fetch image from ${imageUrl}:`, error);
//       return null; // Return null if all retries fail
//     }
//   }
// };

export const getDataUser = async (
  year: number,
  month: number,
  team: string,
): Promise<userExcel[] | null> => {
  try {
    const firstDay = dayjs(`${year}-${month}-01`);
    const lastDay = firstDay.endOf("month");

    // Get all users in the team (including deleted ones, since they might have attendance data to pay)
    const users =
      team === "All"
        ? await db.attendBranch.findMany({
          orderBy: [
            { branch: "asc" }, { users: { name: "asc" } }
          ],
          select: { userId: true },
        })
        : await db.attendBranch.findMany({
          where: { team },
          select: { userId: true },
          orderBy: [
            { branch: "asc" }, { users: { name: "asc" } }
          ]
        });

    const result = await Promise.all(
      users.map(async (u) => {
        const userDetail = await db.user.findFirst({
          where: { id: u.userId },
          include: { AttendBranch: { select: { branch: true } } },
        });

        const attends = await db.attends.findMany({
          where: {
            userId: u.userId,
            dates: { gte: firstDay.toDate(), lte: lastDay.toDate() },

          },
          orderBy: { dates: "asc" },
          select: {
            img: true,
            clockIn: true,
            clockOut: true,
            dates: true,
            status: true,
            leaves: {
              select: {
                type: true,
                reason: true,
              }
            }
          },
        });

        const localizedAttends = await Promise.all(
          attends.map(async (attend) => {
            return {
              ...attend,
              // Convert to local timezone
              clockIn: attend.clockIn
                ? dayjs.utc(attend.clockIn).local().format("HH:mm")
                : null,
              clockOut: attend.clockOut
                ? dayjs.utc(attend.clockOut).local().format("HH:mm")
                : null,
              dates: dayjs(attend.dates).format("YYYY-MM-DD"),
              status: attend.status,

            };
          }),
        );

        // Only return users who have attendance data for this month
        // This ensures users without attendance are filtered out
        if (attends.length > 0) {
          return {
            name: userDetail?.name,
            branch: userDetail?.AttendBranch?.branch,
            attend: localizedAttends,
          };
        }

        // Return undefined for users with no attendance - they'll be filtered out
        return undefined;
      }),
    );

    // Filter out undefined values and ensure type safety
    return result.filter((item): item is userExcel => item !== undefined);
  } catch (error) {
    console.log("🚀 ~ error:", error)
    return null;
  }
};