import { leaveForgetClockAttend } from "@/data/attend";
import { addLeaveAttend, forEachDate } from "@/data/leave";
import { getNoClockIn } from "@/data/salary";
import { db } from "@/lib/db";
import { extractDateAndDay } from "@/lib/function";

import { TimeUtils } from "@/lib/timeUtility";
import dayjs from "dayjs";
import { DateTime } from "luxon";

export const GET = async (request: Request) => {
  let data;
};

export const POST = async (req: Request) => {
  const userId = "cm3cngpfw0001ssakhp47ajrz";
  const startLeave = dayjs("04-11-2024", "DD-MM-YYYY").format("YYYY-MM-DD");
  console.log("🚀 ~ POST ~ startLeave:", startLeave);
  console.log("🚀 ~ ApproveLeave ~ startLeave:", startLeave);
  const endLeave = dayjs("05-11-2024", "DD-MM-YYYY").format("YYYY-MM-DD");
  console.log("🚀 ~ ApproveLeave ~ endLeave:", endLeave);
  if (startLeave == endLeave) {
    console.log("masuk sni sama");
  } else {
    // forEachDate("04-11-2024", "05-11-2024", async (date) => {
    //   console.log("🚀 ~ forEachDate ~ date:", date);
    //   console.log("Date:", dayjs(date).format("YYYY-MM-DD")); // Will show 2024-11-04 and 2024-11-05
    //   let ndate = dayjs(date).format("YYYY-MM-DD");
    //   await addLeaveAttend(userId, ndate);
    // });
  }
  const dt = DateTime.fromFormat("04-11-2024", "dd-MM-yyyy");

  // Convert to desired format
  let yy = dt.toFormat("yyyy-MM-dd");
  console.log("🚀 ~ POST ~ yy:", yy);
  let time = new Date("2024-11-05");
  console.log("🚀 ~ POST ~ time:", time);
  return Response.json({ startLeave, endLeave }, { status: 200 });
};
