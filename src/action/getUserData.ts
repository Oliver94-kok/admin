"use server";

import { db } from "@/lib/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";

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
) => {
  try {
    const firstDay = dayjs(`${year}-${month}-01`);
    const lastDay = firstDay.endOf("month");
    // Adjust the query to handle "All Team" case
    const users =
      team === "All"
        ? await db.attendBranch.findMany({
            select: { userId: true },
          })
        : await db.attendBranch.findMany({
            where: { team },
            select: { userId: true },
          });

    let result = await Promise.all(
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
          select: {
            img: true,
            clockIn: true,
            clockOut: true,
            dates: true,
          },
        });
        // const localizedAttends = attends.map((attend) => ({
        //   ...attend,
        //   // Assuming you want to convert to the system's local timezone
        //   clockIn: attend.clockIn
        //     ? dayjs.utc(attend.clockIn).local().format("h:mm A")
        //     : null,
        //   clockOut: attend.clockOut
        //     ? dayjs.utc(attend.clockOut).local().format("h:mm A")
        //     : null,
        //   dates: dayjs(attend.dates).format("YYYY-MM-DD"),
        //   // If you want to specify a specific timezone (e.g., 'Asia/Jakarta')
        //   // clockIn: attend.clockIn ? dayjs.utc(attend.clockIn).tz('Asia/Jakarta').toDate() : null
        // }));
        const localizedAttends = await Promise.all(
          attends.map(async (attend) => {
            // Fetch the image buffer from the URL
            // let imageBuffer;
            // if (attend.img != null) {
            //   imageBuffer = await fetchImageBuffer(
            //     `http://image.ocean00.com${attend.img}`,
            //   );
            // }

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
              // img: imageBuffer, // Replace the image URL with the buffer
            };
          }),
        );

        return {
          name: userDetail?.name,
          branch: userDetail?.AttendBranch?.branch,
          attend: localizedAttends,
        };
      }),
    );
    return result;
  } catch (error) {
    return null;
  }
};
