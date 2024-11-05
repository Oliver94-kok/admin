import { db } from "@/lib/db";
import { updateSalaryDays } from "@/lib/function";

export const GET = async (request: Request) => {
  
   let data 
  

  
};

export const POST = async (req: Request) => {
  const { data } = await req.json();
  let salary = await db.salary.findFirst({
    where: { userId: "cm2ogler90001kyrtwubtq1ky", month: 10, year: 2024 },
  });
  let result = await updateSalaryDays({
    month: 10,
    year: 2024,
    userId: "cm2ogler90001kyrtwubtq1ky",
    newData: data,
  });
  let sort = result.sort((a, b) => a.id - b.id);
  let rawjson = (sort as unknown) ?? [];
  await db.salary.update({ where: { id: salary?.id }, data: { day: rawjson } });
  return Response.json({ result }, { status: 201 });
};
