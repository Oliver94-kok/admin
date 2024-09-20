import { db } from "@/lib/db";
import { saveImageUser } from "@/lib/function";

export const POST = async (req: Request) => {
  const { userId, img } = await req.json();
  let userImg = await saveImageUser(img);
  let data = {
    userImg,
  };
  let user = await db.user.update({ where: { id: userId }, data });
  return Response.json({ user }, { status: 200 });
};
