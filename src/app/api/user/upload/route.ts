import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { postImage, saveImageUser } from "@/lib/function";

export const POST = async (req: Request) => {
  const { userId, img, name } = await req.json();
  let users = await getUserById(userId);
  let result = await postImage(img, users?.username!, "user");
  if (result?.error)
    return Response.json(
      { error: "error while upload image" },
      { status: 400 },
    );
  let userImg = result?.success;
  // let userImg = await saveImageUser(img, users?.username!);
  let data = {
    name,
    userImg,
  };
  let user = await db.user.update({ where: { id: userId }, data });
  return Response.json({ name: user.name, img: user.userImg }, { status: 200 });
};
