import { db } from "@/lib/db";
import { DateTime } from "luxon";
export const GET = async () => {
  let user = await db.attendBranch.findMany();

  return Response.json({ user }, { status: 200 });
};
