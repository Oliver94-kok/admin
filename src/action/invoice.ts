"use server";

import { db } from "@/lib/db";
import { getAllresultAttend } from "@/lib/salaryPrintService";
import { SalaryRecord } from "@/types/salary2";
import axios from "axios";
import { cookies } from "next/headers";

export async function setDataCookies(data: any) {
  cookies().delete("pageData");
  console.log("🚀 ~ setDataCookies ~ data:", data);
  cookies().set("pageData", JSON.stringify(data));
}
export async function getData() {
  const cookie = cookies().get("pageData");
  let data = cookie ? JSON.parse(cookie.value) : null;
  var results: SalaryRecord[] = [];
  for (const id of data) {
    let salary = await db.salary.findFirst({
      where: { id },
      select: {
        id: true,
        month: true,
        year: true,
        workingDay: true,
        workingHoour: true,
        fineLate: true,
        fineNoClockIn: true,
        fineNoClockOut: true,
        late: true,
        notClockIn: true,
        overTimeHour: true,
        overTime: true,
        total: true,
        perDay: true,
        bonus: true,
        allowance: true,
        cover: true,
        userId: true,
        users: {
          select: {
            name: true,
            AttendBranch: { select: { team: true, branch: true } },
          },
        },
      },
    });

    if (salary) {
      let result = await getAllresultAttend(
        salary?.userId!,
        salary?.month!,
        salary?.year!,
      );
      let data = {
        salary,
        result,
      };
      results.push(data);
    }
  }
  return results;
}
