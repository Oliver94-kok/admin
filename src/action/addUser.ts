"use server";

import { checkUsername } from "@/data/user";
import { db } from "@/lib/db";
import { hashPassword, randomPassword, roleAdmin } from "@/lib/function";

export const AddUser = async (name: string, role: string) => {
  let checkuser = await checkUsername();
  let password = await randomPassword();
  let hash = await hashPassword(password);
  let team = await roleAdmin(role);
  if (checkuser) {
    let username = "";
    let lastest = parseInt(checkuser.username.substring(5));
    if (lastest < 9) {
      username = `user0${lastest + 1}`;
    } else {
      username = `user${lastest + 1}`;
    }
    let data = {
      name,
      username,
      password: hash,
    };
    let user = await db.user.create({
      data: {
        name,
        username,
        password: hash,
        isLogin: false,
      },
    });
    await db.salary.create({
      data: {
        userId: user.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });
    await db.notificationUser.create({ data: { userId: user.id } });
    await db.attendBranch.create({ data: { team: team!, userId: user.id } });
    return { username, password };
  } else {
    let data = {
      name,
      username: "user01",
      password: hash,
      isLogin: false,
    };
    let user = await db.user.create({ data });
    await db.salary.create({
      data: {
        userId: user.id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      },
    });
    await db.attendBranch.create({ data: { team: team!, userId: user.id } });
    await db.notificationUser.create({ data: { userId: user.id } });
    return { username: "user01", password };
  }
};
