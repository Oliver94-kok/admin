import { db } from "@/lib/db";
import { getAllresultAttend } from "@/lib/salaryPrintService";
import { SalaryDay } from "@/types/salary";
import { JsonValue } from "@prisma/client/runtime/library";
export const POST = async (req: Request) => {
  const { data } = await req.json();
  console.log(data);
  var results = [];
  for (const id of data) {
    let salary = await db.salary.findFirst({ where: { id } });
    console.log("🚀 ~ POST ~ salary:", salary);
    let result = await getAllresultAttend(
      salary?.userId!,
      salary?.month!,
      salary?.year!,
    );
    let data = {
      salary,
      result,
    };
    results.push(data);
  }
  return Response.json({ results }, { status: 200 });
};
