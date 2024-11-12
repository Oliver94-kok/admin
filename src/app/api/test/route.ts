import { leaveForgetClockAttend } from "@/data/attend";
import { getNoClockIn } from "@/data/salary";
import { db } from "@/lib/db";

import { TimeUtils } from "@/lib/timeUtility";

export const GET = async (request: Request) => {
  let data;
};

export const POST = async (req: Request) => {
  let result = await leaveForgetClockAttend(
    "11-11-2024",
    "cm3cngpfw0001ssakhp47ajrz",
  );
  return Response.json({ result }, { status: 200 });
};
