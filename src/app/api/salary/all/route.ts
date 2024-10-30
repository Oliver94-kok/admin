import { db } from "@/lib/db";
import { SalaryDay } from "@/types/salary";
import { JsonValue } from "@prisma/client/runtime/library";

export const POST = async (req: Request) => {
  const { initial, userId, month, year } = await req.json();
  if (initial == 1) {
    var results = await db.salary.findMany({
      where: { userId },
      select: { day: true, month: true },
    });

    var newdata: {
      month: number;
      count: {
        work: number;
        absent: number;
        leave: number;
      };
      data: JsonValue;
    }[] = [];
    let data = results.map((d) => {
      const rawData = (d.day as unknown) ?? [];
      const currentArray: SalaryDay[] = Array.isArray(rawData) ? rawData : [];
      var countAbsent = currentArray.reduce((count, day) => {
        return day.absent == 1 ? count + 1 : count;
      }, 0);
      var countLeave = currentArray.reduce((count, day) => {
        return day.leave == 1 ? count + 1 : count;
      }, 0);
      let nd = {
        month: d.month,
        count: {
          work: currentArray.length - countAbsent - countLeave,
          absent: countAbsent,
          leave: countLeave,
        },
        data: d.day,
      };
      newdata.push(nd);
    });
    return Response.json({ result: newdata }, { status: 200 });
  }
};
