import { calculateSalary, excelData } from "@/data/salary";
import dayjs from "dayjs";

export const POST = async (req: Request) => {
  try {
    let result = await excelData(2, 2025);
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 });
  }
};
