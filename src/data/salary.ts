import { db } from "@/lib/db";
import { checkClockLate } from "./attend";
import { Prisma } from "@prisma/client";

export const AddSalary = async (userid: string) => {
  const user = await checkClockLate(userid);

  let salary = await db.salary.findFirst({
    where: { userId: userid, month: user.month, year: user.year },
  });
  let lateFine;

  if (salary) {
    if (salary.late) {
      if (salary.late >= 1) {
        lateFine = 100;
      } else {
        lateFine = 50;
      }
    }
    let salarys = salary.salary as Prisma.JsonArray;
    let ns;
    if (user.late == 1) {
      ns = {
        day: user.day,
        late: {
          fine: lateFine,
        },
      };
    } else {
      ns = {
        day: user.day,
        late: null,
      };
    }
    salarys.push(ns);
    let total = 0;
    // salarys.map((e) => {
    //   total = total + e["total"];
    // });
    // console.log(total)
    // // let data = {
    //   salary: s,
    //   late: Number(salary.late) + 1,
    //   total,
    // };
    // let update = await db.salary.update({ where: { id: salary.id }, data: {} });
  }
};
