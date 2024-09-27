import { db } from "@/lib/db";

export const GET = async () => {
  const data = await db.branch.findMany();
  return Response.json({ data }, { status: 200 });
};

export const POST = async (req: Request) => {
  const { data } = await req.json();
  const jsonArray = data;
  try {
    const result = await db.branch.createMany({
      data: jsonArray,
      skipDuplicates: true,
    });
    return Response.json({ count: result.count }, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json({ error }, { status: 400 });
  }
  return Response.json({ data }, { status: 200 });
};
