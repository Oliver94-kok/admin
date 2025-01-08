import { calculateSalary } from "@/data/salary";

export const POST = async (req: Request) => {
  try {
    const { team } = await req.json();
    const result = await calculateSalary(team);
    const summary = {
      total: result,
    };
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 });
  }
};
