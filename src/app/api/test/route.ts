import { db } from "@/lib/db";
import { saveImageUser } from "@/lib/function";

export const POST = async (req: Request) => {
  const { name, img } = await req.json();
  let d = saveImageUser(img, name);

  return Response.json({ d }, { status: 201 });
};
