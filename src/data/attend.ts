"use server";
import { db } from "@/lib/db";
import { AttendsInterface } from "@/types/attendents";
import {DateTime} from 'luxon';
interface dataAttend {
  create?: AttendsInterface;
  userId?: string;
}

// export const createAttend = async ({ create }: dataAttend) => {
//   let data = {
//     userId: create?.userId,
//     clockIn: null,
//     clockOut: create?.clockOut,

//   };

//   let d = await db.attends.create({ data });
//   return d;
// };

export const checkClockIn = async (userId: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM attends WHERE userId=${userId} AND date(clockIn) = CURDATE()`;
  if (Array.isArray(a)) {
    const firstRow = a[0];
    const jsonResult = firstRow;
    return jsonResult;
  } else {
    const jsonResult = a;
    return jsonResult;
  }
};

export const checkClockLate = async (userid: string) => {
  let a: AttendsInterface[] =
    await db.$queryRaw`SELECT * FROM attends WHERE userId=${userid} AND date(clockIn) = CURDATE()`;
  let checkLate = a[0];
  let hours = checkLate.clockIn.getHours();
  let minutes = checkLate.clockIn.getMinutes();
  let late;
  if (hours == 9) {
    if (minutes > 10) {
      late = 1;
    }
  } else if (hours > 9) {
    late = 1;
  } else {
    late = 0;
  }
  let year = checkLate.clockIn.getFullYear();
  let month = checkLate.clockIn.getMonth() + 1;
  let day = checkLate.clockIn.getDate();
  return { late, year, month, day };
};

export const getDataByDate = async (tarikh: string) => {
  let day = tarikh.split("/");
  let year = new Date().getFullYear();
  let d = `${year}-${day[1]}-${day[0]}`;

  let data: AttendsInterface[] =
    await db.$queryRaw`SELECT a.userId, u.username,u.name,u.userImg, a.clockIn, a.clockOut,a.img,a.workingHour
    FROM attends AS a
    JOIN user AS u ON a.userId = u.id
    WHERE date(a.clockIn) = date(${d}) OR date(a.clockOut) = date(${d})`;
  console.log(d);
  console.log(data);
  return data;
};
export const createNotClockIn=async(clockOut:Date,userId:string,)=>{
  try {
    let fine = await db.salary.findFirst({where:{userId,month:new Date().getMonth()+1,year:new Date().getFullYear()}})
    let late = 0;
    if(fine?.late!>=1) {late =100}else{late=100} 
    await db.attends.create({data:{userId,fine:late,clockOut}})

    return {success:"success"}
  } catch (error) {
    return null
  }
}

export const calOverTime=async(userId:string,clockOut: Date)=>{
  let user =await db.attendBranch.findFirst({where:{userId}})
  const endTime = DateTime.isDateTime(clockOut) 
    ? clockOut 
    : (clockOut instanceof Date 
      ? DateTime.fromJSDate(clockOut) 
      : DateTime.fromISO(clockOut));

  // Ensure endTime is valid
  if (!endTime.isValid) {
    throw new Error("Invalid clockOut time provided");
  }
  if(user){
    let out = user.clockOut;
    const [regularHours, regularMinutes] = out!.split(":").map(Number);
    const regularEndTime = endTime.set({
      hour: regularHours,
      minute: regularMinutes,
      second: 0,
      millisecond: 0
    });
    console.log("🚀 ~ calOverTime ~ regularEndTime:", regularEndTime)
  
    const diff = endTime.diff(regularEndTime, "minutes");
    console.log("🚀 ~ calOverTime ~ endTime:", endTime)

    // Return the maximum of 0 and the calculated overtime
    return Math.max(0, diff.minutes);

  }
}