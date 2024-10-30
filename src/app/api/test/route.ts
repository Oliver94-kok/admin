import { db } from "@/lib/db";
import { updateSalaryDays } from "@/lib/function";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");
  const type = searchParams.get("type");
  console.log("🚀 ~ GET ~ type:", type);
  if (userId) {
    var select;
    if (type == "clock") {
      select = { clock: true };
    } else {
      select = {
        leave: true,
      };
    }
    var user = await db.notificationUser.findFirst({
      where: { userId },
      select: select,
    });
    return Response.json({ user }, { status: 200 });
  }

  return Response.json({ error: "no id" }, { status: 400 });
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
