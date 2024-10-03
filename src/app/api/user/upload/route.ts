import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { saveImageUser } from "@/lib/function";

export const POST = async (req: Request) => {
  const { userId, img, name } = await req.json();
  let users = await getUserById(userId);
  let userImg = await saveImageUser(img, users?.username!);
  let data = {
    name,
    userImg,
  };
  let user = await db.user.update({ where: { id: userId }, data });
  return Response.json({ name: user.name, img: user.userImg }, { status: 200 });
};
