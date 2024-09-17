import { checkClockIn } from "@/data/attend";
import { db } from "@/lib/db";
import { checkFolder } from "@/lib/function";
import { AttendsInterface } from "@/types/attendents";

export const GET = async () => {
  let d = await checkFolder();

  return Response.json({ d }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { userId, clockIn } = await req.json();
  let data = {
    userId,
    clockIn,
  };
  let t = await db.attends.create({ data });
  return Response.json({ t }, { status: 201 });
};

export const PATCH = async (req: Request) => {
  const { userId, clockOut } = await req.json();
  let attend: AttendsInterface[] = await checkClockIn(userId);

  let id;
  attend.map((e) => {
    console.log("ee");
    id = e.id;
    console.log(e);
  });
  //   return Response.json({ dat: attend[0].id }, { status: 200 });
  if (attend) {
    console.log("sds", id);
    let data = {
      clockOut,
    };
    let d = await db.attends.update({
      where: { id },
      data,
    });
    return Response.json({ d }, { status: 200 });
  }
};
