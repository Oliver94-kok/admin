"use server";

import { checkUsername } from "@/data/user";
import { db } from "@/lib/db";
import { hashPassword, randomPassword } from "@/lib/function";

export const AddUser = async (name: string) => {
  let checkuser = await checkUsername();
  let password = await randomPassword();
  let hash = await hashPassword(password);
  if (checkuser) {
    let username = "";
    let lastest = parseInt(checkuser.username.substring(4));
    if (lastest < 10) {
      username = `user0${lastest + 1}`;
    } else {
      username = `user${lastest}`;
    }
    let data = {
      name,
      username,
      password: hash,
    };
    await db.user.create({ data });
    return { username, password };
  } else {
    let data = {
      name,
      username: "user01",
      password: hash,
    };
    await db.user.create({ data });
    return { username: "user01", password };
  }
};
