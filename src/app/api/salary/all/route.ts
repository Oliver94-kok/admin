import { db } from "@/lib/db";
import { SalaryDay } from "@/types/salary";
import { JsonValue } from "@prisma/client/runtime/library";

// export const POST = async (req: Request) => {
//   const { initial, userId, month, year } = await req.json();
//   if (initial == 1) {
//     var results = await db.salary.findMany({
//       where: { userId },
//       select: { day: true, month: true },
//     });

//     var newdata: {
//       month: number;
//       count: {
//         work: number;
//         absent: number;
//         leave: number;
//       };
//       data: JsonValue;
//     }[] = [];
//     let data = results.map((d) => {
//       const rawData = (d.day as unknown) ?? [];
//       const currentArray: SalaryDay[] = Array.isArray(rawData) ? rawData : [];
//       var countAbsent = currentArray.reduce((count, day) => {
//         return day.absent == 1 ? count + 1 : count;
//       }, 0);
//       var countLeave = currentArray.reduce((count, day) => {
//         return day.leave == 1 ? count + 1 : count;
//       }, 0);
//       let nd = {
//         month: d.month,
//         count: {
//           work: currentArray.length - countAbsent - countLeave,
//           absent: countAbsent,
//           leave: countLeave,
//         },
//         data: d.day,
//       };
//       newdata.push(nd);
//     });
//     return Response.json({ result: newdata }, { status: 200 });
//   }
// };

export const POST = async (req: Request) => {
  const { data } = await req.json();
  let newdata: {
    id: string | undefined;
    dataAbsent: Omit<SalaryDay, "fine" | "late">[];
    dataLeave: Omit<SalaryDay, "fine" | "late">[];
  }[] = [];

  for (const d of data) {
    let result = await db.salary.findFirst({ where: { id: d } });
    const rawData = (result?.day as unknown) ?? [];
    const currentArry: SalaryDay[] = Array.isArray(rawData) ? rawData : [];
    var dataAbsent = currentArry.filter((c) => c.absent == 1);
    var dataLeave = currentArry.filter((c) => c.leave == 1);
    newdata.push({
      id: result?.id,
      dataAbsent,
      dataLeave,
    });
  }

  return Response.json({ newdata }, { status: 200 });
};
